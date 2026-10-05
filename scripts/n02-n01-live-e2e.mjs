import { createHmac, randomUUID } from 'node:crypto';

const n01Url = (process.env.SOUL_MESH_N01_URL ?? '').trim().replace(/\/$/, '');
const n01Token = (process.env.SOUL_MESH_N01_TOKEN ?? '').trim();
const secret = (process.env.SOUL_MESH_HMAC_SECRET ?? '').trim();
const requireLive = process.env.SOUL_REQUIRE_LIVE_E2E === 'true';
const runAi = process.env.SOUL_N02_LIVE_AI_E2E !== 'false';

function unsignedCanonical(message, nonce) {
  return JSON.stringify({
    protocol: message.protocol,
    contractVersion: message.contractVersion,
    id: message.id,
    correlationId: message.correlationId,
    source: message.source,
    target: message.target,
    kind: message.kind,
    capability: message.capability ?? '',
    payload: message.payload,
    timestamp: message.timestamp,
    transport: message.meta?.transport,
    meta: message.meta ?? null,
    nonce,
  });
}

async function postN01(capability, payload, correlationId = randomUUID()) {
  if (!n01Url) throw new Error('N01_URL_REQUIRED');
  const nonce = randomUUID().replaceAll('-', '').padEnd(32, '0').slice(0, 32);
  const message = {
    protocol: 'soul-mesh/1',
    contractVersion: '1.1.0',
    id: randomUUID(),
    correlationId,
    source: 'N02',
    target: 'N01',
    kind: 'request',
    capability,
    payload,
    timestamp: Date.now(),
    meta: { runtime: 'Eternium-', transport: 'HTTP', encoding: 'json', version: '1.1.0', nonce, traceId: correlationId },
  };
  const headers = { 'content-type': 'application/json', accept: 'application/json', 'x-soul-correlation-id': correlationId };
  if (secret) {
    headers['x-soul-mesh-nonce'] = nonce;
    headers['x-soul-mesh-hmac'] = createHmac('sha256', secret).update(unsignedCanonical(message, nonce), 'utf8').digest('hex');
  } else if (n01Token) {
    headers.authorization = 'Bearer ' + n01Token;
  } else {
    throw new Error('N02_E2E_AUTH_REQUIRED');
  }

  const response = await fetch(n01Url + '/api/soul-mesh', {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error('N01_E2E_HTTP_' + response.status + ':' + JSON.stringify(body));
  if (!body || body.correlationId !== correlationId) throw new Error('N01_E2E_CORRELATION_MISMATCH');
  return body;
}

async function run() {
  if (!n01Url) {
    console.log('N02_N01_LIVE_E2E: BLOCKED');
    console.log('Reason: SOUL_MESH_N01_URL is not configured.');
    if (requireLive) process.exitCode = 2;
    return;
  }

  const ping = await postN01('mesh.ping', { probe: 'n02-n01-live-e2e' });
  const results = { n02ToN01: ping.kind === 'response' };

  if (runAi) {
    for (const capability of ['ai.generate', 'ai.multimodal', 'cognitive-processing']) {
      const correlationId = randomUUID();
      const payload = capability === 'ai.multimodal'
        ? { text: 'SOUL Lote 3 multimodal Mesh E2E probe', contents: [{ role: 'user', parts: [{ text: 'SOUL Lote 3 multimodal Mesh E2E probe' }] }] }
        : { input: 'SOUL Lote 3 Mesh E2E probe; responda apenas OK.', text: 'SOUL Lote 3 Mesh E2E probe; responda apenas OK.' };
      const body = await postN01(
        'mesh.supergpu.execute',
        { task: { id: randomUUID(), capability, payload } },
        correlationId,
      );
      results['n01ToN02:' + capability] = body.kind === 'response' && body.correlationId === correlationId;
    }
  }

  const failed = Object.entries(results).filter(([, ok]) => !ok);
  console.log(JSON.stringify({
    system: 'SOUL',
    stage: 'N02_N01_BIDIRECTIONAL_LIVE_E2E',
    status: failed.length ? 'FAILED' : 'PASS',
    results,
    checkedAt: new Date().toISOString(),
  }, null, 2));

  if (failed.length) process.exitCode = 1;
}

await run();
