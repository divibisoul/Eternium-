export const SOUL_MESH_PROTOCOL = 'soul-mesh/1' as const;
export const SOUL_MESH_MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;
export const SOUL_NUCLEI = ['N01', 'N02', 'N03', 'N04', 'N05', 'N06'] as const;
export type SoulNucleusId = typeof SOUL_NUCLEI[number];
export type SoulMeshKind = 'request' | 'response' | 'event' | 'error' | 'ack';

export interface SoulMeshWireMessage {
  protocol: typeof SOUL_MESH_PROTOCOL;
  id: string;
  correlationId: string;
  source: SoulNucleusId;
  target: SoulNucleusId;
  kind: SoulMeshKind;
  capability: string;
  payload: unknown;
  timestamp: number;
}

export function assertSoulMeshWireMessage(message: unknown): asserts message is SoulMeshWireMessage {
  if (!message || typeof message !== 'object') throw new Error('INVALID_SOUL_MESH_MESSAGE');
  const m = message as Record<string, unknown>;
  if (m.protocol !== SOUL_MESH_PROTOCOL) throw new Error('INVALID_SOUL_MESH_PROTOCOL');
  if (typeof m.id !== 'string' || typeof m.correlationId !== 'string') throw new Error('INVALID_SOUL_MESH_ID');
  if (!SOUL_NUCLEI.includes(m.source as SoulNucleusId) || !SOUL_NUCLEI.includes(m.target as SoulNucleusId)) throw new Error('INVALID_SOUL_MESH_NUCLEUS');
  if (m.source === m.target) throw new Error('INVALID_SOUL_MESH_ROUTE');
  if (!['request', 'response', 'event', 'error', 'ack'].includes(String(m.kind))) throw new Error('INVALID_SOUL_MESH_KIND');
  if (typeof m.capability !== 'string' || !m.capability.trim()) throw new Error('INVALID_SOUL_MESH_CAPABILITY');
  if (typeof m.timestamp !== 'number' || !Number.isFinite(m.timestamp)) throw new Error('INVALID_SOUL_MESH_TIMESTAMP');
}
