import {
  SOUL_MESH_PROTOCOL,
  SOUL_MESH_CONTRACT_VERSION,
  SOUL_NUCLEI,
  type SoulNucleus,
  type SoulMeshKind,
  type SoulMeshMessage,
} from './SoulMeshProtocol';

export { SOUL_MESH_PROTOCOL, SOUL_MESH_CONTRACT_VERSION, SOUL_NUCLEI };
export type { SoulNucleus, SoulMeshKind, SoulMeshMessage };
export type NucleusId = SoulNucleus;

export function validateMessage(m: SoulMeshMessage, nucleusId: NucleusId) {
  if (
    m.protocol !== SOUL_MESH_PROTOCOL
    || m.contractVersion !== SOUL_MESH_CONTRACT_VERSION
    || m.target !== nucleusId
    || m.source === m.target
    || !SOUL_NUCLEI.includes(m.source)
    || !SOUL_NUCLEI.includes(m.target)
    || !m.id
    || !m.correlationId
    || !Number.isFinite(m.timestamp)
    || Math.abs(Date.now() - m.timestamp) > 30_000
    || !m.capability
    || !['request', 'response', 'event', 'error'].includes(m.kind)
  ) {
    throw new Error('Invalid Mesh message');
  }
  return true;
}

export async function handleMeshMessage(
  m: SoulMeshMessage,
  nucleusId: NucleusId,
  handlers: Record<string, (p: unknown) => Promise<unknown> | unknown>,
) {
  validateMessage(m, nucleusId);
  if (m.kind !== 'request') return m;
  const h = m.capability ? handlers[m.capability] : undefined;
  if (!h) {
    return { ...m, kind: 'error' as const, target: m.source, source: nucleusId, payload: { code: 'CAPABILITY_NOT_FOUND' } };
  }
  try {
    return { ...m, kind: 'response' as const, target: m.source, source: nucleusId, payload: await h(m.payload) };
  } catch (error) {
    return {
      ...m,
      kind: 'error' as const,
      target: m.source,
      source: nucleusId,
      payload: { code: 'CAPABILITY_EXECUTION_ERROR', detail: error instanceof Error ? error.message : String(error) },
    };
  }
}
