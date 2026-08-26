import { SoulMeshCapabilityRegistry } from '../src/soul-mesh/SoulMeshCapabilityRegistry';
import { executeN02Capability } from '../services/soulMeshRuntime';

const NUCLEUS_ID = 'N02' as const;
const NUCLEI = new Set(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
const PEERS = ['N01', 'N03', 'N04', 'N05', 'N06'] as const;

const registry = new SoulMeshCapabilityRegistry();
for (const capability of registry.getAll()) {
  if (capability.execution === 'cognitive-runtime') {
    registry.registerHandler(capability.id, payload => executeN02Capability(capability.id, (payload ?? {}) as any));
  }
}

const makeResponse = (source: string, correlationId: string, capability: string, kind: 'response' | 'error', payload: unknown) => ({
  protocol: 'soul-mesh/1',
  id: crypto.randomUUID(),
  correlationId,
  source: NUCLEUS_ID,
  target: source,
  kind,
  capability,
  payload,
  timestamp: Date.now(),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const token = process.env.SOUL_MESH_TOKEN;
  if (token && req.headers.authorization !== `Bearer ${token}`) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const m = req.body;
  if (!m || m.protocol !== 'soul-mesh/1' || !m.id || !m.correlationId || !NUCLEI.has(m.source) || m.target !== NUCLEUS_ID || m.source === NUCLEUS_ID || !m.capability) {
    return res.status(400).json({ error: 'INVALID_SOUL_MESH_MESSAGE' });
  }

  if (m.kind !== 'request') return res.status(200).json({ accepted: true, correlationId: m.correlationId, source: NUCLEUS_ID, target: m.source });

  if (m.capability === 'mesh.ping') {
    return res.status(200).json(makeResponse(m.source, m.correlationId, 'mesh.ping', 'response', {
      ok: true, handler: 'N02.mesh.ping', echoed: m.payload, processedAt: Date.now(),
    }));
  }

  if (m.capability === 'mesh.describe') {
    return res.status(200).json(makeResponse(m.source, m.correlationId, 'mesh.describe', 'response', {
      nucleus: NUCLEUS_ID,
      peers: [...PEERS],
      inChannels: PEERS.map(p => `N02.IN.${p}`),
      outChannels: PEERS.map(p => `N02.OUT.${p}`),
      capabilities: registry.getAll().map(c => ({ id: c.id, version: c.version, execution: c.execution, executable: registry.canExecute(c.id) })),
      status: 'online',
    }));
  }

  if (m.capability === 'capability.list') {
    return res.status(200).json(makeResponse(m.source, m.correlationId, 'capability.list', 'response', {
      nucleus: NUCLEUS_ID,
      capabilities: registry.getAll().map(c => ({ ...c, executable: registry.canExecute(c.id) })),
    }));
  }

  if (!registry.has(m.capability)) {
    return res.status(501).json(makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_NOT_DECLARED', nucleus: NUCLEUS_ID, capability: m.capability,
    }));
  }

  if (!registry.canExecute(m.capability)) {
    return res.status(501).json(makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_HANDLER_NOT_REGISTERED', nucleus: NUCLEUS_ID, capability: m.capability,
    }));
  }

  try {
    const payload = await registry.execute(m.capability, m.payload);
    return res.status(200).json(makeResponse(m.source, m.correlationId, m.capability, 'response', payload));
  } catch (error) {
    return res.status(500).json(makeResponse(m.source, m.correlationId, m.capability, 'error', {
      code: 'CAPABILITY_EXECUTION_ERROR',
      nucleus: NUCLEUS_ID,
      capability: m.capability,
      message: error instanceof Error ? error.message : String(error),
    }));
  }
}
