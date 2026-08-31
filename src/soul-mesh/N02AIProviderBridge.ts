import { processUserDirective } from '../../services/geminiService.ts';
import { generateFastInference, type GroqMessage } from '../../lib/ai/groqProvider.ts';
import { SystemAspect } from '../../types.ts';
import type { SoulMeshMessage } from './SoulMeshProtocol';
import type { SoulMeshCapabilityHandler } from './SoulMeshCapabilityExecutor';

type MeshPayload = {
  contents?: unknown;
  text?: string;
  mode?: string;
  useWebSearch?: boolean;
  fast_inference?: boolean;
  deployedCapabilities?: Array<{ id: string; name?: string; status?: 'Processando' | 'Otimizando' | 'Monitorando' | 'Estável'; metric?: number }>;
  isFullCognitionMode?: boolean;
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
    status: capability.status ?? 'Estável',
    metric: capability.metric ?? 100,
  }));
}

function toFastMessages(contents: any[], systemInstruction: string): GroqMessage[] {
  const messages: GroqMessage[] = [{ role: 'system', content: systemInstruction }];
  for (const item of contents) {
    const role = item?.role === 'model' ? 'assistant' : item?.role === 'assistant' ? 'assistant' : 'user';
    const text = Array.isArray(item?.parts)
      ? item.parts.filter((part: any) => typeof part?.text === 'string').map((part: any) => part.text).join('\n')
      : typeof item?.content === 'string' ? item.content : '';
    if (text.trim()) messages.push({ role, content: text });
  }
  return messages;
}

export const createN02AIProviderBridge = (): Record<string, SoulMeshCapabilityHandler> => {
  const execute = async (message: SoulMeshMessage) => {
    const payload = (message.payload ?? {}) as MeshPayload;
    const contents = normalizeContents(payload);

    if (payload.fast_inference === true && payload.useWebSearch !== true && payload.isFullCognitionMode !== true) {
      const systemInstruction = 'Você é Aeternum, N02, núcleo de linguagem da Soul Mesh. Responda com precisão, clareza e contexto. Não invente fatos.';
      const fast = await generateFastInference({
        messages: toFastMessages(contents, systemInstruction),
        temperature: 0.6,
      });
      return {
        nucleus: 'N02',
        capability: message.capability,
        correlationId: message.correlationId,
        text: fast.text,
        provider: fast.provider,
        model: fast.model,
        candidates: [],
      };
    }

    const response = await processUserDirective(
      normalizeMode(payload.mode),
      contents,
      Boolean(payload.useWebSearch),
      normalizeCapabilities(payload) as any,
      Boolean(payload.isFullCognitionMode),
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
    };
  };

  return {
    'ai.generate': execute,
    'ai.multimodal': execute,
    'cognitive-processing': execute,
  };
};
