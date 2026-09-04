import { meshResilience, isIdempotentCapability } from './resilience';

export type NucleusId = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';
export type MeshMessage = {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: NucleusId;
  target: NucleusId;
  kind: 'request' | 'response' | 'event' | 'error';
  capability: string;
  payload: unknown;
  timestamp: number;
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

const uuid = () => {
  const value = globalThis.crypto?.randomUUID?.();
  if (!value) throw new Error('SOUL_MESH_SECURE_UUID_UNAVAILABLE');
  return value;
};

const boundedTimeout = (timeoutMs: number) => Math.min(Math.max(timeoutMs, 500), 30000);

async function sendToAttempt(target: NucleusId, capability: string, payload: unknown, timeoutMs: number): Promise<MeshMessage> {
  if (target === 'N02') throw new Error('SOUL_MESH_SELF_TARGET_NOT_ALLOWED');
  if (!capability?.trim()) throw new Error('SOUL_MESH_CAPABILITY_REQUIRED');
  const url = urls[target];
  if (!url) throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);

  const correlationId = uuid();
  const message: MeshMessage = {
    protocol: 'soul-mesh/1', id: uuid(), correlationId, source: 'N02', target,
    kind: 'request', capability: capability.trim(), payload, timestamp: Date.now(),
  };
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
    let body: MeshMessage;
    try { body = JSON.parse(text) as MeshMessage; }
    catch { throw new Error(`SOUL_MESH_INVALID_REMOTE_JSON:${target}:${response.status}`); }
    if (body.correlationId !== correlationId) throw new Error('SOUL_MESH_CORRELATION_MISMATCH');
    if (body.source !== target || body.target !== 'N02') throw new Error('SOUL_MESH_IDENTITY_MISMATCH');
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
