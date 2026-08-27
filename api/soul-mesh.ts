import { SOUL_MESH_CAPABILITIES } from '../src/soul-mesh/SoulMeshCapabilities';
import { n02CapabilityRuntime } from '../src/soul-mesh/N02CapabilityRuntime';

const NUCLEUS_ID = 'N02' as const;
const NUCLEI = new Set(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
const PEERS = ['N01', 'N03', 'N04', 'N05', 'N06'] as const;
const MAX_BODY_BYTES = 1_000_000;

type MeshMessage = {
  protocol: 'soul-mesh/1'; id: string; correlationId: string;
  source: 'N01'|'N02'|'N03'|'N04'|'N05'|'N06'; target: 'N01'|'N02'|'N03'|'N04'|'N05'|'N06';
  kind: 'request'|'response'|'event'|'error'; capability?: string; payload: unknown; timestamp: number;
};

const env = () => ((globalThis as any).process?.env ?? {});
const authDisabled = () => String(env().MESH_AUTH_DISABLED ?? 'false').toLowerCase() === 'true';
const tokenFor = (peer: string) => env()[`SOUL_MESH_${peer}_TOKEN`];

function validMessage(m: unknown): m is MeshMessage {
  if (!m || typeof m !== 'object') return false;
  const x = m as Record<string, unknown>;
  return x.protocol === 'soul-mesh/1' && typeof x.id === 'string' && x.id.length <= 200
    && typeof x.correlationId === 'string' && x.correlationId.length <= 200
    && typeof x.source === 'string' && NUCLEI.has(x.source)
    && x.target === NUCLEUS_ID && x.source !== NUCLEUS_ID
    && ['request','response','event','error'].includes(String(x.kind))
    && (!x.capability || (typeof x.capability === 'string' && x.capability.length <= 200))
    && typeof x.timestamp === 'number' && Number.isFinite(x.timestamp);
}

const envelope = (m: MeshMessage, kind: 'response'|'error', payload: unknown, status = 200) => ({
  status,
  body: { protocol:'soul-mesh/1', id:crypto.randomUUID(), correlationId:m.correlationId,
    source:NUCLEUS_ID, target:m.source, kind, capability:m.capability, payload, timestamp:Date.now() }
});

export default async function handler(req:any,res:any) {
  if (req.method !== 'POST') return res.status(405).json({ error:'METHOD_NOT_ALLOWED' });
  const sourceHeader = String(req.headers?.['x-soul-mesh-source'] ?? '');
  const token = sourceHeader && tokenFor(sourceHeader);
  if (!authDisabled()) {
    if (!sourceHeader || !/^N0[1-6]$/.test(sourceHeader) || sourceHeader === NUCLEUS_ID || !token) return res.status(401).json({ error:'UNAUTHORIZED', code:'PEER_TOKEN_NOT_CONFIGURED' });
    if (req.headers.authorization !== `Bearer ${token}`) return res.status(401).json({ error:'UNAUTHORIZED', code:'INVALID_PEER_TOKEN' });
  }
  if (req.headers['content-length'] && Number(req.headers['content-length']) > MAX_BODY_BYTES) return res.status(413).json({ error:'PAYLOAD_TOO_LARGE' });

  const m: unknown = req.body;
  if (!validMessage(m)) return res.status(400).json({ error:'INVALID_SOUL_MESH_MESSAGE' });
  if (!authDisabled() && m.source !== sourceHeader) return res.status(401).json({ error:'UNAUTHORIZED', code:'SOURCE_AUTH_MISMATCH' });
  if (m.kind !== 'request') return res.status(202).json({ accepted:true, correlationId:m.correlationId, source:NUCLEUS_ID, target:m.source });

  if (m.capability === 'mesh.ping' || m.capability === 'mesh.health') {
    const out = envelope(m, 'response', { ok:true, nucleus:NUCLEUS_ID, handler:m.capability, processedAt:Date.now() });
    return res.status(out.status).json(out.body);
  }
  if (m.capability === 'mesh.describe') {
    const out = envelope(m, 'response', {
      nucleus:NUCLEUS_ID, peers:[...PEERS], protocol:'soul-mesh/1', status:'online',
      declaredCapabilities:SOUL_MESH_CAPABILITIES.map(c => c.id),
      executableCapabilities:n02CapabilityRuntime.listExecutable(),
      transports:['http','memory/test'],
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
    const payload = await n02CapabilityRuntime.execute(m);
    const out = envelope(m, 'response', payload);
    return res.status(out.status).json(out.body);
  } catch (error) {
    const out = envelope(m, 'error', { code:'CAPABILITY_EXECUTION_ERROR', nucleus:NUCLEUS_ID, capability:m.capability, error:error instanceof Error ? error.message : String(error) }, 500);
    return res.status(out.status).json(out.body);
  }
}
