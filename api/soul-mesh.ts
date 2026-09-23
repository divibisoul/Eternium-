import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { SOUL_MESH_CAPABILITIES } from '../src/soul-mesh/SoulMeshCapabilities';
import { SOUL_MESH_CONTRACT_VERSION } from '../src/soul-mesh/SoulMeshProtocol';
import { n02CapabilityRuntime, executeN02Agent, n02AgentRegistry } from '../src/soul-mesh/N02CapabilityRuntime';

const NUCLEUS_ID = 'N02' as const;
const NUCLEI = new Set(['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07']);
const PEERS = ['N01', 'N03', 'N04', 'N05', 'N06', 'N07'] as const;
const OCTACORE_CAPABILITY = 'octacore.execute';
const declaredCapabilities = () => [
  ...SOUL_MESH_CAPABILITIES.map(c => c.id),
  OCTACORE_CAPABILITY,
  'sara.health',
  'sara.cycle',
  'sara.audit',
  'sara.regenerate',
  'sara.state',
  'sara.capabilities',
  'sara.trace',
];
const MAX_BODY_BYTES = 1_000_000;
const MAX_CLOCK_SKEW_MS = 30_000;
const REPLAY_WINDOW_MS = 5 * 60_000;
const SARA_URL = String(process.env.SARA_SERVICE_URL || '').trim().replace(/\/$/, '');
const SARA_TOKEN = String(process.env.SARA_SERVICE_TOKEN || '').trim();
const seenRequests = new Map<string, number>();

type MeshMessage = {
  protocol: 'soul-mesh/1'; contractVersion: string; id: string; correlationId: string;
  source: 'N01'|'N02'|'N03'|'N04'|'N05'|'N06'|'N07'; target: 'N01'|'N02'|'N03'|'N04'|'N05'|'N06'|'N07';
  kind: 'request'|'response'|'event'|'error'; capability?: string; payload: unknown; timestamp: number;
  meta?: { runtime?: string; transport?: string; encoding?: string; version?: string; nonce?: string; traceId?: string };
};

function normalizeInbound(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const x = raw as Record<string, unknown>;
  if (x.protocol !== 'soul-mesh/1') return raw;
  if (typeof x.kind === 'string') return raw;
  const sourceMap: Record<string, string> = { N1: 'N01', N2: 'N02', N3: 'N03', N4: 'N04', N5: 'N05', N6: 'N06', N7: 'N07' };
  const source = typeof x.source === 'string' ? (sourceMap[x.source] ?? x.source) : x.source;
  const target = typeof x.target === 'string' ? (sourceMap[x.target] ?? x.target) : x.target;
  const action = typeof x.action === 'string' ? x.action : 'mesh.ping';
  const capability = action === 'ping' ? 'mesh.ping' : action === 'health' ? 'mesh.health' : action;
  return {
    protocol: 'soul-mesh/1',
    contractVersion: typeof x.contractVersion === 'string' ? x.contractVersion : SOUL_MESH_CONTRACT_VERSION,
    id: typeof x.id === 'string' && x.id ? x.id : randomUUID(),
    correlationId: typeof x.correlationId === 'string' && x.correlationId ? x.correlationId : randomUUID(),
    source, target, kind: 'request', capability,
    payload: x.payload ?? x.data ?? {}, timestamp: typeof x.timestamp === 'number' ? x.timestamp : Date.now(),
    meta: { transport: 'HTTP', encoding: 'json', version: typeof x.contractVersion === 'string' ? x.contractVersion : SOUL_MESH_CONTRACT_VERSION },
  };
}

function validMessage(m: unknown): m is MeshMessage {
  if (!m || typeof m !== 'object') return false;
  const x = m as Record<string, unknown>;
  const kind = String(x.kind);
  return x.protocol === 'soul-mesh/1' && x.contractVersion === SOUL_MESH_CONTRACT_VERSION
    && typeof x.id === 'string' && x.id.length > 0 && x.id.length <= 200
    && typeof x.correlationId === 'string' && x.correlationId.length > 0 && x.correlationId.length <= 200
    && typeof x.source === 'string' && NUCLEI.has(x.source)
    && x.target === NUCLEUS_ID && x.source !== NUCLEUS_ID
    && ['request','response','event','error'].includes(kind)
    && (kind !== 'request' || (typeof x.capability === 'string' && x.capability.trim().length > 0 && x.capability.length <= 200))
    && (kind === 'request' || x.capability === undefined || (typeof x.capability === 'string' && x.capability.length <= 200))
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

function canonical(m: MeshMessage, nonce: string): string {
  return JSON.stringify({
    protocol: m.protocol, contractVersion: m.contractVersion, id: m.id, correlationId: m.correlationId,
    source: m.source, target: m.target, kind: m.kind, capability: m.capability ?? null,
    payload: m.payload, timestamp: m.timestamp, meta: m.meta ?? null, nonce,
  });
}

function verifyHmac(m: MeshMessage, req: any): boolean {
  const secret = process.env.SOUL_MESH_HMAC_SECRET?.trim();
  if (!secret) return false;
  const nonce = m.meta?.nonce?.trim();
  const supplied = String(req.headers['x-soul-mesh-hmac'] ?? '').trim();
  if (!nonce || nonce.length < 16 || !/^[0-9a-f]{64}$/i.test(supplied)) return false;
  const expected = createHmac('sha256', secret).update(canonical(m, nonce), 'utf8').digest('hex');
  const actual = Buffer.from(supplied, 'hex');
  const wanted = Buffer.from(expected, 'hex');
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

async function callSara(capability:string, payload:unknown, correlationId:string): Promise<unknown> {
  if(!SARA_URL || (capability!=='sara.health' && !SARA_TOKEN)) throw new Error('SARA_SERVICE_NOT_CONFIGURED');
  const routes:Record<string,string>={
    'sara.health':'/health','sara.cycle':'/v1/cycle','sara.audit':'/v1/audit','sara.regenerate':'/v1/regenerate',
    'sara.state':'/v1/state','sara.capabilities':'/v1/capabilities','sara.trace': typeof payload==='object' && payload && 'cycle_id' in payload && typeof (payload as {cycle_id?:unknown}).cycle_id==='string' ? '/v1/trace/'+encodeURIComponent((payload as {cycle_id:string}).cycle_id) : '',
  };
  const route=routes[capability];
  if(!route) throw new Error('SARA_CAPABILITY_NOT_SUPPORTED');
  const isGet=capability==='sara.health'||capability==='sara.state'||capability==='sara.capabilities'||capability==='sara.trace';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Number(process.env.SARA_REQUEST_TIMEOUT_MS||30000));
  try{
    const response=await fetch(SARA_URL+route,{method:isGet?'GET':'POST',headers:{accept:'application/json','content-type':'application/json',...(capability==='sara.health'?{}:{authorization:'Bearer '+SARA_TOKEN}),'x-correlation-id':correlationId},...(isGet?{}:{body:JSON.stringify({...((payload&&typeof payload==='object')?payload:{input:String(payload??'')}),...(capability==='sara.cycle'&&(!payload||typeof payload!=='object'||!('cycle_id' in payload))?{cycle_id:correlationId}:{})})}),signal:controller.signal,cache:'no-store'});
    const body=await response.json().catch(()=>null);
    if(!response.ok)throw new Error('SARA_HTTP_'+response.status);
    return body;
  } finally { clearTimeout(timer); }
}

function meshAuthorized(req: any, message: MeshMessage): boolean {
  if (process.env.SOUL_MESH_HMAC_SECRET?.trim()) return verifyHmac(message, req);
  const token = process.env.SOUL_MESH_TOKEN?.trim();
  if (!token) return process.env.NODE_ENV !== 'production';
  return req.headers.authorization === `Bearer ${token}`;
}

const envelope = (m: MeshMessage, kind: 'response'|'error', payload: unknown, status = 200) => {
  const id = randomUUID();
  const nonce = randomUUID();
  const timestamp = Date.now();
  const type = kind === 'error' ? 'ERROR' : 'TASK_RESULT';
  const legacy = {
    version: '1.0',
    contractVersion: SOUL_MESH_CONTRACT_VERSION,
    messageId: id,
    source: NUCLEUS_ID,
    target: m.source,
    timestamp,
    nonce,
    correlationId: m.correlationId,
    type,
    payload: { capability: m.capability ?? '', payload },
  };
  const secret = String(process.env.SOUL_MESH_HMAC_SECRET || '').trim();
  const hmac = secret ? createHmac('sha256', secret).update(JSON.stringify(legacy), 'utf8').digest('hex') : '';
  return {
    status,
    body: { protocol:'soul-mesh/1', contractVersion:SOUL_MESH_CONTRACT_VERSION, id, correlationId:m.correlationId,
      source:NUCLEUS_ID, target:m.source, kind, capability:m.capability, payload, timestamp,
      nonce, ...(hmac ? {hmac} : {}),
      meta:{runtime:'Eternium-',transport:'HTTP',encoding:'json',version:SOUL_MESH_CONTRACT_VERSION,traceId:m.meta?.traceId??m.correlationId,nonce} }
  };
};

export default async function handler(req:any,res:any) {
  if (req.method !== 'POST') return res.status(405).json({ error:'METHOD_NOT_ALLOWED' });
  if (req.headers['content-length'] && Number(req.headers['content-length']) > MAX_BODY_BYTES) return res.status(413).json({ error:'PAYLOAD_TOO_LARGE' });

  const m: unknown = normalizeInbound(req.body);
  if (!validMessage(m)) return res.status(400).json({ error:'INVALID_SOUL_MESH_MESSAGE' });
  const headerCorrelation = String(req.headers['x-soul-correlation-id'] ?? '').trim();
  if (headerCorrelation && headerCorrelation !== m.correlationId) return res.status(400).json({ error:'CORRELATION_ID_MISMATCH', correlationId:m.correlationId });
  if (!meshAuthorized(req, m)) return res.status(401).json({ error:'UNAUTHORIZED' });
  if (m.kind !== 'request') return res.status(202).json({ accepted:true, correlationId:m.correlationId, source:NUCLEUS_ID, target:m.source, contractVersion:SOUL_MESH_CONTRACT_VERSION });
  if (!acceptOnce(m.id)) return res.status(409).json({ error:'REPLAY_DETECTED', correlationId:m.correlationId });

  if (m.capability === OCTACORE_CAPABILITY) {
    if (!m.payload || typeof m.payload !== 'object' || Array.isArray(m.payload)) {
      const out = envelope(m, 'error', { code: 'OCTACORE_N02_PAYLOAD_MUST_BE_OBJECT' }, 400);
      return res.status(out.status).json(out.body);
    }
    const octa = m.payload as { capability?: unknown; payload?: unknown; job_id?: unknown };
    const innerCapability = typeof octa.capability === 'string' ? octa.capability.trim() : '';
    if (!innerCapability) {
      const out = envelope(m, 'error', { code: 'OCTACORE_N02_CAPABILITY_REQUIRED' }, 400);
      return res.status(out.status).json(out.body);
    }
    if (innerCapability === 'mesh.ping') {
      const out = envelope(m, 'response', {
        ok: true,
        kernel: 'G2',
        nucleus: NUCLEUS_ID,
        capability: innerCapability,
        job_id: typeof octa.job_id === 'string' ? octa.job_id : undefined,
        value: { ok: true, nucleus: NUCLEUS_ID, handler: 'N02.mesh.ping', echoed: octa.payload ?? {}, processedAt: Date.now() },
      });
      return res.status(out.status).json(out.body);
    }
    if (innerCapability === 'mesh.describe') {
      const out = envelope(m, 'response', {
        ok: true,
        kernel: 'G2',
        nucleus: NUCLEUS_ID,
        capability: innerCapability,
        job_id: typeof octa.job_id === 'string' ? octa.job_id : undefined,
        value: {
          nucleus: NUCLEUS_ID,
          peers: [...PEERS],
          protocol: 'soul-mesh/1',
          contractVersion: SOUL_MESH_CONTRACT_VERSION,
          executableCapabilities: n02CapabilityRuntime.listExecutable(),
        },
      });
      return res.status(out.status).json(out.body);
    }
    if (!n02CapabilityRuntime.has(innerCapability)) {
      const out = envelope(m, 'error', { code: 'OCTACORE_N02_CAPABILITY_NOT_EXECUTABLE', capability: innerCapability }, 501);
      return res.status(out.status).json(out.body);
    }
    try {
      const nested = { ...m, capability: innerCapability, payload: octa.payload };
      const value = await executeN02Agent(nested);
      const out = envelope(m, 'response', {
        ok: true,
        kernel: 'G2',
        nucleus: NUCLEUS_ID,
        capability: innerCapability,
        job_id: typeof octa.job_id === 'string' ? octa.job_id : undefined,
        value,
      });
      return res.status(out.status).json(out.body);
    } catch (error) {
      const out = envelope(m, 'error', {
        code: 'OCTACORE_N02_EXECUTION_ERROR',
        capability: innerCapability,
        detail: error instanceof Error ? error.message : String(error),
      }, 502);
      return res.status(out.status).json(out.body);
    }
  }

  if (m.capability === 'mesh.handshake') {
    const out = envelope(m, 'response', {
      nucleus: NUCLEUS_ID, protocol:'soul-mesh/1', contractVersion:SOUL_MESH_CONTRACT_VERSION,
      status:'online', capabilities:declaredCapabilities(), transports:['http','supabase-realtime']
    });
    return res.status(out.status).json(out.body);
  }
  if (m.capability === 'mesh.ping' || m.capability === 'mesh.health') {
    const out = envelope(m, 'response', { ok:true, nucleus:NUCLEUS_ID, handler:m.capability, processedAt:Date.now() });
    return res.status(out.status).json(out.body);
  }
  if (m.capability === 'mesh.describe') {
    const out = envelope(m, 'response', {
      nucleus: NUCLEUS_ID, peers:[...PEERS], protocol:'soul-mesh/1', contractVersion:SOUL_MESH_CONTRACT_VERSION, status:'online',
      declaredCapabilities:declaredCapabilities(),
      executableCapabilities:n02CapabilityRuntime.listExecutable(),
      agents:n02AgentRegistry.list().map(agent => ({ id:agent.id, capabilities:agent.capabilities })),
      transports:['http','supabase-realtime'],
      channels:{ in:PEERS.map(p=>`N02.IN.${p}`), out:PEERS.map(p=>`N02.OUT.${p}`) },
    });
    return res.status(out.status).json(out.body);
  }

  if (!m.capability) return res.status(400).json({ error:'CAPABILITY_REQUIRED', correlationId:m.correlationId });
  if (m.capability?.startsWith('sara.')) {
    try {
      const payload = await callSara(m.capability, m.payload, m.correlationId);
      const out = envelope(m, 'response', payload);
      return res.status(out.status).json(out.body);
    } catch (error) {
      const out = envelope(m, 'error', { code:error instanceof Error?error.message:'SARA_REQUEST_FAILED', capability:m.capability }, 502);
      return res.status(out.status).json(out.body);
    }
  }

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