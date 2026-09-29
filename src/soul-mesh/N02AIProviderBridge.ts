import { processUserDirective, transcribeAudio } from '../../services/geminiService.ts';
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
  audioBase64?: string;
  mimeType?: string;
  imageBase64?: string;
  imageMimeType?: string;
};

const modes = new Set(Object.values(SystemAspect));

function normalizeMode(value: unknown): SystemAspect {
  return typeof value === 'string' && modes.has(value as SystemAspect)
    ? value as SystemAspect
    : SystemAspect.SYNTHESIS;
}

function normalizeCapabilities(payload: MeshPayload, forcedId?: string) {
  const declared = Array.isArray(payload.deployedCapabilities) ? payload.deployedCapabilities : [];
  const fromPayload = declared.map(capability => ({
    id: capability.id,
    name: capability.name ?? capability.id,
    status: capability.status ?? 'Estável',
    metric: capability.metric ?? 100,
  }));

  if (forcedId && !fromPayload.some(capability => capability.id === forcedId)) {
    fromPayload.push({ id: forcedId, name: forcedId, status: 'Estável', metric: 100 });
  }

  return fromPayload;
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

function normalizeContents(payload: MeshPayload): any[] {
  if (Array.isArray(payload.contents) && payload.contents.length > 0) return payload.contents as any[];

  if (payload.imageBase64?.trim()) {
    const mimeType = payload.imageMimeType?.trim();
    if (!mimeType) throw new Error('MPVS_IMAGE_MIME_TYPE_REQUIRED');

    return [{
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: payload.imageBase64 } },
        { text: payload.text?.trim() || payload.input?.trim() || 'Analise a entrada visual fornecida.' },
      ],
    }];
  }

  if (typeof payload.text === 'string' && payload.text.trim()) {
    return [{ role: 'user', parts: [{ text: payload.text.trim() }] }];
  }

  throw new Error('AI_CONTENTS_REQUIRED');
}

async function executeGenerative(message: SoulMeshMessage, forcedCapability?: string) {
  const payload = (message.payload ?? {}) as MeshPayload;
  const context = await n02CognitivePipeline.process(inputText(payload), message.correlationId);
  const response = await processUserDirective(
    normalizeMode(payload.mode),
    normalizeContents(payload),
    Boolean(payload.useWebSearch),
    normalizeCapabilities(payload, forcedCapability),
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
}

export const createN02AIProviderBridge = (): Record<string, SoulMeshCapabilityHandler> => ({
  'ai.generate': executeGenerative,
  'ai.multimodal': message => executeGenerative(message, 'mpvs'),
  'cognitive-processing': executeGenerative,
  'acai': async message => {
    const payload = (message.payload ?? {}) as MeshPayload;
    const audioBase64 = payload.audioBase64?.trim();
    const mimeType = payload.mimeType?.trim();
    if (!audioBase64 || !mimeType) throw new Error('ACAI_AUDIO_INPUT_REQUIRED');

    const transcript = await transcribeAudio(audioBase64, mimeType);
    const context = await n02CognitivePipeline.process(transcript, message.correlationId);
    const response = await processUserDirective(
      normalizeMode(payload.mode),
      [{ role: 'user', parts: [{ text: transcript }] }],
      Boolean(payload.useWebSearch),
      normalizeCapabilities(payload, 'acai'),
      Boolean(payload.isFullCognitionMode),
      context,
    );

    return {
      nucleus: 'N02',
      capability: message.capability,
      correlationId: message.correlationId,
      transcript,
      text: response.text,
      cognitivePipeline: context,
    };
  },
  'mpvs': message => executeGenerative(message, 'mpvs'),
  'einstein_code': message => executeGenerative(message, 'einstein_code'),
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
});
