export type SoulNucleus = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';

export type SoulMeshKind = 'request' | 'response' | 'event' | 'error';

export interface SoulMeshMessage<T = unknown> {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: SoulNucleus;
  target: SoulNucleus;
  kind: SoulMeshKind;
  capability: string;
  payload: T;
  timestamp: number;
}

export interface SoulMeshTransport {
  send(message: SoulMeshMessage): Promise<void>;
  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void;
}

export const SOUL_MESH_PROTOCOL = 'soul-mesh/1' as const;

export function createSoulMeshMessage<T>(input: Omit<SoulMeshMessage<T>, 'protocol' | 'id' | 'timestamp'>): SoulMeshMessage<T> {
  return { protocol: SOUL_MESH_PROTOCOL, id: crypto.randomUUID(), timestamp: Date.now(), ...input };
}

export function isSoulMeshMessage(value: unknown): value is SoulMeshMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  const nuclei = new Set(['N01', 'N02', 'N03', 'N04', 'N05', 'N06']);
  const kinds = new Set(['request', 'response', 'event', 'error']);
  return m.protocol === SOUL_MESH_PROTOCOL
    && typeof m.id === 'string'
    && typeof m.correlationId === 'string'
    && typeof m.source === 'string' && nuclei.has(m.source)
    && typeof m.target === 'string' && nuclei.has(m.target)
    && m.source !== m.target
    && typeof m.kind === 'string' && kinds.has(m.kind)
    && typeof m.capability === 'string' && m.capability.length > 0
    && typeof m.timestamp === 'number';
}
