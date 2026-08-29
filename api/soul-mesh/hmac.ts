import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { MeshMessage } from './peer-client';

const MAX_CLOCK_SKEW_MS = 30_000;

function canonicalize(message: MeshMessage, nonce: string): string {
  return JSON.stringify({
    protocol: message.protocol,
    id: message.id,
    correlationId: message.correlationId,
    source: message.source,
    target: message.target,
    kind: message.kind,
    capability: message.capability ?? null,
    payload: message.payload,
    timestamp: message.timestamp,
    transport: (message as MeshMessage & { transport?: unknown }).transport ?? null,
    meta: (message as MeshMessage & { meta?: unknown }).meta ?? null,
    nonce,
  });
}

export function createSoulMeshNonce(): string {
  return randomBytes(24).toString('base64url');
}

export function signSoulMeshMessage(message: MeshMessage, secret: string, nonce: string): string {
  if (!secret) throw new Error('SOUL_MESH_HMAC_SECRET_MISSING');
  return createHmac('sha256', secret).update(canonicalize(message, nonce), 'utf8').digest('hex');
}

export function verifySoulMeshMessage(
  message: MeshMessage,
  secret: string,
  nonce: string,
  hmac: string,
  now = Date.now(),
): boolean {
  if (!secret || !nonce || !hmac || !Number.isFinite(message.timestamp)) return false;
  if (Math.abs(now - message.timestamp) > MAX_CLOCK_SKEW_MS) return false;
  const expected = signSoulMeshMessage(message, secret, nonce);
  const actual = Buffer.from(hmac, 'hex');
  const wanted = Buffer.from(expected, 'hex');
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}
