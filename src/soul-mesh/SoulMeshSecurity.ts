import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';

export const SOUL_MESH_VERSION = '1.0' as const;
export const SOUL_MESH_CONTRACT_VERSION = '1.1.0' as const;
export const MAX_CLOCK_SKEW_MS = 30000;

export interface SecureMeshMessage {
  protocol: 'soul-mesh/1';
  version: typeof SOUL_MESH_VERSION;
  contractVersion: typeof SOUL_MESH_CONTRACT_VERSION;
  id: string;
  messageId?: string;
  correlationId: string;
  source: string;
  target: string;
  kind: 'request' | 'response' | 'event' | 'error';
  type?: 'PING' | 'HEALTH' | 'CAPABILITY_REQUEST' | 'TASK' | 'TASK_RESULT' | 'ERROR';
  capability: string;
  payload: unknown;
  timestamp: number;
  nonce: string;
  hmac: string;
  ttl?: number;
}

function canonical(message: Omit<SecureMeshMessage, 'hmac'>): string {
  return JSON.stringify({
    version: message.version,
    contractVersion: message.contractVersion,
    messageId: message.messageId ?? message.id,
    source: message.source,
    target: message.target,
    timestamp: message.timestamp,
    nonce: message.nonce,
    correlationId: message.correlationId,
    type: message.type ?? (message.kind === 'request' ? 'TASK' : message.kind === 'response' ? 'TASK_RESULT' : 'ERROR'),
    ...(message.ttl === undefined ? {} : { ttl: message.ttl }),
    payload: message.payload,
  });
}

function secretBytes(secret: string): Buffer {
  const value = Buffer.from(secret.trim(), 'utf8');
  if (value.length < 16) throw new Error('SOUL_MESH_HMAC_SECRET_TOO_SHORT');
  return value;
}

export function signMeshMessage(message: Omit<SecureMeshMessage, 'hmac'>, secret: string): string {
  return createHmac('sha256', secretBytes(secret)).update(canonical(message), 'utf8').digest('hex');
}

export function createSecureFields(): Pick<SecureMeshMessage, 'version' | 'contractVersion' | 'nonce' | 'messageId'> {
  const messageId = randomUUID();
  return { version: SOUL_MESH_VERSION, contractVersion: SOUL_MESH_CONTRACT_VERSION, nonce: randomUUID(), messageId };
}

export function verifyMeshMessage(
  message: SecureMeshMessage,
  secret: string,
  nowMs = Date.now(),
  maxClockSkewMs = MAX_CLOCK_SKEW_MS,
  seenNonces?: Set<string>,
): void {
  if (message.version !== SOUL_MESH_VERSION || message.contractVersion !== SOUL_MESH_CONTRACT_VERSION) {
    throw new Error('SOUL_MESH_UNSUPPORTED_CONTRACT_VERSION');
  }
  if (!message.nonce || message.nonce.length < 16) throw new Error('SOUL_MESH_NONCE_REQUIRED');
  if (!Number.isFinite(message.timestamp) || Math.abs(nowMs - message.timestamp) > maxClockSkewMs) {
    throw new Error('SOUL_MESH_CLOCK_SKEW');
  }
  if (!/^[0-9a-f]{64}$/i.test(message.hmac)) throw new Error('SOUL_MESH_HMAC_FORMAT_INVALID');
  if (seenNonces?.has(message.nonce)) throw new Error('SOUL_MESH_REPLAY_DETECTED');
  const expected = Buffer.from(signMeshMessage({ ...message, hmac: undefined as never }, secret), 'hex');
  const supplied = Buffer.from(message.hmac, 'hex');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new Error('SOUL_MESH_HMAC_INVALID');
  }
  seenNonces?.add(message.nonce);
}
