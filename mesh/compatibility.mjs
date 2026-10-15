import { randomUUID } from 'node:crypto';
const SOUL_MESH_VERSION = '1.0';
const getCapability = (message) => message?.capability || message?.payload?.capability || '';

export function normalizeLegacyRequest(message, allowUnsignedLegacy = false) {
  if (!message || message.protocol !== 'soul-mesh/1') return message;
  if (!allowUnsignedLegacy) throw new Error('LEGACY_MESH_REQUIRES_CANONICAL_SIGNED_ENVELOPE');
  if (typeof message.correlationId !== 'string' || !message.correlationId.trim()) throw new Error('LEGACY_MESH_CORRELATION_REQUIRED');
  if (typeof message.source !== 'string' || !/^N0[1-7]$/.test(message.source)) throw new Error('LEGACY_MESH_SOURCE_INVALID');
  const capability = message.capability || message.payload?.capability;
  if (typeof capability !== 'string' || !capability.trim()) throw new Error('LEGACY_MESH_CAPABILITY_REQUIRED');
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
    legacyUnsigned: true,
    requiresReauthentication: true,
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

