import type { SoulMeshMessage, SoulNucleus } from './SoulMeshProtocol';
import { createSoulMeshMessage } from './SoulMeshProtocol';
import { n02CapabilityRuntime } from './N02CapabilityRuntime';
import { discoverPeerCapabilities, requestPeerCapability } from '../../api/soul-mesh/peer-client';

export interface N02TaskRequest<T = unknown> {
  capability: string;
  payload: T;
  preferredNucleus?: Exclude<SoulNucleus, 'N02'>;
  timeoutMs?: number;
  maxHops?: number;
}

export interface N02TaskResult {
  executedBy: SoulNucleus;
  delegated: boolean;
  response: SoulMeshMessage;
}

const PEERS: Exclude<SoulNucleus, 'N02'>[] = ['N01', 'N03', 'N04', 'N05', 'N06'];
const DEFAULT_TIMEOUT_MS = 15000;
const MAX_TIMEOUT_MS = 60000;
const MAX_HOPS = 1;

function boundedTimeout(value: number | undefined): number {
  return Math.min(MAX_TIMEOUT_MS, Math.max(1000, Math.floor(value ?? DEFAULT_TIMEOUT_MS)));
}

function newCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getN02AgentStatus() {
  return {
    nucleus: 'N02' as const,
    independent: true as const,
    declaredCapabilities: n02CapabilityRuntime.registry.getAll().map(c => c.id).sort(),
    executableCapabilities: n02CapabilityRuntime.listExecutable(),
    meshDelegation: true as const,
    peerNuclei: [...PEERS],
  };
}

export function canExecuteLocally(capability: string): boolean {
  return n02CapabilityRuntime.has(capability);
}

export async function discoverAllPeerCapabilities(timeoutMs = 5000) {
  const timeout = boundedTimeout(timeoutMs);
  return Promise.all(PEERS.map(async nucleus => {
    try {
      return { nucleus, status: 'available' as const, description: await discoverPeerCapabilities(nucleus, timeout) };
    } catch (error) {
      return { nucleus, status: 'unavailable' as const, error: error instanceof Error ? error.message : String(error) };
    }
  }));
}

export async function delegateTask<T>(request: N02TaskRequest<T>): Promise<N02TaskResult> {
  if (!request || typeof request.capability !== 'string' || !request.capability.trim()) {
    throw new Error('CAPABILITY_ID_REQUIRED');
  }
  const timeoutMs = boundedTimeout(request.timeoutMs);
  const maxHops = Math.min(MAX_HOPS, Math.max(0, Math.floor(request.maxHops ?? MAX_HOPS)));

  if (canExecuteLocally(request.capability)) {
    const correlationId = newCorrelationId();
    const message = createSoulMeshMessage({
      source: 'N02', target: 'N02', kind: 'request', capability: request.capability,
      correlationId, payload: request.payload,
    });
    const payload = await n02CapabilityRuntime.execute(message);
    return {
      executedBy: 'N02',
      delegated: false,
      response: createSoulMeshMessage({
        source: 'N02', target: 'N02', kind: 'response', capability: request.capability,
        correlationId, payload,
      }),
    };
  }

  if (maxHops === 0) throw new Error(`NO_EXECUTABLE_SOUL_MESH_CAPABILITY:${request.capability}`);

  const candidates: Exclude<SoulNucleus, 'N02'>[] = request.preferredNucleus
    ? [request.preferredNucleus, ...PEERS.filter(n => n !== request.preferredNucleus)]
    : [...PEERS];
  let lastError: unknown;

  for (const nucleus of candidates) {
    try {
      const description = await discoverPeerCapabilities(nucleus, Math.min(timeoutMs, 5000));
      if (!description.executableCapabilities.includes(request.capability)) continue;
      const response = await requestPeerCapability(nucleus, request.capability, request.payload, timeoutMs);
      if (response.kind === 'error') throw new Error(`REMOTE_CAPABILITY_ERROR:${nucleus}:${request.capability}`);
      return { executedBy: nucleus, delegated: true, response };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`NO_EXECUTABLE_SOUL_MESH_CAPABILITY:${request.capability}`);
}
