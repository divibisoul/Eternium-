export const PROTOCOL = 'soul-mesh/1';
export const SOUL_MESH_VERSION = '1.0';
export const NUCLEUS_ID = 'N02';
export const MESSAGE_TYPES = Object.freeze(['PING', 'HEALTH', 'CAPABILITY_REQUEST', 'TASK', 'TASK_RESULT', 'ERROR']);
export const CAPABILITIES = Object.freeze([
  'inference.generate',
  'inference.multimodal',
  'inference.web-search',
  'audio.transcribe',
]);

export function createEnvelope({ type = 'TASK', correlationId, capability, payload = {}, source = NUCLEUS_ID, target = 'N02', ttl }) {
  if (!correlationId) throw new Error('correlationId is required');
  if (!capability) throw new Error('capability is required');
  if (!MESSAGE_TYPES.includes(type)) throw new Error(`unsupported message type: ${type}`);
  return {
    version: SOUL_MESH_VERSION,
    messageId: crypto.randomUUID(),
    source,
    target,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
    correlationId,
    type,
    ...(ttl === undefined ? {} : { ttl }),
    payload: { capability, ...payload },
  };
}

export function isValidEnvelope(value) {
  return !!value
    && value.version === SOUL_MESH_VERSION
    && typeof value.messageId === 'string'
    && typeof value.source === 'string'
    && typeof value.target === 'string'
    && typeof value.timestamp === 'number'
    && typeof value.nonce === 'string'
    && typeof value.correlationId === 'string'
    && MESSAGE_TYPES.includes(value.type)
    && value.payload && typeof value.payload === 'object';
}

export function getCapability(envelope) {
  return envelope?.payload?.capability;
}
