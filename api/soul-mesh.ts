import { SoulMeshCapabilityRegistry } from '../src/soul-mesh/SoulMeshCapabilityRegistry';
import { executeN02Capability } from '../services/soulMeshRuntime';
import { assertSoulMeshWireMessage, SOUL_NUCLEI, SOUL_MESH_PROTOCOL, type SoulNucleusId } from '../src/soul-mesh/SoulMeshWireContract';
import { createSecureFields, signMeshMessage, verifyMeshMessage, type SecureMeshMessage } from '../src/soul-mesh/SoulMeshSecurity';

type NucleusId = SoulNucleusId;
const NUCLEUS_ID: NucleusId = 'N02';
const PEERS = SOUL_NUCLEI.filter(n => n !== NUCLEUS_ID);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_SEEN_NONCES = 10_000;
const seenNonces = new Set<string>();
const registry = new SoulMeshCapabilityRegistry();

for (const capability of registry.getAll()) {
  if (capability.execution === 'cognitive-runtime') {
    registry.registerHandler(capability.id, payload => executeN02Capability(capability.id, (payload ?? {}) as Parameters<typeof executeN02Capability>[1]));
  }
}

const hmacSecret = () => String((globalThis as any).process?.env?.SOUL_MESH_HMAC_SECRET ?? '').trim();
const authDisabled = () => String((globalThis as any).process?.env?.MESH_AUTH_DISABLED ?? 'false').toLowerCase() === 'true';
const token = () => String((globalThis as any).process?.env?.SOUL_MESH_TOKEN ?? '').trim();
const production = () => String((globalThis as any).process?.env?.NODE_ENV ?? '').toLowerCase() === 'production';

function rememberNonce(nonce: string): void {
  if (seenNonces.size >= MAX_SEEN_NONCES) {
    const iterator = seenNonces.values();
    const oldest = iterator.next().value;
    if (typeof oldest === 'string') seenNonces.delete(oldest);
  }
  seenNonces.add(nonce);
}

function authorized(req: any, message: SecureMeshMessage): void {
  if (authDisabled()) return;
  const secret = hmacSecret();
  if (secret) {
    verifyMeshMessage(message, secret, Date.now(), 30_000, seenNonces);
    return;
  }
  const configuredToken = token();
  if (!configuredToken) {
    if (production()) throw new Error('SOUL_MESH_AUTH_NOT_CONFIGURED');
    return;
  }
  if (req.headers?.authorization !== `Bearer ${configuredToken}`) throw new Error('SOUL_MESH_UNAUTHORIZED');
}

function makeResponse(source: NucleusId, correlationId: string, capability: string, kind: 'response' | 'error', payload: unknown) {
  const base = {
    protocol: SOUL_MESH_PROTOCOL,
    id: crypto.randomUUID(),
    correlationId,
    source: NUCLEUS_ID,
    target: source,
    kind,
    capability,
    payload,
    timestamp: Date.now(),
  } as const;
  const secret = hmacSecret();
  if (!secret || authDisabled()) return base;
  const secure = createSecureFields();
  const signed = { ...base, ...secure, type: kind === 'response' ? 'TASK_RESULT' : 'ERROR' } as Omit<SecureMeshMessage, 'hmac'>;
  return { ...base, ...secure, type: kind === 'response' ? 'TASK_RESULT' : 'ERROR', hmac: signMeshMessage(signed, secret) };
}

const send = (res: any, status: number, body: unknown) => {
  res.setHeader?.('content-type', 'application/json; charset=utf-8');
  res.setHeader?.('cache-control', 'no-store');
  res.setHeader?.('x-soul-mesh-protocol', SOUL_MESH_PROTOCOL);
  return res.status(status).json(body);
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  res.setHeader?.('allow', 'POST');

  const rawLength = Number(req.headers?.['content-length'] ?? 0);
  if (Number.isFinite(rawLength) && rawLength > MAX_BODY_BYTES) return send(res, 413, { error: 'PAYLOAD_TOO_LARGE' });

  let m = req.body;
  if (typeof m === 'string') {
    try { m = JSON.parse(m); } catch { return send(res, 400, { error: 'INVALID_JSON' }); }
  }
  try { assertSoulMeshWireMessage(m); } catch (error) {
    return send(res, 400, { error: error instanceof Error ? error.message : 'INVALID_SOUL_MESH_MESSAGE' });
  }

  if (m.target !== NUCLEUS_ID || m.source === NUCLEUS_ID) return send(res, 400, { error: 'INVALID_SOUL_MESH_ROUTE' });

  try {
    authorized(req, m as SecureMeshMessage);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SOUL_MESH_UNAUTHORIZED';
    const status = code === 'SOUL_MESH_AUTH_NOT_CONFIGURED' ? 503 : code.includes('UNAUTHORIZED') || code.includes('HMAC') || code.includes('REPLAY') ? 401 : 400;
    return send(res, status, { error: code });
  }

  if (m.kind !== 'request') return send(res, 202, { accepted: true, correlationId: m.correlationId, source: NUCLEUS_ID, target: m.source });

  if (m.capability === 'mesh.ping') return send(res, 200, makeResponse(m.source, m.correlationId, 'mesh.ping', 'response', {
    ok: true, handler: 'N02.mesh.ping', echoed: m.payload ?? null, processedAt: Date.now(),
  }));

  if (m.capability === 'mesh.describe') return send(res, 200, makeResponse(m.source, m.correlationId, 'mesh.describe', 'response', {
    nucleus: NUCLEUS_ID,
    peers: PEERS,
    inChannels: PEERS.map(p => `N02.IN.${p}`),
    outChannels: PEERS.map(p => `N02.OUT.${p}`),
    capabilities: registry.getAll().map(c => ({ id: c.id, version: c.version, execution: c.execution, executable: registry.canExecute(c.id) })),
    status: 'online',
    protocol: SOUL_MESH_PROTOCOL,
  }));

  if (m.capability === 'capability.list') return send(res, 200, makeResponse(m.source, m.correlationId, 'capability.list', 'response', {
    nucleus: NUCLEUS_ID,
    capabilities: registry.getAll().map(c => ({ ...c, executable: registry.canExecute(c.id) })),
  }));

  if (!registry.has(m.capability)) return send(res, 501, makeResponse(m.source, m.correlationId, m.capability, 'error', {
    code: 'CAPABILITY_NOT_DECLARED', nucleus: NUCLEUS_ID, capability: m.capability,
  }));
  if (!registry.canExecute(m.capability)) return send(res, 501, makeResponse(m.source, m.correlationId, m.capability, 'error', {
    code: 'CAPABILITY_HANDLER_NOT_REGISTERED', nucleus: NUCLEUS_ID, capability: m.capability,
  }));

  try {
    const payload = await registry.execute(m.capability, m.payload);
    return send(res, 200, makeResponse(m.source, m.correlationId, m.capability, 'response', payload));
  } catch (error) {
    return send(res, 500, makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_EXECUTION_ERROR', nucleus: NUCLEUS_ID, capability: m.capability,
      message: error instanceof Error ? error.message : String(error),
    }));
  }
}
