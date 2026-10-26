import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const n01Workdir = process.env.SOUL_N01_WORKDIR;
if (!n01Workdir || !existsSync(resolve(n01Workdir, 'scripts/soul-mesh-server-entry.mjs'))) {
  throw new Error('SOUL_N01_WORKDIR must point to the checked-out N01 runtime source.');
}

const n01Port = Number(process.env.SOUL_TEST_N01_PORT ?? 18181);
const n02Port = Number(process.env.SOUL_TEST_N02_PORT ?? 18183);
const n01Url = `http://127.0.0.1:${n01Port}`;
const n02Url = `http://127.0.0.1:${n02Port}`;
const sharedTestSecret = randomBytes(32).toString('hex');
const baseEnv = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  TMPDIR: process.env.TMPDIR,
  NODE_ENV: 'test',
};
const children = [];
const output = new Map();

function start(name, command, args, cwd, env) {
  const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  output.set(name, '');
  const collect = chunk => output.set(name, (output.get(name) + String(chunk)).slice(-12000));
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  child.on('error', error => collect(String(error)));
  return child;
}

function assertLive(child, name) {
  if (child.exitCode !== null || child.signalCode !== null) {
    throw new Error(`${name} exited before E2E completed. Logs:\n${output.get(name)}`);
  }
}

async function jsonResponse(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
  const body = await response.json().catch(() => null);
  return { response, body };
}

async function waitForHealth(name, child, url, expectedNucleus) {
  let lastError = 'no response';
  for (let attempt = 0; attempt < 60; attempt += 1) {
    assertLive(child, name);
    try {
      const { response, body } = await jsonResponse(url + '/mesh/health');
      if (response.ok && body?.nucleus === expectedNucleus) return body;
      lastError = `HTTP ${response.status}: ${JSON.stringify(body)}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, 250));
  }
  throw new Error(`${name} health did not become ready: ${lastError}\n${output.get(name)}`);
}

async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise(resolveExit => child.once('exit', resolveExit)),
    new Promise(resolveDelay => setTimeout(resolveDelay, 4000)),
  ]);
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
}

try {
  const n01Env = {
    ...baseEnv,
    SOUL_MESH_SECRET: sharedTestSecret,
    SOUL_MESH_N01_HOST: '127.0.0.1',
    SOUL_MESH_N01_PORT: String(n01Port),
    SOUL_MESH_N02_URL: n02Url,
    GEMINI_API_KEY: '',
  };
  const n02Env = {
    ...baseEnv,
    SOUL_MESH_HMAC_SECRET: sharedTestSecret,
    SOUL_MESH_HOST: '127.0.0.1',
    SOUL_MESH_PORT: String(n02Port),
    SOUL_MESH_N01_URL: n01Url + '/api/soul-mesh',
    SOUL_MESH_MAX_REQUEST_BYTES: String(2 * 1024 * 1024),
  };

  // These are the checked-out executable runtimes, launched as independent processes.
  const n01 = start('N01', process.execPath, ['scripts/soul-mesh-server-entry.mjs'], resolve(n01Workdir), n01Env);
  const n02 = start('N02', process.execPath, [
    '--experimental-transform-types',
    '--loader', './scripts/n02-ts-extension-loader.mjs',
    'scripts/soul-mesh-server.ts',
  ], process.cwd(), n02Env);

  const [n01Health, n02Health] = await Promise.all([
    waitForHealth('N01', n01, n01Url, 'N01'),
    waitForHealth('N02', n02, n02Url, 'N02'),
  ]);

  const { response: readyResponse, body: readyBody } = await jsonResponse(n02Url + '/ready');
  if (!readyResponse.ok || readyBody?.ready !== true || readyBody?.checks?.meshSecretConfigured !== true) {
    throw new Error('N02 readiness/authentication precondition failed: ' + JSON.stringify(readyBody));
  }

  const { response: discoveryResponse, body: discovery } = await jsonResponse(n02Url + '/mesh/discovery');
  if (!discoveryResponse.ok || discovery?.nucleus !== 'N02' || discovery?.evidenceState !== 'RUNTIME_BOUND'
    || discovery?.runtimeBound !== true || !discovery?.executableCapabilities?.includes('mesh.peer.ping')) {
    throw new Error('N02 did not expose the live capability runtime through discovery: ' + JSON.stringify(discovery));
  }

  // This request invokes the actual N01 SuperGPU/router, which sends an authenticated
  // HTTP request to the actual N02 listener. N02 then makes a second authenticated
  // HTTP request from its own process back to N01. Both responses are HMAC-verified
  // by the opposite runtime before this assertion can pass.
  const correlationId = randomUUID();
  const { response: roundTripResponse, body: roundTrip } = await jsonResponse(n01Url + '/mesh/test/execute', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ capability: 'mesh.peer.ping', payload: { probe: 'runtime-pair-ci' }, correlationId }),
  });
  const forwarded = roundTrip?.result;
  const n02AgentEnvelope = forwarded?.output;
  const n02Output = n02AgentEnvelope?.result;
  if (!roundTripResponse.ok || roundTrip?.ok !== true || roundTrip?.nucleus !== 'N01'
    || roundTrip?.correlationId !== correlationId
    || forwarded?.owner !== 'N02' || forwarded?.execution !== 'remote'
    || n02AgentEnvelope?.status !== 'ok' || n02AgentEnvelope?.nucleus !== 'N02'
    || n02AgentEnvelope?.capability !== 'mesh.peer.ping' || n02AgentEnvelope?.correlationId !== correlationId
    || n02Output?.ok !== true || n02Output?.nucleus !== 'N02' || n02Output?.peer !== 'N01'
    || n02Output?.parentCorrelationId !== correlationId
    || n02Output?.peerResponse?.ok !== true || n02Output?.peerResponse?.nucleus !== 'N01'
    || n02Output?.authentication !== 'HMAC_VERIFIED') {
    throw new Error('Authenticated bidirectional N01↔N02 runtime route failed: ' + JSON.stringify(roundTrip));
  }

  // Verify the pinned N01 candidate exposes the native prefrontal optimizer over
  // the same authenticated Mesh protocol used by the actual N02 peer client.
  const previousPeerUrl = process.env.SOUL_MESH_N01_URL;
  const previousHmacSecret = process.env.SOUL_MESH_HMAC_SECRET;
  process.env.SOUL_MESH_N01_URL = n01Url + '/api/soul-mesh';
  process.env.SOUL_MESH_HMAC_SECRET = sharedTestSecret;
  let prefrontalResponse;
  try {
    const { requestPeerCapability } = await import('../api/soul-mesh/peer-client.ts');
    prefrontalResponse = await requestPeerCapability(
      'N01',
      'neural.prefrontal.optimize@1.0.0',
      {
        goalId: 'n02-process-pair.prefrontal',
        description: 'Verify prefrontal optimization through authenticated N01 Mesh',
        weakPoint: 'mesh trace correlation retry idempotency',
        priority: 0.9,
        context: { source: 'N02-real-process-e2e', additiveOnly: true },
      },
      20_000,
    );
  } finally {
    if (previousPeerUrl === undefined) delete process.env.SOUL_MESH_N01_URL;
    else process.env.SOUL_MESH_N01_URL = previousPeerUrl;
    if (previousHmacSecret === undefined) delete process.env.SOUL_MESH_HMAC_SECRET;
    else process.env.SOUL_MESH_HMAC_SECRET = previousHmacSecret;
  }
  const prefrontal = prefrontalResponse?.payload;
  if (prefrontalResponse?.source !== 'N01' || prefrontalResponse?.target !== 'N02'
    || prefrontalResponse?.kind !== 'response'
    || prefrontalResponse?.capability !== 'neural.prefrontal.optimize@1.0.0'
    || !prefrontalResponse?.correlationId
    || prefrontal?.status !== 'completed'
    || prefrontal?.agentId !== 'N01.neocortex-prefrontal-optimizer'
    || prefrontal?.correlationId !== prefrontalResponse.correlationId
    || prefrontal?.traceId !== prefrontalResponse.correlationId
    || prefrontal?.decision?.inhibited !== false
    || prefrontal?.decision?.selectedNucleus !== 'N01'
    || prefrontal?.execution?.nucleus !== 'N01'
    || prefrontal?.execution?.backend !== 'IN_PROCESS'
    || !Number.isFinite(prefrontal?.execution?.latencyMs)
    || !Array.isArray(prefrontal?.optimization?.actions)
    || !prefrontal.optimization.actions.some(action => action.id === 'preserve-correlation')) {
    throw new Error('Authenticated N02→N01 prefrontal-agent E2E failed: ' + JSON.stringify({
      response: prefrontalResponse,
      prefrontal,
    }));
  }

  // Legacy v1 envelope compatibility: authenticate a request arriving through N01's
  // preserved legacy surface, require it to translate into the real modern N02 route,
  // and validate the legacy response HMAC rather than treating HTTP 200 as sufficient.
  const legacyCorrelationId = randomUUID();
  const legacyUnsigned = {
    version: '1.0',
    contractVersion: '1.1.0',
    messageId: randomUUID(),
    source: 'N02',
    target: 'N01',
    timestamp: Date.now(),
    nonce: randomUUID(),
    correlationId: legacyCorrelationId,
    type: 'CAPABILITY_REQUEST',
    payload: { capability: 'mesh.peer.ping', payload: { probe: 'legacy-v1-compatibility' } },
  };
  const legacyHmac = createHmac('sha256', sharedTestSecret)
    .update(JSON.stringify(legacyUnsigned), 'utf8')
    .digest('hex');
  const { response: legacyResponse, body: legacyBody } = await jsonResponse(n01Url + '/api/soul-mesh', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-correlation-id': legacyCorrelationId },
    body: JSON.stringify({ ...legacyUnsigned, hmac: legacyHmac }),
  });
  const { hmac: legacyResponseHmac, ...legacyResponseUnsigned } = legacyBody ?? {};
  const expectedLegacyResponseHmac = createHmac('sha256', sharedTestSecret)
    .update(JSON.stringify(legacyResponseUnsigned), 'utf8')
    .digest('hex');
  const actualLegacyResponseHmac = Buffer.from(String(legacyResponseHmac ?? ''), 'hex');
  const expectedLegacyResponseHmacBytes = Buffer.from(expectedLegacyResponseHmac, 'hex');
  if (!legacyResponse.ok || legacyBody?.version !== '1.0' || legacyBody?.contractVersion !== '1.1.0'
    || legacyBody?.source !== 'N01' || legacyBody?.target !== 'N02'
    || legacyBody?.correlationId !== legacyCorrelationId || legacyBody?.type !== 'TASK_RESULT'
    || actualLegacyResponseHmac.length !== expectedLegacyResponseHmacBytes.length
    || !timingSafeEqual(actualLegacyResponseHmac, expectedLegacyResponseHmacBytes)
    || legacyBody?.payload?.status !== 'ok' || legacyBody?.payload?.nucleus !== 'N02'
    || legacyBody?.payload?.correlationId !== legacyCorrelationId
    || legacyBody?.payload?.result?.ok !== true || legacyBody?.payload?.result?.peer !== 'N01'
    || legacyBody?.payload?.result?.authentication !== 'HMAC_VERIFIED') {
    throw new Error('N01 legacy v1 → modern N02 route failed contract/HMAC/runtime assertions: ' + JSON.stringify(legacyBody));
  }

  console.log(JSON.stringify({
    system: 'SOUL',
    stage: 'N01_N02_REAL_PROCESS_PAIR_E2E',
    status: 'PASS',
    evidence: {
      independentProcesses: true,
      n01Health: n01Health.nucleus,
      n02Health: n02Health.nucleus,
      n02CapabilityRuntimeBound: true,
      n01ToN02: { status: 'PASS', targetCapability: 'mesh.peer.ping', hmacVerified: true },
      legacyEnvelopeCompatibility: { status: 'PASS', requestAuthentication: 'HMAC_ACCEPTED', responseAuthentication: 'HMAC_VERIFIED', runtimeExecuted: true },
      n02ProcessToN01: {
        status: 'PASS',
        peer: n02Output.peerResponse.nucleus,
        hmacVerified: n02Output.authentication === 'HMAC_VERIFIED',
        correlationId: n02Output.peerCorrelationId,
      },
      correlationId,
      secretSource: 'ephemeral process environment; not persisted',
      publicDeployment: 'NOT_TESTED_BY_LOCAL_PROCESS-PAIR',
    },
    checkedAt: new Date().toISOString(),
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    system: 'SOUL',
    stage: 'N01_N02_REAL_PROCESS_PAIR_E2E',
    status: 'FAILED',
    error: error instanceof Error ? error.message : String(error),
    logs: Object.fromEntries(output),
  }, null, 2));
  process.exitCode = 1;
} finally {
  await Promise.all(children.reverse().map(stop));
}
