import { createHmac, timingSafeEqual } from 'node:crypto';

function canonicalUnsignedEnvelope(envelope) {
  return JSON.stringify({
    version: envelope.version,
    messageId: envelope.messageId,
    source: envelope.source,
    target: envelope.target,
    timestamp: envelope.timestamp,
    nonce: envelope.nonce,
    correlationId: envelope.correlationId,
    type: envelope.type,
    ...(envelope.ttl === undefined ? {} : { ttl: envelope.ttl }),
    payload: envelope.payload,
  });
}

function secretBytes(secret) {
  const value = Buffer.from(secret || '', 'utf8');
  if (value.length < 16) throw new Error('SOUL_MESH_SECRET must contain at least 16 bytes');
  return value;
}

export function signEnvelope(envelope, secret) {
  return createHmac('sha256', secretBytes(secret)).update(canonicalUnsignedEnvelope(envelope)).digest('hex');
}

export function verifyEnvelope(envelope, secret, { nowMs = Date.now(), maxClockSkewMs = 30_000, seenNonces } = {}) {
  if (!envelope.hmac || !/^[0-9a-f]{64}$/i.test(envelope.hmac)) throw new Error('Invalid SOUL Mesh HMAC');
  if (Math.abs(nowMs - envelope.timestamp) > maxClockSkewMs) throw new Error('Envelope timestamp outside accepted clock skew');
  if (seenNonces?.has(envelope.nonce)) throw new Error('Replay detected: nonce already observed');
  const expected = Buffer.from(signEnvelope(envelope, secret), 'hex');
  const supplied = Buffer.from(envelope.hmac, 'hex');
  if (!timingSafeEqual(expected, supplied)) throw new Error('Invalid SOUL Mesh HMAC');
  seenNonces?.add(envelope.nonce);
  return true;
}
