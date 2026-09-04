import { SoulMeshCapabilityRegistry } from '../src/soul-mesh/SoulMeshCapabilityRegistry';
import { executeN02Capability } from '../services/soulMeshRuntime';
import { normalizeSoulMeshWireMessage, SOUL_NUCLEI, SOUL_MESH_PROTOCOL, type SoulNucleusId } from '../src/soul-mesh/SoulMeshWireContract';
import { createSecureFields, signMeshMessage, verifyMeshMessage, type SecureMeshMessage } from '../src/soul-mesh/SoulMeshSecurity';
import { meshResilience } from './soul-mesh/resilience';

type NucleusId = SoulNucleusId;
const NUCLEUS_ID: NucleusId = 'N02';
const PEERS = SOUL_NUCLEI.filter(n => n !== NUCLEUS_ID);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_SEEN_NONCES = 10_000;
const MAX_SEEN_MESSAGES = 10_000;
const REPLAY_WINDOW_MS = 5 * 60_000;
const seenNonces = new Set<string>();
const seenMessageIds = new Map<string, number>();
const registry = new SoulMeshCapabilityRegistry();

for (const capability of registry.getAll()) {
  if (capability.execution === 'cognitive-runtime') {
    registry.registerHandler(capability.id, payload => executeN02Capability(capability.id, (payload ?? {}) as Parameters<typeof executeN02Capability>[1]));
  }
}

const hmacSecret = () => String((globalThis as any).process?.env?.SOUL_MESH_HMAC_SECRET ?? '').trim();
const production = () => String((globalThis as any).process?.env?.NODE_ENV ?? '').toLowerCase() === 'production';
const authDisabled = () => !production() && String((globalThis as any).process?.env?.MESH_AUTH_DISABLED ?? 'false').toLowerCase() === 'true';
const token = () => String((globalThis as any).process?.env?.SOUL_MESH_TOKEN ?? '').trim();

function recordInboundFailure(source: string, capability: string, error: unknown, attempt = 0): void {
  meshResilience.failure(source || 'unknown', capability || '__invalid__', error, attempt, false);
}

function pruneSet<T>(set: Set<T>, maxSize: number): void {
  while (set.size >= maxSize) {
    const oldest = set.values().next().value;
    if (oldest === undefined) break;
    set.delete(oldest);
  }
}

function pruneMessages(now = Date.now()): void {
  for (const [id, at] of seenMessageIds) {
    if (now - at > REPLAY_WINDOW_MS) seenMessageIds.delete(id);
  }
  while (seenMessageIds.size >= MAX_SEEN_MESSAGES) {
    const oldest = seenMessageIds.keys().next().value;
    if (typeof oldest !== 'string') break;
    seenMessageIds.delete(oldest);
  }
}

function acceptMessageId(messageId: string): boolean {
  pruneMessages();
  if (seenMessageIds.has(messageId)) return false;
  seenMessageIds.set(messageId, Date.now());
  return true;
}

function authorized(req: any, message: SecureMeshMessage): void {
  if (authDisabled()) return;
  const secret = hmacSecret();
  if (secret) {
    pruneSet(seenNonces, MAX_SEEN_NONCES);
    verifyMeshMessage(message, secret, Date.now(), 30_000, seenNonces);
    return;
  }
  const configuredToken = token();
  if (!configuredToken) throw new Error('SOUL_MESH_AUTH_NOT_CONFIGURED');
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
  const type = kind === 'response' ? (capability === 'mesh.ping' ? 'PING' : capability === 'mesh.health' ? 'HEALTH' : 'TASK_RESULT') : 'ERROR';
  const signed = { ...base, ...secure, type } as Omit<SecureMeshMessage, 'hmac'>;
  return { ...base, ...secure, type, hmac: signMeshMessage(signed, secret) };
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
  if (Number.isFinite(rawLength) && rawLength > MAX_BODY_BYTES) {
    const error = new Error('PAYLOAD_TOO_LARGE');
    recordInboundFailure('unknown', '__transport__', error);
    return send(res, 413, { error: error.message });
  }

  let m;
  try {
    m = normalizeSoulMeshWireMessage(req.body);
  } catch (error) {
    recordInboundFailure('unknown', '__parse__', error);
    return send(res, 400, { error: error instanceof Error ? error.message : 'INVALID_SOUL_MESH_MESSAGE' });
  }

  if (m.target !== NUCLEUS_ID || m.source === NUCLEUS_ID) {
    const error = new Error('INVALID_SOUL_MESH_ROUTE');
    recordInboundFailure(m.source, m.capability, error);
    return send(res, 400, { error: error.message });
  }

  try {
    authorized(req, m as SecureMeshMessage);
  } catch (error) {
    recordInboundFailure(m.source, m.capability, error);
    const code = error instanceof Error ? error.message : 'SOUL_MESH_UNAUTHORIZED';
    const status = code === 'SOUL_MESH_AUTH_NOT_CONFIGURED' ? 503 : code.includes('UNAUTHORIZED') || code.includes('HMAC') || code.includes('REPLAY') ? 401 : 400;
    return send(res, status, { error: code });
  }

  if (m.kind !== 'request') return send(res, 202, { accepted: true, correlationId: m.correlationId, source: NUCLEUS_ID, target: m.source });

  if (!acceptMessageId(m.messageId ?? m.id)) {
    const error = new Error('SOUL_MESH_DUPLICATE_MESSAGE');
    recordInboundFailure(m.source, m.capability, error);
    return send(res, 409, {
      error: error.message,
      correlationId: m.correlationId,
      messageId: m.messageId ?? m.id,
      idempotent: true,
    });
  }

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

  if (!registry.has(m.capability)) {
    const error = new Error('CAPABILITY_NOT_DECLARED');
    recordInboundFailure(m.source, m.capability, error);
    return send(res, 501, makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: error.message, nucleus: NUCLEUS_ID, capability: m.capability,
    }));
  }
  if (!registry.canExecute(m.capability)) {
    const error = new Error('CAPABILITY_HANDLER_NOT_REGISTERED');
    recordInboundFailure(m.source, m.capability, error);
    return send(res, 501, makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: error.message, nucleus: NUCLEUS_ID, capability: m.capability,
    }));
  }

  try {
    const payload = await registry.execute(m.capability, m.payload);
    return send(res, 200, makeResponse(m.source, m.correlationId, m.capability, 'response', payload));
  } catch (error) {
    recordInboundFailure(m.source, m.capability, error);
    return send(res, 500, makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_EXECUTION_ERROR', nucleus: NUCLEUS_ID, capability: m.capability,
      message: error instanceof Error ? error.message : String(error),
    }));
  }
}
