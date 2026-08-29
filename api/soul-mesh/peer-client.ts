export type NucleusId = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';
export type MeshKind = 'request' | 'response' | 'event' | 'error';
export type MeshMessage = {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: NucleusId;
  target: NucleusId;
  kind: MeshKind;
  capability: string;
  payload: unknown;
  timestamp: number;
};
export type PeerDescription = {
  nucleus: NucleusId;
  peers: NucleusId[];
  protocol: string;
  status: string;
  declaredCapabilities: string[];
  executableCapabilities: string[];
  transports: string[];
  channels?: { in: string[]; out: string[] };
};

const PEERS: Exclude<NucleusId, 'N02'>[] = ['N01', 'N03', 'N04', 'N05', 'N06'];
const NUCLEI = new Set<NucleusId>(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
const KINDS = new Set<MeshKind>(['request', 'response', 'event', 'error']);
const MAX_ID_LENGTH = 200;
const MAX_CAPABILITY_LENGTH = 200;
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_TIMEOUT_MS = 60_000;

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const urls: Partial<Record<NucleusId, string>> = {
  N01: env.SOUL_MESH_N01_URL,
  N03: env.SOUL_MESH_N03_URL,
  N04: env.SOUL_MESH_N04_URL,
  N05: env.SOUL_MESH_N05_URL,
  N06: env.SOUL_MESH_N06_URL,
};
const tokens: Partial<Record<NucleusId, string>> = {
  N01: env.SOUL_MESH_N01_TOKEN,
  N03: env.SOUL_MESH_N03_TOKEN,
  N04: env.SOUL_MESH_N04_TOKEN,
  N05: env.SOUL_MESH_N05_TOKEN,
  N06: env.SOUL_MESH_N06_TOKEN,
};

const uuid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function validMessage(value: unknown): value is MeshMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return m.protocol === 'soul-mesh/1'
    && typeof m.id === 'string' && m.id.length > 0 && m.id.length <= MAX_ID_LENGTH
    && typeof m.correlationId === 'string' && m.correlationId.length > 0 && m.correlationId.length <= MAX_ID_LENGTH
    && typeof m.source === 'string' && NUCLEI.has(m.source as NucleusId)
    && typeof m.target === 'string' && NUCLEI.has(m.target as NucleusId)
    && typeof m.kind === 'string' && KINDS.has(m.kind as MeshKind)
    && typeof m.capability === 'string' && m.capability.length > 0 && m.capability.length <= MAX_CAPABILITY_LENGTH
    && 'payload' in m
    && typeof m.timestamp === 'number' && Number.isFinite(m.timestamp) && m.timestamp > 0;
}

function boundedTimeout(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TIMEOUT_MS;
  return Math.min(MAX_TIMEOUT_MS, Math.max(1_000, Math.floor(value)));
}

async function request(
  target: NucleusId,
  capability: string,
  payload: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = 1,
): Promise<MeshMessage> {
  if (target === 'N02') throw new Error('SOUL_MESH_SELF_TARGET_NOT_ALLOWED');
  if (!PEERS.includes(target as Exclude<NucleusId, 'N02'>)) throw new Error(`SOUL_MESH_INVALID_PEER:${target}`);
  if (!capability.trim()) throw new Error('SOUL_MESH_CAPABILITY_REQUIRED');

  const url = urls[target];
  if (!url) throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);

  const correlationId = uuid();
  const message: MeshMessage = {
    protocol: 'soul-mesh/1',
    id: uuid(),
    correlationId,
    source: 'N02',
    target,
    kind: 'request',
    capability,
    payload,
    timestamp: Date.now(),
  };

  const attempts = Math.min(3, Math.max(0, Math.floor(retries))) + 1;
  const timeout = boundedTimeout(timeoutMs);
  let last: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'application/json',
        'x-soul-correlation-id': correlationId,
      };
      if (tokens[target]) headers.authorization = `Bearer ${tokens[target]}`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(message),
        signal: controller.signal,
      });
      const body: unknown = await response.json().catch(() => null);

      if (!validMessage(body)
        || body.correlationId !== correlationId
        || body.source !== target
        || body.target !== 'N02') {
        throw new Error('SOUL_MESH_INVALID_RESPONSE');
      }
      if (!response.ok || body.kind === 'error') {
        throw new Error(`SOUL_MESH_REMOTE_ERROR:${target}:${body.capability}`);
      }
      return body;
    } catch (error) {
      last = error;
      if (attempt < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw last instanceof Error ? last : new Error(String(last));
}

export const sendTo = request;
export const requestPeerCapability = request;

export const describePeer = async (target: NucleusId, timeoutMs = 10_000): Promise<PeerDescription> => {
  const message = await request(target, 'mesh.describe', { from: 'N02', intent: 'capability-discovery' }, timeoutMs, 1);
  const description = message.payload as Partial<PeerDescription>;
  if (!description || description.nucleus !== target || description.protocol !== 'soul-mesh/1') {
    throw new Error(`SOUL_MESH_INVALID_DESCRIPTION:${target}`);
  }
  if (!Array.isArray(description.executableCapabilities)) {
    throw new Error(`SOUL_MESH_INVALID_CAPABILITIES:${target}`);
  }
  return description as PeerDescription;
};

export async function discoverPeerCapabilities(target: NucleusId, timeoutMs = 10_000) {
  return describePeer(target, timeoutMs);
}

export async function requestPeerTool(target: NucleusId, toolCapability: string, payload: unknown, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return request(target, toolCapability, payload, timeoutMs, 1);
}

export async function pingAll(timeoutMs = 5_000) {
  return Promise.all(PEERS.map(async target => {
    try {
      return {
        target,
        status: 'CONNECTED' as const,
        response: await request(target, 'mesh.ping', { from: 'N02', channel: `N02.OUT.${target}` }, timeoutMs, 1),
      };
    } catch (error) {
      return { target, status: 'FAILED' as const, error: String(error) };
    }
  }));
}

export const N02_OUT_CHANNELS = PEERS.map(x => `N02.OUT.${x}`);
export const N02_IN_CHANNELS = PEERS.map(x => `N02.IN.${x}`);
