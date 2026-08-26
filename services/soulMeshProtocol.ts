import type { SoulNucleusId } from './soulMeshTopology';

export type SoulMeshKind = 'request' | 'response' | 'event' | 'error';

export interface SoulMeshMessage<T = unknown> {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: SoulNucleusId;
  target: SoulNucleusId;
  kind: SoulMeshKind;
  capability?: string;
  payload: T;
  timestamp: number;
}

export function createSoulMeshMessage<T>(input: Omit<SoulMeshMessage<T>, 'protocol' | 'id' | 'timestamp'>): SoulMeshMessage<T> {
  return { protocol: 'soul-mesh/1', id: crypto.randomUUID(), timestamp: Date.now(), ...input };
}

export function isSoulMeshMessage(value: unknown): value is SoulMeshMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return message.protocol === 'soul-mesh/1'
    && typeof message.id === 'string'
    && typeof message.correlationId === 'string'
    && typeof message.source === 'string'
    && typeof message.target === 'string'
    && typeof message.kind === 'string';
}
