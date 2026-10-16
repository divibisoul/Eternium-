import { randomUUID } from 'crypto';

export const NUCLEUS_ID = 'N02' as const;
export const PEERS = ['N01', 'N03', 'N04', 'N05', 'N06'] as const;
export type N02Peer = (typeof PEERS)[number];

type MeshMessage = {
  protocol: 'soul-mesh/1'; id: string; correlationId: string;
  source: string; target: string; kind: 'request'|'response'|'event'|'error';
  capability?: string; payload: unknown; timestamp: number;
};

export async function sendTo(target: N02Peer, capability: string, payload: unknown, timeoutMs = 15000): Promise<MeshMessage> {
  const url = process.env[`SOUL_MESH_${target}_URL`];
  if (!url) throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);
  const message: MeshMessage = { protocol:'soul-mesh/1', id:randomUUID(), correlationId:randomUUID(), source:NUCLEUS_ID, target, kind:'request', capability, payload, timestamp:Date.now() };
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = process.env.SOUL_MESH_TOKEN;
    const response = await fetch(url, { method:'POST', headers:{'content-type':'application/json', ...(token ? {authorization:`Bearer ${token}`} : {})}, body:JSON.stringify(message), signal:controller.signal });
    const body = await response.json() as MeshMessage;
    if (body.protocol !== message.protocol || body.correlationId !== message.correlationId || body.source !== target || body.target !== NUCLEUS_ID) throw new Error('SOUL_MESH_RESPONSE_CORRELATION_MISMATCH');
    if (!response.ok || body.kind === 'error') throw new Error(`SOUL_MESH_REMOTE_ERROR:${target}`);
    return body;
  } finally { clearTimeout(timer); }
}

export const N02_OUT_CHANNELS = PEERS.map(p => `N02.OUT.${p}`);
export const N02_IN_CHANNELS = PEERS.map(p => `N02.IN.${p}`);
