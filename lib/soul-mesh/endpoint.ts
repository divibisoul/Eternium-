/**
 * @deprecated Compatibility adapter retained for legacy N02 import paths.
 * The canonical contract is src/soul-mesh/SoulMeshProtocol.ts; this boundary
 * preserves legacy exports and timestamp-string messages, but fails closed
 * unless the canonical protocol version is explicitly present and valid.
 */
import {
  SOUL_MESH_PROTOCOL,
  SOUL_MESH_CONTRACT_VERSION,
  SOUL_NUCLEI,
  isSoulMeshMessage,
  type SoulMeshMessage as CanonicalSoulMeshMessage,
} from '../../src/soul-mesh/SoulMeshProtocol';
import {
  validateMessage as validateCanonicalMessage,
  handleMeshMessage as handleCanonicalMessage,
} from '../../src/soul-mesh/endpoint';

export { SOUL_MESH_PROTOCOL, SOUL_MESH_CONTRACT_VERSION, SOUL_NUCLEI };
export const NUCLEUS_ID = 'N02' as const;

export type SoulMeshMessage = {
  protocol: string;
  contractVersion?: string;
  id: string;
  correlationId: string;
  source: string;
  target: string;
  kind: 'request' | 'response' | 'event' | 'error' | 'ack';
  capability?: string;
  payload: unknown;
  timestamp: number | string;
  meta?: CanonicalSoulMeshMessage['meta'];
};

type MeshHandlers = Record<string, (payload: unknown) => Promise<unknown> | unknown>;

function toCanonical(message: SoulMeshMessage): CanonicalSoulMeshMessage {
  if (message.protocol !== SOUL_MESH_PROTOCOL) throw new Error('UNSUPPORTED_MESH_PROTOCOL');
  if (message.contractVersion !== SOUL_MESH_CONTRACT_VERSION) throw new Error('INVALID_CONTRACT_VERSION');
  if (message.kind === 'ack') throw new Error('UNSUPPORTED_MESH_KIND');
  const timestamp = typeof message.timestamp === 'number' ? message.timestamp : Date.parse(message.timestamp);
  if (!Number.isFinite(timestamp)) throw new Error('INVALID_TIMESTAMP');
  if (message.target !== NUCLEUS_ID) throw new Error('WRONG_TARGET');

  const normalized = {
    ...message,
    protocol: SOUL_MESH_PROTOCOL,
    contractVersion: SOUL_MESH_CONTRACT_VERSION,
    timestamp,
  } as unknown as CanonicalSoulMeshMessage;

  if (!isSoulMeshMessage(normalized)) throw new Error('INVALID_MESH_MESSAGE');
  validateCanonicalMessage(normalized, NUCLEUS_ID);
  return normalized;
}

export function validateMeshMessage(message: SoulMeshMessage) {
  toCanonical(message);
  return true;
}

export async function handleMeshMessage(message: SoulMeshMessage, handlers: MeshHandlers) {
  const canonical = toCanonical(message);
  const response = await handleCanonicalMessage(canonical, NUCLEUS_ID, handlers);
  // Keep the historical timestamp representation for callers of this adapter.
  return typeof message.timestamp === 'string' ? { ...response, timestamp: message.timestamp } : response;
}
