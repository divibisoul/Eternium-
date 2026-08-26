import { SoulMeshCapabilityRegistry } from '../src/soul-mesh/SoulMeshCapabilityRegistry';
import { executeN02Capability } from '../services/soulMeshRuntime';

type NucleusId = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';
const NUCLEUS_ID: NucleusId = 'N02';
const NUCLEI = new Set<NucleusId>(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
const PEERS: Exclude<NucleusId, 'N02'>[] = ['N01', 'N03', 'N04', 'N05', 'N06'];
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const registry = new SoulMeshCapabilityRegistry();

for (const capability of registry.getAll()) {
  if (capability.execution === 'cognitive-runtime') {
    registry.registerHandler(capability.id, payload => executeN02Capability(capability.id, (payload ?? {}) as Parameters<typeof executeN02Capability>[1]));
  }
}

const makeResponse = (source: NucleusId, correlationId: string, capability: string, kind: 'response' | 'error', payload: unknown) => ({
  protocol: 'soul-mesh/1' as const,
  id: crypto.randomUUID(), correlationId, source: NUCLEUS_ID, target: source, kind, capability, payload, timestamp: Date.now(),
});

const send = (res: any, status: number, body: unknown) => {
  res.setHeader?.('content-type', 'application/json; charset=utf-8');
  res.setHeader?.('cache-control', 'no-store');
  return res.status(status).json(body);
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return send(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  res.setHeader?.('allow', 'POST');

  const token = process.env.SOUL_MESH_TOKEN;
  if (token && req.headers?.authorization !== `Bearer ${token}`) return send(res, 401, { error: 'UNAUTHORIZED' });

  const rawLength = Number(req.headers?.['content-length'] ?? 0);
  if (Number.isFinite(rawLength) && rawLength > MAX_BODY_BYTES) return send(res, 413, { error: 'PAYLOAD_TOO_LARGE' });

  let m = req.body;
  if (typeof m === 'string') {
    try { m = JSON.parse(m); } catch { return send(res, 400, { error: 'INVALID_JSON' }); }
  }

  if (!m || typeof m !== 'object' || m.protocol !== 'soul-mesh/1' || typeof m.id !== 'string' || typeof m.correlationId !== 'string' ||
      !NUCLEI.has(m.source) || m.target !== NUCLEUS_ID || m.source === NUCLEUS_ID || typeof m.capability !== 'string' || !m.capability.trim()) {
    return send(res, 400, { error: 'INVALID_SOUL_MESH_MESSAGE' });
  }

  if (m.kind !== 'request') return send(res, 200, { accepted: true, correlationId: m.correlationId, source: NUCLEUS_ID, target: m.source });

  if (m.capability === 'mesh.ping') {
    return send(res, 200, makeResponse(m.source, m.correlationId, 'mesh.ping', 'response', {
      ok: true, handler: 'N02.mesh.ping', echoed: m.payload ?? null, processedAt: Date.now(),
    }));
  }

  if (m.capability === 'mesh.describe') {
    return send(res, 200, makeResponse(m.source, m.correlationId, 'mesh.describe', 'response', {
      nucleus: NUCLEUS_ID, peers: [...PEERS],
      inChannels: PEERS.map(p => `N02.IN.${p}`), outChannels: PEERS.map(p => `N02.OUT.${p}`),
      capabilities: registry.getAll().map(c => ({ id: c.id, version: c.version, execution: c.execution, executable: registry.canExecute(c.id) })),
      status: 'online',
    }));
  }

  if (m.capability === 'capability.list') {
    return send(res, 200, makeResponse(m.source, m.correlationId, 'capability.list', 'response', {
      nucleus: NUCLEUS_ID,
      capabilities: registry.getAll().map(c => ({ ...c, executable: registry.canExecute(c.id) })),
    }));
  }

  if (!registry.has(m.capability)) {
    return send(res, 501, makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_NOT_DECLARED', nucleus: NUCLEUS_ID, capability: m.capability,
    }));
  }

  if (!registry.canExecute(m.capability)) {
    return send(res, 501, makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_HANDLER_NOT_REGISTERED', nucleus: NUCLEUS_ID, capability: m.capability,
    }));
  }

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
