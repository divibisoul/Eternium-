import {
  SOUL_MESH_PROTOCOL,
  SOUL_NUCLEI,
  type SoulMeshWireMessage,
  type SoulMeshKind as WireSoulMeshKind,
  assertSoulMeshWireMessage,
} from './SoulMeshWireContract';

export type SoulNucleus = (typeof SOUL_NUCLEI)[number];
export type SoulMeshKind = WireSoulMeshKind;
export type SoulMeshMessage<T = unknown> = SoulMeshWireMessage & { payload: T };

export interface SoulMeshTransport {
  send(message: SoulMeshMessage): Promise<void>;
  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void;
}

export { SOUL_MESH_PROTOCOL };

export function createSoulMeshMessage<T>(input: Omit<SoulMeshMessage<T>, 'protocol' | 'id' | 'timestamp'>): SoulMeshMessage<T> {
  return {
    protocol: SOUL_MESH_PROTOCOL,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...input,
  };
}

export function isSoulMeshMessage(value: unknown): value is SoulMeshMessage {
  try {
    assertSoulMeshWireMessage(value);
    return true;
  } catch {
    return false;
  }
}
