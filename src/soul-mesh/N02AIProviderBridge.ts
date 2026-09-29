import { processUserDirective } from '../../services/geminiService.ts';
import { SystemAspect } from '../../types.ts';
import { n02CognitivePipeline } from '../cognitive/N02CognitivePipeline';
import type { SoulMeshMessage } from './SoulMeshProtocol';
import type { SoulMeshCapabilityHandler } from './SoulMeshCapabilityExecutor';

type MeshPayload = {
  contents?: unknown;
  text?: string;
  mode?: string;
  useWebSearch?: boolean;
  deployedCapabilities?: Array<{ id: string; name?: string; status?: 'Processando' | 'Otimizando' | 'Monitorando' | 'Estável'; metric?: number }>;
  isFullCognitionMode?: boolean;
  input?: string;
};

const modes = new Set(Object.values(SystemAspect));

function normalizeMode(value: unknown): SystemAspect {
  return typeof value === 'string' && modes.has(value as SystemAspect)
    ? value as SystemAspect
    : SystemAspect.SYNTHESIS;
}

function normalizeContents(payload: MeshPayload) {
  if (Array.isArray(payload.contents)) return payload.contents as any[];
  if (typeof payload.text === 'string' && payload.text.trim()) {
    return [{ role: 'user', parts: [{ text: payload.text }] }];
  }
  throw new Error('AI_CONTENTS_REQUIRED');
}

function normalizeCapabilities(payload: MeshPayload) {
  return (payload.deployedCapabilities ?? []).map(capability => ({
    id: capability.id,
    name: capability.name ?? capability.id,
    status: capability.status ?? 'Monitorando',
    metric: capability.metric ?? 0,
    measured: capability.measured === true,
  }));
}

function inputText(payload: MeshPayload): string {
  if (typeof payload.input === 'string' && payload.input.trim()) return payload.input.trim();
  if (typeof payload.text === 'string' && payload.text.trim()) return payload.text.trim();

  const first = Array.isArray(payload.contents) ? payload.contents[0] : undefined;
  if (first && typeof first === 'object') {
    const parts = (first as { parts?: Array<{ text?: unknown }> }).parts;
    const text = parts?.map(part => typeof part?.text === 'string' ? part.text : '').filter(Boolean).join('\n').trim();
    if (text) return text;
  }

  return JSON.stringify(payload.contents ?? {});
}

export const createN02AIProviderBridge = (): Record<string, SoulMeshCapabilityHandler> => {
  const execute = async (message: SoulMeshMessage) => {
    const payload = (message.payload ?? {}) as MeshPayload;
    const context = await n02CognitivePipeline.process(inputText(payload), message.correlationId);

    const response = await processUserDirective(
      normalizeMode(payload.mode),
      normalizeContents(payload),
      Boolean(payload.useWebSearch),
      normalizeCapabilities(payload) as any,
      Boolean(payload.isFullCognitionMode),
      context,
    );

    return {
      nucleus: 'N02',
      capability: message.capability,
      correlationId: message.correlationId,
      text: response.text,
      candidates: response.candidates?.map(candidate => ({
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        groundingMetadata: candidate.groundingMetadata,
      })),
      cognitivePipeline: context,
    };
  };

  return {
    'ai.generate': execute,
    'ai.multimodal': execute,
    'cognitive-processing': execute,
    'neural.bnc_v2': async message => {
      const payload = (message.payload ?? {}) as MeshPayload;
      return n02CognitivePipeline.process(inputText(payload), message.correlationId);
    },
    'cognitive.csae': async message => {
      const payload = (message.payload ?? {}) as MeshPayload;
      return (await n02CognitivePipeline.process(inputText(payload), message.correlationId)).csae;
    },
    'resource.dcrs': async message => {
      const payload = (message.payload ?? {}) as MeshPayload;
      return (await n02CognitivePipeline.process(inputText(payload), message.correlationId)).dcrs;
    },
  };
};
