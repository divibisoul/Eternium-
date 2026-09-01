import { SOUL_MESH_CAPABILITIES } from '../src/soul-mesh/SoulMeshCapabilities';
import { SOUL_MESH_CONTRACT_VERSION } from '../src/soul-mesh/SoulMeshProtocol';
import { n02CapabilityRuntime, executeN02Agent, n02AgentRegistry } from '../src/soul-mesh/N02CapabilityRuntime';

const NUCLEUS_ID = 'N02' as const;
const NUCLEI = new Set(['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07']);
const PEERS = ['N01', 'N03', 'N04', 'N05', 'N06', 'N07'] as const;
const MAX_BODY_BYTES = 1_000_000;
const MAX_CLOCK_SKEW_MS = 30_000;
const REPLAY_WINDOW_MS = 5 * 60_000;
const seenRequests = new Map<string, number>();

type MeshMessage = {
  protocol: 'soul-mesh/1'; contractVersion: string; id: string; correlationId: string;
  source: 'N01'|'N02'|'N03'|'N04'|'N05'|'N06'|'N07'; target: 'N01'|'N02'|'N03'|'N04'|'N05'|'N06'|'N07';
  kind: 'request'|'response'|'event'|'error'; capability?: string; payload: unknown; timestamp: number;
  meta?: { runtime?: string; transport?: string; encoding?: string; version?: string; nonce?: string; traceId?: string };
};

function validMessage(m: unknown): m is MeshMessage {
  if (!m || typeof m !== 'object') return false;
  const x = m as Record<string, unknown>;
  return x.protocol === 'soul-mesh/1' && x.contractVersion === SOUL_MESH_CONTRACT_VERSION
    && typeof x.id === 'string' && x.id.length <= 200
    && typeof x.correlationId === 'string' && x.correlationId.length <= 200
    && typeof x.source === 'string' && NUCLEI.has(x.source)
    && x.target === NUCLEUS_ID && x.source !== NUCLEUS_ID
    && ['request','response','event','error'].includes(String(x.kind))
    && (!x.capability || (typeof x.capability === 'string' && x.capability.length <= 200))
    && typeof x.timestamp === 'number' && Number.isFinite(x.timestamp)
    && Math.abs(Date.now() - Number(x.timestamp)) <= MAX_CLOCK_SKEW_MS;
}

function acceptOnce(id: string): boolean {
  const now = Date.now();
  for (const [key, timestamp] of seenRequests) if (now - timestamp > REPLAY_WINDOW_MS) seenRequests.delete(key);
  if (seenRequests.has(id)) return false;
  seenRequests.set(id, now);
  return true;
}

function meshAuthorized(req: any): boolean {
  const token = process.env.SOUL_MESH_TOKEN?.trim();
  if (!token) return process.env.NODE_ENV !== 'production';
  return req.headers.authorization === `Bearer ${token}`;
}

const envelope = (m: MeshMessage, kind: 'response'|'error', payload: unknown, status = 200) => ({
  status,
  body: { protocol:'soul-mesh/1', contractVersion:SOUL_MESH_CONTRACT_VERSION, id:crypto.randomUUID(), correlationId:m.correlationId,
    source:NUCLEUS_ID, target:m.source, kind, capability:m.capability, payload, timestamp:Date.now(), meta:{runtime:'Eternium-',transport:'HTTP',encoding:'json',version:SOUL_MESH_CONTRACT_VERSION,traceId:m.meta?.traceId??m.correlationId,nonce:crypto.randomUUID()} }
});

export default async function handler(req:any,res:any) {
  if (req.method !== 'POST') return res.status(405).json({ error:'METHOD_NOT_ALLOWED' });
  if (!meshAuthorized(req)) return res.status(401).json({ error:'UNAUTHORIZED' });
  if (req.headers['content-length'] && Number(req.headers['content-length']) > MAX_BODY_BYTES) return res.status(413).json({ error:'PAYLOAD_TOO_LARGE' });

  const m: unknown = req.body;
  if (!validMessage(m)) return res.status(400).json({ error:'INVALID_SOUL_MESH_MESSAGE' });
  if (m.kind !== 'request') return res.status(202).json({ accepted:true, correlationId:m.correlationId, source:NUCLEUS_ID, target:m.source, contractVersion:SOUL_MESH_CONTRACT_VERSION });
  if (!acceptOnce(m.id)) return res.status(409).json({ error:'REPLAY_DETECTED', correlationId:m.correlationId });

  if (m.capability === 'mesh.handshake') {
    const out = envelope(m, 'response', {
      nucleus: NUCLEUS_ID, protocol:'soul-mesh/1', contractVersion:SOUL_MESH_CONTRACT_VERSION,
      status:'online', capabilities:SOUL_MESH_CAPABILITIES.map(c => c.id), transports:['http','supabase-realtime','memory/test']
    });
    return res.status(out.status).json(out.body);
  }
  if (m.capability === 'mesh.ping' || m.capability === 'mesh.health') {
    const out = envelope(m, 'response', { ok:true, nucleus:NUCLEUS_ID, handler:m.capability, processedAt:Date.now() });
    return res.status(out.status).json(out.body);
  }
  if (m.capability === 'mesh.describe') {
    const out = envelope(m, 'response', {
      nucleus:NUCLEUS_ID, peers:[...PEERS], protocol:'soul-mesh/1', contractVersion:SOUL_MESH_CONTRACT_VERSION, status:'online',
      declaredCapabilities:SOUL_MESH_CAPABILITIES.map(c => c.id),
      executableCapabilities:n02CapabilityRuntime.listExecutable(),
      agents:n02AgentRegistry.list().map(agent => ({ id:agent.id, capabilities:agent.capabilities })),
      transports:['http','supabase-realtime','memory/test'],
      channels:{ in:PEERS.map(p=>`N02.IN.${p}`), out:PEERS.map(p=>`N02.OUT.${p}`) },
    });
    return res.status(out.status).json(out.body);
  }

  if (!m.capability) return res.status(400).json({ error:'CAPABILITY_REQUIRED', correlationId:m.correlationId });
  if (!n02CapabilityRuntime.has(m.capability)) {
    const out = envelope(m, 'error', { code:'CAPABILITY_HANDLER_NOT_REGISTERED', nucleus:NUCLEUS_ID, capability:m.capability }, 501);
    return res.status(out.status).json(out.body);
  }
  try {
    const payload = await executeN02Agent(m);
    const out = envelope(m, 'response', payload);
    return res.status(out.status).json(out.body);
  } catch (error) {
    const out = envelope(m, 'error', { code:'CAPABILITY_EXECUTION_ERROR', nucleus:NUCLEUS_ID, capability:m.capability, error:error instanceof Error ? error.message : String(error) }, 500);
    return res.status(out.status).json(out.body);
  }
}
