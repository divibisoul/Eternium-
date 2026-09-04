export const SOUL_MESH_PROTOCOL = 'soul-mesh/1' as const;
export const SOUL_MESH_VERSION = '1.0' as const;
export const SOUL_MESH_CONTRACT_VERSION = '1.1.0' as const;
export const SOUL_MESH_MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;
export const SOUL_NUCLEI = ['N01', 'N02', 'N03', 'N04', 'N05', 'N06'] as const;
export type SoulNucleusId = typeof SOUL_NUCLEI[number];
export type SoulMeshKind = 'request' | 'response' | 'event' | 'error' | 'ack';
export type SoulMeshType = 'PING' | 'HEALTH' | 'CAPABILITY_REQUEST' | 'TASK' | 'TASK_RESULT' | 'ERROR';

export interface SoulMeshWireMessage {
  protocol: typeof SOUL_MESH_PROTOCOL;
  version?: typeof SOUL_MESH_VERSION;
  contractVersion?: typeof SOUL_MESH_CONTRACT_VERSION;
  id: string;
  messageId?: string;
  correlationId: string;
  source: SoulNucleusId;
  target: SoulNucleusId;
  kind: SoulMeshKind;
  type?: SoulMeshType;
  capability: string;
  payload: unknown;
  timestamp: number;
  nonce?: string;
  hmac?: string;
  ttl?: number;
}

const KIND_BY_TYPE: Record<SoulMeshType, SoulMeshKind> = {
  PING: 'request',
  HEALTH: 'request',
  CAPABILITY_REQUEST: 'request',
  TASK: 'request',
  TASK_RESULT: 'response',
  ERROR: 'error',
};

function capabilityFrom(input: Record<string, unknown>, type?: SoulMeshType): string {
  if (typeof input.capability === 'string' && input.capability.trim()) return input.capability.trim();
  if (input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload)) {
    const payload = input.payload as Record<string, unknown>;
    const candidate = payload.capabilityId ?? payload.capability;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  if (type === 'PING') return 'mesh.ping';
  if (type === 'HEALTH') return 'mesh.health';
  return '';
}

export function normalizeSoulMeshWireMessage(message: unknown): SoulMeshWireMessage {
  if (!message || typeof message !== 'object') throw new Error('INVALID_SOUL_MESH_MESSAGE');
  const raw = message as Record<string, unknown>;
  const type = typeof raw.type === 'string' ? raw.type as SoulMeshType : undefined;
  const payload = raw.payload ?? {};
  const source = raw.source as SoulNucleusId;
  const target = raw.target as SoulNucleusId;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : typeof raw.messageId === 'string' ? raw.messageId : '';
  const messageId = typeof raw.messageId === 'string' && raw.messageId ? raw.messageId : id;
  const kind = typeof raw.kind === 'string' ? raw.kind as SoulMeshKind : type ? KIND_BY_TYPE[type] : undefined;
  const capability = capabilityFrom(raw, type);
  const normalized: SoulMeshWireMessage = {
    protocol: SOUL_MESH_PROTOCOL,
    version: raw.version === undefined ? SOUL_MESH_VERSION : raw.version as typeof SOUL_MESH_VERSION,
    contractVersion: raw.contractVersion === undefined ? SOUL_MESH_CONTRACT_VERSION : raw.contractVersion as typeof SOUL_MESH_CONTRACT_VERSION,
    id,
    messageId,
    correlationId: typeof raw.correlationId === 'string' ? raw.correlationId : '',
    source,
    target,
    kind: kind ?? 'request',
    type,
    capability,
    payload,
    timestamp: Number(raw.timestamp),
    nonce: typeof raw.nonce === 'string' ? raw.nonce : undefined,
    hmac: typeof raw.hmac === 'string' ? raw.hmac : undefined,
    ttl: raw.ttl === undefined ? undefined : Number(raw.ttl),
  };
  assertSoulMeshWireMessage(normalized);
  return normalized;
}

export function assertSoulMeshWireMessage(message: unknown): asserts message is SoulMeshWireMessage {
  if (!message || typeof message !== 'object') throw new Error('INVALID_SOUL_MESH_MESSAGE');
  const m = message as Record<string, unknown>;
  if (m.protocol !== SOUL_MESH_PROTOCOL) throw new Error('INVALID_SOUL_MESH_PROTOCOL');
  if (typeof m.id !== 'string' || m.id.length === 0 || m.id.length > 200) throw new Error('INVALID_SOUL_MESH_ID');
  if (m.messageId !== undefined && (typeof m.messageId !== 'string' || m.messageId.length === 0 || m.messageId.length > 200)) throw new Error('INVALID_SOUL_MESH_MESSAGE_ID');
  if (typeof m.correlationId !== 'string' || m.correlationId.length === 0 || m.correlationId.length > 200) throw new Error('INVALID_SOUL_MESH_CORRELATION');
  if (!SOUL_NUCLEI.includes(m.source as SoulNucleusId) || !SOUL_NUCLEI.includes(m.target as SoulNucleusId)) throw new Error('INVALID_SOUL_MESH_NUCLEUS');
  if (m.source === m.target) throw new Error('INVALID_SOUL_MESH_ROUTE');
  if (!['request', 'response', 'event', 'error', 'ack'].includes(String(m.kind))) throw new Error('INVALID_SOUL_MESH_KIND');
  if (m.type !== undefined && !['PING', 'HEALTH', 'CAPABILITY_REQUEST', 'TASK', 'TASK_RESULT', 'ERROR'].includes(String(m.type))) throw new Error('INVALID_SOUL_MESH_TYPE');
  if (typeof m.capability !== 'string' || !m.capability.trim()) throw new Error('INVALID_SOUL_MESH_CAPABILITY');
  if (typeof m.timestamp !== 'number' || !Number.isFinite(m.timestamp)) throw new Error('INVALID_SOUL_MESH_TIMESTAMP');
  if (m.version !== undefined && m.version !== SOUL_MESH_VERSION) throw new Error('INVALID_SOUL_MESH_VERSION');
  if (m.contractVersion !== undefined && m.contractVersion !== SOUL_MESH_CONTRACT_VERSION) throw new Error('INVALID_SOUL_MESH_CONTRACT_VERSION');
  if (m.nonce !== undefined && (typeof m.nonce !== 'string' || m.nonce.length < 16 || m.nonce.length > 200)) throw new Error('INVALID_SOUL_MESH_NONCE');
  if (m.hmac !== undefined && (typeof m.hmac !== 'string' || !/^[0-9a-f]{64}$/i.test(m.hmac))) throw new Error('INVALID_SOUL_MESH_HMAC');
  if (m.ttl !== undefined && (!Number.isInteger(m.ttl) || m.ttl < 0)) throw new Error('INVALID_SOUL_MESH_TTL');
}
