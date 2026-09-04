import { meshResilience, isIdempotentCapability } from './resilience';
import { createSecureFields, signMeshMessage, verifyMeshMessage, type SecureMeshMessage } from '../../src/soul-mesh/SoulMeshSecurity';
import { normalizeSoulMeshWireMessage } from '../../src/soul-mesh/SoulMeshWireContract';

export type NucleusId = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';
export type MeshMessage = {
  protocol: 'soul-mesh/1';
  version?: '1.0';
  contractVersion?: '1.1.0';
  id: string;
  messageId?: string;
  correlationId: string;
  source: NucleusId;
  target: NucleusId;
  kind: 'request' | 'response' | 'event' | 'error';
  type?: 'PING' | 'HEALTH' | 'CAPABILITY_REQUEST' | 'TASK' | 'TASK_RESULT' | 'ERROR';
  capability: string;
  payload: unknown;
  timestamp: number;
  nonce?: string;
  hmac?: string;
  ttl?: number;
};

const PEERS: Exclude<NucleusId, 'N02'>[] = ['N01', 'N03', 'N04', 'N05', 'N06'];
const env = (globalThis as any).process?.env ?? {};
const urls: Partial<Record<NucleusId, string>> = {
  N01: env.SOUL_MESH_N01_URL, N03: env.SOUL_MESH_N03_URL, N04: env.SOUL_MESH_N04_URL,
  N05: env.SOUL_MESH_N05_URL, N06: env.SOUL_MESH_N06_URL,
};
const tokens: Partial<Record<NucleusId, string>> = {
  N01: env.SOUL_MESH_TOKEN_N01, N03: env.SOUL_MESH_TOKEN_N03, N04: env.SOUL_MESH_TOKEN_N04,
  N05: env.SOUL_MESH_TOKEN_N05, N06: env.SOUL_MESH_TOKEN_N06,
};
const hmacSecret = () => String(env.SOUL_MESH_HMAC_SECRET ?? '').trim();
const seenNonces = new Set<string>();

const uuid = () => {
  const value = globalThis.crypto?.randomUUID?.();
  if (!value) throw new Error('SOUL_MESH_SECURE_UUID_UNAVAILABLE');
  return value;
};

const boundedTimeout = (timeoutMs: number) => Math.min(Math.max(timeoutMs, 500), 30000);

function typeForCapability(capability: string): NonNullable<MeshMessage['type']> {
  if (capability === 'mesh.ping') return 'PING';
  if (capability === 'mesh.health') return 'HEALTH';
  if (capability === 'mesh.describe' || capability === 'capability.list') return 'CAPABILITY_REQUEST';
  return 'TASK';
}

function securePayload(capability: string, payload: unknown, type: NonNullable<MeshMessage['type']>): unknown {
  if (type === 'PING' || type === 'HEALTH') return payload;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const object = payload as Record<string, unknown>;
    if (object.capabilityId !== undefined && object.capabilityId !== capability) {
      throw new Error('SOUL_MESH_CAPABILITY_CONFLICT');
    }
    return { capabilityId: capability, ...object };
  }
  return { capabilityId: capability, data: payload };
}

function secureMessage(message: MeshMessage): MeshMessage {
  const secret = hmacSecret();
  if (!secret) return message;
  const secure = createSecureFields();
  const type = typeForCapability(message.capability);
  const payload = securePayload(message.capability, message.payload, type);
  const unsigned = {
    protocol: message.protocol,
    ...secure,
    id: message.id,
    correlationId: message.correlationId,
    source: message.source,
    target: message.target,
    kind: message.kind,
    type,
    capability: message.capability,
    payload,
    timestamp: message.timestamp,
  } as Omit<SecureMeshMessage, 'hmac'>;
  return { ...message, ...secure, type, payload, hmac: signMeshMessage(unsigned, secret) };
}

async function sendToAttempt(target: NucleusId, capability: string, payload: unknown, timeoutMs: number): Promise<MeshMessage> {
  if (target === 'N02') throw new Error('SOUL_MESH_SELF_TARGET_NOT_ALLOWED');
  if (!capability?.trim()) throw new Error('SOUL_MESH_CAPABILITY_REQUIRED');
  const url = urls[target];
  if (!url) throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);

  const correlationId = uuid();
  const message = secureMessage({
    protocol: 'soul-mesh/1', id: uuid(), correlationId, source: 'N02', target,
    kind: 'request', capability: capability.trim(), payload, timestamp: Date.now(),
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), boundedTimeout(timeoutMs));
  try {
    const authorization = tokens[target] ? { authorization: `Bearer ${tokens[target]}` } : {};
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', ...authorization },
      body: JSON.stringify(message),
      signal: controller.signal,
    });
    const text = await response.text();
    let rawBody: Record<string, unknown>;
    try { rawBody = JSON.parse(text) as Record<string, unknown>; }
    catch { throw new Error(`SOUL_MESH_INVALID_REMOTE_JSON:${target}:${response.status}`); }
    if (typeof rawBody.capability !== 'string' || !String(rawBody.capability).trim()) rawBody.capability = capability;
    const body = normalizeSoulMeshWireMessage(rawBody) as MeshMessage;
    if (body.correlationId !== correlationId) throw new Error('SOUL_MESH_CORRELATION_MISMATCH');
    if (body.source !== target || body.target !== 'N02') throw new Error('SOUL_MESH_IDENTITY_MISMATCH');
    const secret = hmacSecret();
    if (secret) verifyMeshMessage(body as SecureMeshMessage, secret, Date.now(), 30000, seenNonces);
    if (!response.ok || body.kind === 'error') {
      const code = body.payload && typeof body.payload === 'object' && 'code' in body.payload
        ? String((body.payload as { code?: unknown }).code) : String(response.status);
      throw new Error(`SOUL_MESH_REMOTE_ERROR:${target}:${code}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendTo(target: NucleusId, capability: string, payload: unknown, timeoutMs = 15000): Promise<MeshMessage> {
  const normalizedCapability = capability?.trim();
  return meshResilience.execute(
    target,
    normalizedCapability,
    attempt => sendToAttempt(target, normalizedCapability, payload, timeoutMs),
    { idempotent: isIdempotentCapability(normalizedCapability) },
  );
}

export const requestCapability = (target: NucleusId, capability: string, payload: unknown, timeoutMs = 15000) =>
  sendTo(target, capability, payload, timeoutMs);

export const describePeer = (target: NucleusId, timeoutMs = 5000) => sendTo(target, 'mesh.describe', {}, timeoutMs);
export const listPeerCapabilities = (target: NucleusId, timeoutMs = 5000) => sendTo(target, 'capability.list', {}, timeoutMs);

export async function pingAll(timeoutMs = 5000) {
  return Promise.all(PEERS.map(async target => {
    try { return { target, status: 'CONNECTED' as const, response: await sendTo(target, 'mesh.ping', { from: 'N02' }, timeoutMs) }; }
    catch (error) { return { target, status: 'FAILED' as const, error: String(error) }; }
  }));
}

export const getMeshResilienceSnapshot = () => meshResilience.snapshot();
export const getMeshResiliencePrometheus = () => meshResilience.prometheus();
export const N02_OUT_CHANNELS = PEERS.map(x => `N02.OUT.${x}`);
export const N02_IN_CHANNELS = PEERS.map(x => `N02.IN.${x}`);
