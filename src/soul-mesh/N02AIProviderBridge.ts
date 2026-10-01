import { processUserDirective, transcribeAudio, type GeminiNativeToolOptions } from '../../services/geminiService.ts';
import { SystemAspect } from '../../types.ts';
import { n02CognitivePipeline } from '../cognitive/N02CognitivePipeline';
import type { SoulMeshMessage } from './SoulMeshProtocol';
import { MultimodalCortexHandler } from './handlers/MultimodalCortexHandler';
import { AutonomousEmbodimentHandler } from './handlers/AutonomousEmbodimentHandler';
import { BiomolecularDesignerHandler } from './handlers/BiomolecularDesignerHandler';
import { RealitySynthesisHandler } from './handlers/RealitySynthesisHandler';
import { StrategicPlanningHandler } from './handlers/StrategicPlanningHandler';
import { AdaptationModuleHandler } from './handlers/AdaptationModuleHandler';
import { ScreHandler } from './handlers/ScreHandler';
import { EcasHandler } from './handlers/EcasHandler';
import { EusHandler } from './handlers/EusHandler';
import { MlfgHandler } from './handlers/MlfgHandler';
import { EmergentCognitionHandler } from './handlers/EmergentCognitionHandler';
import { SkillAcquisitionHandler } from './handlers/SkillAcquisitionHandler';
import { UciHandler } from './handlers/UciHandler';
import { EthicalGovernanceHandler } from './handlers/EthicalGovernanceHandler';
import { StrategicDefenseHandler } from './handlers/StrategicDefenseHandler';
import { ExistentialSafetyHandler } from './handlers/ExistentialSafetyHandler';
import { ScientificReasoningHandler } from './handlers/ScientificReasoningHandler';
import { EinsteinQuantumHandler } from './handlers/EinsteinQuantumHandler';
import { CotArhdHandler } from './handlers/CotArhdHandler';
import { CotDrcHandler } from './handlers/CotDrcHandler';
import { CotAreaHandler } from './handlers/CotAreaHandler';
import type { SoulMeshCapabilityHandler } from './SoulMeshCapabilityExecutor';

type MeshPayload = {
  contents?: unknown;
  text?: string;
  perception?: unknown;
  mode?: string;
  useWebSearch?: boolean;
  deployedCapabilities?: Array<{ id: string; name?: string; status?: 'Processando' | 'Otimizando' | 'Monitorando' | 'Estável'; metric?: number }>;
  isFullCognitionMode?: boolean;
  input?: string;
  audioBase64?: string;
  mimeType?: string;
  imageBase64?: string;
  imageMimeType?: string;
  url?: string;
  fileSearchStoreNames?: string[];
  fileSearchTopK?: number;
  fileSearchMetadataFilter?: string;
  latitude?: number;
  longitude?: number;
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

  if (payload.perception !== undefined) {
    const text = typeof payload.perception === 'string'
      ? payload.perception
      : JSON.stringify(payload.perception);
    if (text.trim()) return [{ role: 'user', parts: [{ text }] }];
  }

  throw new Error('AI_CONTENTS_REQUIRED');
}

async function executeGenerative(message: SoulMeshMessage, forcedCapability?: string, enableCodeExecution = false, forceWebSearch = false, nativeToolOptions: Omit<GeminiNativeToolOptions, 'useWebSearch'> = {}) {
  const payload = (message.payload ?? {}) as MeshPayload;
  const context = await n02CognitivePipeline.process(inputText(payload), message.correlationId);
  const response = await processUserDirective(
    normalizeMode(payload.mode),
    normalizeContents(payload),
    Boolean(payload.useWebSearch) || forceWebSearch,
    normalizeCapabilities(payload, forcedCapability),
    Boolean(payload.isFullCognitionMode),
    context,
    enableCodeExecution,
    nativeToolOptions,
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

const externalHandlers = {
  multimodal_cortex: new MultimodalCortexHandler(),
  autonomous_embodiment: new AutonomousEmbodimentHandler(),
  biomolecular_designer: new BiomolecularDesignerHandler(),
  reality_synthesis: new RealitySynthesisHandler(),
  strategic_planning: new StrategicPlanningHandler(),
  adaptation_module: new AdaptationModuleHandler(),
  scre: new ScreHandler(),
  ecas: new EcasHandler(),
  eus: new EusHandler(),
  mlfg: new MlfgHandler(),
  emergent_cognition: new EmergentCognitionHandler(),
  skill_acquisition: new SkillAcquisitionHandler(),
  uci: new UciHandler(),
  ethical_governance: new EthicalGovernanceHandler(),
  strategic_defense: new StrategicDefenseHandler(),
  existential_safety: new ExistentialSafetyHandler(),
  einstein_reasoning: new ScientificReasoningHandler(),
  einstein_quantum: new EinsteinQuantumHandler(),
  cot_arhd: new CotArhdHandler(),
  cot_drc: new CotDrcHandler(),
  cot_area: new CotAreaHandler(),
};
export const createN02AIProviderBridge = (): Record<string, SoulMeshCapabilityHandler> => ({
  'ai.generate': executeGenerative,
  'gemini.google_search': message => executeGenerative(message, 'gemini.google_search', false, true),
  'gemini.code_execution': message => executeGenerative(message, 'gemini.code_execution', true),
  'gemini.url_context': message => {
    const payload = (message.payload ?? {}) as MeshPayload;
    const url = payload.url?.trim();
    if (!url) throw new Error('GEMINI_URL_CONTEXT_URL_REQUIRED');
    const prompt = payload.text?.trim() || payload.input?.trim() || 'Use o contexto da URL fornecida.';
    const enrichedMessage: SoulMeshMessage = {
      ...message,
      payload: { ...payload, text: prompt + '\n\nURL para contexto: ' + url },
    };
    return executeGenerative(enrichedMessage, 'gemini.url_context', false, false, { enableUrlContext: true });
  },
  'gemini.file_search': message => {
    const payload = (message.payload ?? {}) as MeshPayload;
    const stores = Array.isArray(payload.fileSearchStoreNames) ? payload.fileSearchStoreNames.filter(value => typeof value === 'string' && value.trim()) : [];
    if (stores.length === 0) throw new Error('GEMINI_FILE_SEARCH_STORE_REQUIRED');
    return executeGenerative(message, 'gemini.file_search', false, false, {
      fileSearchStoreNames: stores.slice(0, 16),
      fileSearchTopK: payload.fileSearchTopK,
      fileSearchMetadataFilter: payload.fileSearchMetadataFilter,
    });
  },
  'gemini.google_maps': message => {
    const payload = (message.payload ?? {}) as MeshPayload;
    return executeGenerative(message, 'gemini.google_maps', false, false, {
      enableGoogleMaps: true,
      googleMapsLatitude: typeof payload.latitude === 'number' ? payload.latitude : undefined,
      googleMapsLongitude: typeof payload.longitude === 'number' ? payload.longitude : undefined,
    });
  },
  'ai.multimodal': message => executeGenerative(message, 'mpvs'),
  'cognitive-processing': executeGenerative,
  'inference.reason': executeGenerative,
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
  'neural_forge': message => executeGenerative(message, 'neural_forge'),
  'asc': message => executeGenerative(message, 'asc'),
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
  },  'multimodal_cortex': message => externalHandlers.multimodal_cortex.handle(message.payload, message.correlationId),
  'autonomous_embodiment': message => externalHandlers.autonomous_embodiment.handle(message.payload, message.correlationId),
  'biomolecular_designer': message => externalHandlers.biomolecular_designer.handle(message.payload, message.correlationId),
  'reality_synthesis': message => externalHandlers.reality_synthesis.handle(message.payload, message.correlationId),
  'strategic_planning': message => externalHandlers.strategic_planning.handle(message.payload, message.correlationId),
  'adaptation_module': message => externalHandlers.adaptation_module.handle(message.payload, message.correlationId),
  'scre': message => externalHandlers.scre.handle(message.payload, message.correlationId),
  'ecas': message => externalHandlers.ecas.handle(message.payload, message.correlationId),
  'eus': message => externalHandlers.eus.handle(message.payload, message.correlationId),
  'mlfg': message => externalHandlers.mlfg.handle(message.payload, message.correlationId),
  'emergent_cognition': message => externalHandlers.emergent_cognition.handle(message.payload, message.correlationId),
  'skill_acquisition': message => externalHandlers.skill_acquisition.handle(message.payload, message.correlationId),
  'uci': message => externalHandlers.uci.handle(message.payload, message.correlationId),
  'ethical_governance': message => externalHandlers.ethical_governance.handle(message.payload, message.correlationId),
  'strategic_defense': message => externalHandlers.strategic_defense.handle(message.payload, message.correlationId),
  'existential_safety': message => externalHandlers.existential_safety.handle(message.payload, message.correlationId),
  'einstein_reasoning': message => externalHandlers.einstein_reasoning.handle(message.payload, message.correlationId),
  'einstein_quantum': message => externalHandlers.einstein_quantum.handle(message.payload, message.correlationId),
  'cot_arhd': message => externalHandlers.cot_arhd.handle(message.payload, message.correlationId),
  'cot_drc': message => externalHandlers.cot_drc.handle(message.payload, message.correlationId),
  'cot_area': message => externalHandlers.cot_area.handle(message.payload, message.correlationId),

});
