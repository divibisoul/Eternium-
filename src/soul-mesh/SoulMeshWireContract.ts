export const SOUL_MESH_PROTOCOL = 'soul-mesh/1' as const;
export const SOUL_MESH_VERSION = '1.0' as const;
export const SOUL_MESH_CONTRACT_VERSION = '1.1.0' as const;
export const SOUL_MESH_MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;
export const SOUL_NUCLEI = ['N01', 'N02', 'N03', 'N04', 'N05', 'N06'] as const;
export type SoulNucleusId = typeof SOUL_NUCLEI[number];
export type SoulMeshKind = 'request' | 'response' | 'event' | 'error' | 'ack';

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
  type?: 'PING' | 'HEALTH' | 'CAPABILITY_REQUEST' | 'TASK' | 'TASK_RESULT' | 'ERROR';
  capability: string;
  payload: unknown;
  timestamp: number;
  nonce?: string;
  hmac?: string;
  ttl?: number;
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
  if (typeof m.capability !== 'string' || !m.capability.trim()) throw new Error('INVALID_SOUL_MESH_CAPABILITY');
  if (typeof m.timestamp !== 'number' || !Number.isFinite(m.timestamp)) throw new Error('INVALID_SOUL_MESH_TIMESTAMP');
  if (m.version !== undefined && m.version !== SOUL_MESH_VERSION) throw new Error('INVALID_SOUL_MESH_VERSION');
  if (m.contractVersion !== undefined && m.contractVersion !== SOUL_MESH_CONTRACT_VERSION) throw new Error('INVALID_SOUL_MESH_CONTRACT_VERSION');
  if (m.nonce !== undefined && (typeof m.nonce !== 'string' || m.nonce.length < 16 || m.nonce.length > 200)) throw new Error('INVALID_SOUL_MESH_NONCE');
  if (m.hmac !== undefined && (typeof m.hmac !== 'string' || !/^[0-9a-f]{64}$/i.test(m.hmac))) throw new Error('INVALID_SOUL_MESH_HMAC');
  if (m.ttl !== undefined && (!Number.isInteger(m.ttl) || m.ttl < 0)) throw new Error('INVALID_SOUL_MESH_TTL');
}
