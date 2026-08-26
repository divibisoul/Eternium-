export type NucleusId = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';
export type MeshMessage = {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: NucleusId;
  target: NucleusId;
  kind: 'request' | 'response' | 'event' | 'error';
  capability: string;
  payload: unknown;
  timestamp: number;
};

const PEERS: Exclude<NucleusId, 'N02'>[] = ['N01', 'N03', 'N04', 'N05', 'N06'];
const env = (globalThis as any).process?.env ?? {};
const urls: Partial<Record<NucleusId, string>> = {
  N01: env.SOUL_MESH_N01_URL, N03: env.SOUL_MESH_N03_URL, N04: env.SOUL_MESH_N04_URL,
  N05: env.SOUL_MESH_N05_URL, N06: env.SOUL_MESH_N06_URL,
};
const uuid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export async function sendTo(target: NucleusId, capability: string, payload: unknown, timeoutMs = 15000): Promise<MeshMessage> {
  const url = urls[target];
  if (!url) throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);
  const correlationId = uuid();
  const message: MeshMessage = {
    protocol: 'soul-mesh/1', id: uuid(), correlationId, source: 'N02', target,
    kind: 'request', capability, payload, timestamp: Date.now(),
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(message),
      signal: controller.signal,
    });
    const body = await response.json() as MeshMessage;
    if (body.correlationId !== correlationId) throw new Error('SOUL_MESH_CORRELATION_MISMATCH');
    if (!response.ok || body.kind === 'error') {
      throw new Error(`SOUL_MESH_REMOTE_ERROR:${target}:${body.payload && typeof body.payload === 'object' && 'code' in body.payload ? (body.payload as any).code : response.status}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export const requestCapability = (target: NucleusId, capability: string, payload: unknown, timeoutMs = 15000) =>
  sendTo(target, capability, payload, timeoutMs);

export const describePeer = (target: NucleusId, timeoutMs = 5000) =>
  sendTo(target, 'mesh.describe', {}, timeoutMs);

export const listPeerCapabilities = (target: NucleusId, timeoutMs = 5000) =>
  sendTo(target, 'capability.list', {}, timeoutMs);

export async function pingAll(timeoutMs = 5000) {
  return Promise.all(PEERS.map(async target => {
    try { return { target, status: 'CONNECTED' as const, response: await sendTo(target, 'mesh.ping', { from: 'N02' }, timeoutMs) }; }
    catch (error) { return { target, status: 'FAILED' as const, error: String(error) }; }
  }));
}

export const N02_OUT_CHANNELS = PEERS.map(x => `N02.OUT.${x}`);
export const N02_IN_CHANNELS = PEERS.map(x => `N02.IN.${x}`);
