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

const textEncoder = new TextEncoder();

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

function requireCrypto(): Crypto {
  const value = globalThis.crypto;
  if (!value?.subtle || !value.randomUUID) throw new Error('SOUL_MESH_WEBCRYPTO_UNAVAILABLE');
  return value;
}

function secretBytes(secret: string): Uint8Array {
  const value = textEncoder.encode(secret.trim());
  if (value.length < 16) throw new Error('SOUL_MESH_HMAC_SECRET_TOO_SHORT');
  return value;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function importKey(secret: string): Promise<CryptoKey> {
  const crypto = requireCrypto();
  return crypto.subtle.importKey('raw', secretBytes(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

export async function signMeshMessage(message: Omit<SecureMeshMessage, 'hmac'>, secret: string): Promise<string> {
  const crypto = requireCrypto();
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(canonical(message)));
  return bytesToHex(signature);
}

export function createSecureFields(): Pick<SecureMeshMessage, 'version' | 'contractVersion' | 'nonce' | 'messageId'> {
  const crypto = requireCrypto();
  const messageId = crypto.randomUUID();
  return { version: SOUL_MESH_VERSION, contractVersion: SOUL_MESH_CONTRACT_VERSION, nonce: crypto.randomUUID(), messageId };
}

export async function verifyMeshMessage(
  message: SecureMeshMessage,
  secret: string,
  nowMs = Date.now(),
  maxClockSkewMs = MAX_CLOCK_SKEW_MS,
  seenNonces?: Set<string>,
): Promise<void> {
  if (message.version !== SOUL_MESH_VERSION || message.contractVersion !== SOUL_MESH_CONTRACT_VERSION) {
    throw new Error('SOUL_MESH_UNSUPPORTED_CONTRACT_VERSION');
  }
  if (!message.nonce || message.nonce.length < 16) throw new Error('SOUL_MESH_NONCE_REQUIRED');
  if (!Number.isFinite(message.timestamp) || Math.abs(nowMs - message.timestamp) > maxClockSkewMs) {
    throw new Error('SOUL_MESH_CLOCK_SKEW');
  }
  if (!/^[0-9a-f]{64}$/i.test(message.hmac)) throw new Error('SOUL_MESH_HMAC_FORMAT_INVALID');
  if (seenNonces?.has(message.nonce)) throw new Error('SOUL_MESH_REPLAY_DETECTED');
  const expected = hexToBytes(await signMeshMessage({ ...message, hmac: undefined as never }, secret));
  const supplied = hexToBytes(message.hmac);
  if (!constantTimeEqual(expected, supplied)) throw new Error('SOUL_MESH_HMAC_INVALID');
  seenNonces?.add(message.nonce);
}
