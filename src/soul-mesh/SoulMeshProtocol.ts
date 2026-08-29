export type SoulNucleus = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';
export type SoulMeshKind = 'request' | 'response' | 'event' | 'error';

export interface SoulMeshMessage<T = unknown> {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: SoulNucleus;
  target: SoulNucleus;
  kind: SoulMeshKind;
  capability?: string;
  payload: T;
  timestamp: number;
}

export interface SoulMeshTransport {
  send(message: SoulMeshMessage): Promise<void>;
  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void;
}

const NUCLEI = new Set<SoulNucleus>(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
const KINDS = new Set<SoulMeshKind>(['request', 'response', 'event', 'error']);
const MAX_ID_LENGTH = 200;
const MAX_CAPABILITY_LENGTH = 200;

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createSoulMeshMessage<T>(
  input: Omit<SoulMeshMessage<T>, 'protocol' | 'id' | 'timestamp'>,
): SoulMeshMessage<T> {
  if (!NUCLEI.has(input.source)) throw new Error(`INVALID_SOURCE_NUCLEUS:${input.source}`);
  if (!NUCLEI.has(input.target)) throw new Error(`INVALID_TARGET_NUCLEUS:${input.target}`);
  if (!KINDS.has(input.kind)) throw new Error(`INVALID_MESSAGE_KIND:${input.kind}`);
  if (!input.correlationId.trim()) throw new Error('CORRELATION_ID_REQUIRED');
  if (input.correlationId.length > MAX_ID_LENGTH) throw new Error('CORRELATION_ID_TOO_LONG');
  if (input.capability !== undefined) {
    if (!input.capability.trim()) throw new Error('CAPABILITY_ID_REQUIRED');
    if (input.capability.length > MAX_CAPABILITY_LENGTH) throw new Error('CAPABILITY_ID_TOO_LONG');
  }
  return { protocol: 'soul-mesh/1', id: createId(), timestamp: Date.now(), ...input };
}

export function isSoulMeshMessage(value: unknown): value is SoulMeshMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return m.protocol === 'soul-mesh/1'
    && typeof m.id === 'string' && m.id.length > 0 && m.id.length <= MAX_ID_LENGTH
    && typeof m.correlationId === 'string' && m.correlationId.length > 0 && m.correlationId.length <= MAX_ID_LENGTH
    && typeof m.source === 'string' && NUCLEI.has(m.source as SoulNucleus)
    && typeof m.target === 'string' && NUCLEI.has(m.target as SoulNucleus)
    && typeof m.kind === 'string' && KINDS.has(m.kind as SoulMeshKind)
    && (m.capability === undefined || (typeof m.capability === 'string' && m.capability.length > 0 && m.capability.length <= MAX_CAPABILITY_LENGTH))
    && 'payload' in m
    && typeof m.timestamp === 'number' && Number.isFinite(m.timestamp) && m.timestamp > 0;
}

export function assertSoulMeshMessage(value: unknown): asserts value is SoulMeshMessage {
  if (!isSoulMeshMessage(value)) throw new Error('INVALID_SOUL_MESH_MESSAGE');
}
