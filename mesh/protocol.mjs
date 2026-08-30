export const PROTOCOL = 'soul-mesh/1';
export const NUCLEUS_ID = 'N02';
export const CAPABILITIES = Object.freeze([
  'inference.generate',
  'inference.multimodal',
  'inference.web-search',
  'audio.transcribe',
]);

export function createEnvelope({ type = 'REQUEST', correlationId, capability, payload = {}, source = NUCLEUS_ID, target = 'N02' }) {
  if (!correlationId) throw new Error('correlationId is required');
  if (!capability) throw new Error('capability is required');
  return { protocol: PROTOCOL, type, correlationId, source, target, capability, timestamp: Date.now(), payload };
}

export function isValidEnvelope(value) {
  return !!value && value.protocol === PROTOCOL && typeof value.correlationId === 'string' && typeof value.capability === 'string' && typeof value.type === 'string';
}
