import { isSoulMeshMessage, type SoulMeshMessage, type SoulNucleus } from './SoulMeshProtocol';

export const SOUL_MESH_PROTOCOL = 'soul-mesh/1' as const;
export type NucleusId = SoulNucleus;

export function validateMessage(value: unknown, nucleusId: NucleusId): asserts value is SoulMeshMessage {
  if (!isSoulMeshMessage(value)) throw new Error('Invalid Mesh message');
  if (value.target !== nucleusId) throw new Error('Invalid Mesh target');
}

export async function handleMeshMessage(
  value: unknown,
  nucleusId: NucleusId,
  handlers: Record<string, (payload: unknown) => Promise<unknown> | unknown>,
): Promise<SoulMeshMessage> {
  validateMessage(value, nucleusId);
  if (value.kind !== 'request') return value;

  const handler = handlers[value.capability];
  if (!handler) return { ...value, kind: 'error', payload: { code: 'CAPABILITY_HANDLER_NOT_REGISTERED' } };

  try {
    return { ...value, kind: 'response', payload: await handler(value.payload) };
  } catch (error) {
    return {
      ...value,
      kind: 'error',
      payload: { code: 'CAPABILITY_EXECUTION_ERROR', message: error instanceof Error ? error.message : String(error) },
    };
  }
}
