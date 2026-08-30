import { randomUUID } from 'node:crypto';
import { SOUL_MESH_VERSION, getCapability } from './protocol.mjs';

export function normalizeLegacyRequest(message, allowUnsignedLegacy = true) {
  if (!message || message.protocol !== 'soul-mesh/1') return message;
  if (!allowUnsignedLegacy) throw new Error('LEGACY_MESH_REQUIRES_CANONICAL_SIGNED_ENVELOPE');
  const capability = message.capability || message.payload?.capability;
  return {
    version: SOUL_MESH_VERSION,
    messageId: message.id || randomUUID(),
    source: message.source,
    target: 'N02',
    timestamp: Number(message.timestamp) || Date.now(),
    nonce: randomUUID(),
    correlationId: message.correlationId,
    type: message.kind === 'request' ? 'CAPABILITY_REQUEST' : 'TASK',
    payload: { capability, ...(message.payload && typeof message.payload === 'object' && !Array.isArray(message.payload) ? message.payload : { payload: message.payload }) },
  };
}

export function legacyResponse(request, payload, kind = 'response') {
  return {
    protocol: 'soul-mesh/1',
    id: randomUUID(),
    correlationId: request.correlationId,
    source: 'N02',
    target: request.source,
    kind,
    capability: getCapability(request),
    payload,
    timestamp: Date.now(),
  };
}
