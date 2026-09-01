export const SOUL_MESH_PROTOCOL = 'soul-mesh/1' as const;
export const SOUL_MESH_CONTRACT_VERSION = '1.1.0' as const;
export const SOUL_NUCLEI = ['N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07'] as const;
export type SoulNucleus = typeof SOUL_NUCLEI[number];
export type SoulMeshKind = 'request' | 'response' | 'event' | 'error';

export interface SoulMeshMessage<T = unknown> {
  protocol: typeof SOUL_MESH_PROTOCOL;
  contractVersion: string;
  id: string;
  correlationId: string;
  source: SoulNucleus;
  target: SoulNucleus;
  kind: SoulMeshKind;
  capability?: string;
  payload: T;
  timestamp: number;
  meta?: { runtime?: string; transport?: string; encoding?: string; version?: string; nonce?: string; traceId?: string };
}

export interface SoulMeshTransport {
  send(message: SoulMeshMessage): Promise<void>;
  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void;
}

export function createSoulMeshMessage<T>(input: Omit<SoulMeshMessage<T>, 'protocol' | 'contractVersion' | 'id' | 'timestamp'> & { contractVersion?: string }): SoulMeshMessage<T> {
  const id = crypto.randomUUID();
  return {
    protocol: SOUL_MESH_PROTOCOL,
    contractVersion: input.contractVersion ?? SOUL_MESH_CONTRACT_VERSION,
    id,
    timestamp: Date.now(),
    ...input,
    correlationId: input.correlationId || id,
  };
}

export function isSoulNucleus(value: unknown): value is SoulNucleus {
  return typeof value === 'string' && (SOUL_NUCLEI as readonly string[]).includes(value);
}

export function isSoulMeshMessage(value: unknown): value is SoulMeshMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return m.protocol === SOUL_MESH_PROTOCOL
    && m.contractVersion === SOUL_MESH_CONTRACT_VERSION
    && typeof m.id === 'string' && m.id.length > 0
    && typeof m.correlationId === 'string' && m.correlationId.length > 0
    && isSoulNucleus(m.source) && isSoulNucleus(m.target) && m.source !== m.target
    && (m.kind === 'request' || m.kind === 'response' || m.kind === 'event' || m.kind === 'error')
    && typeof m.timestamp === 'number' && Number.isFinite(m.timestamp)
    && Math.abs(Date.now() - m.timestamp) <= 30000;
}
