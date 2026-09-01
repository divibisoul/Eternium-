import { processUserDirective } from '../../services/geminiService.ts';
import { SystemAspect } from '../../types.ts';
import type { SoulMeshMessage } from './SoulMeshProtocol';
import type { SoulMeshCapabilityHandler } from './SoulMeshCapabilityExecutor';

type MeshPayload = {
  contents?: unknown;
  text?: string;
  mode?: string;
  useWebSearch?: boolean;
  deployedCapabilities?: Array<{ id: string; name?: string; status?: 'Processando' | 'Otimizando' | 'Monitorando' | 'Estável'; metric?: number }>;
  isFullCognitionMode?: boolean;
};

type ProviderCandidate = {
  finishReason?: unknown;
  safetyRatings?: unknown;
  groundingMetadata?: unknown;
};

const modes = new Set(Object.values(SystemAspect));
function normalizeMode(value: unknown): SystemAspect { return typeof value === 'string' && modes.has(value as SystemAspect) ? value as SystemAspect : SystemAspect.SYNTHESIS; }
function normalizeContents(payload: MeshPayload) {
  if (Array.isArray(payload.contents)) return payload.contents as any[];
  if (typeof payload.text === 'string' && payload.text.trim()) return [{ role: 'user', parts: [{ text: payload.text }] }];
  throw new Error('AI_CONTENTS_REQUIRED');
}
function normalizeCapabilities(payload: MeshPayload) { return (payload.deployedCapabilities ?? []).map(capability => ({ id: capability.id, name: capability.name ?? capability.id, status: capability.status ?? 'Estável', metric: capability.metric ?? 100 })); }

export const createN02AIProviderBridge = (): Record<string, SoulMeshCapabilityHandler> => {
  const execute = async (message: SoulMeshMessage) => {
    const payload = (message.payload ?? {}) as MeshPayload;
    const response = await processUserDirective(normalizeMode(payload.mode), normalizeContents(payload), Boolean(payload.useWebSearch), normalizeCapabilities(payload) as any, Boolean(payload.isFullCognitionMode));
    const candidates = (response.candidates ?? []) as ProviderCandidate[];
    return { nucleus: 'N02', capability: message.capability, correlationId: message.correlationId, text: response.text, candidates: candidates.map(candidate => ({ finishReason: candidate.finishReason, safetyRatings: candidate.safetyRatings, groundingMetadata: candidate.groundingMetadata })) };
  };
  return { 'ai.generate': execute, 'ai.multimodal': execute, 'cognitive-processing': execute };
};
