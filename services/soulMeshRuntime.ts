import { Content } from '@google/genai';
import { processUserDirective } from './geminiService.ts';
import { SystemAspect } from '../types.ts';

export interface SoulMeshTaskPayload {
  prompt?: string;
  input?: unknown;
  mode?: 'Harmonia' | 'Análise' | 'Abstrato' | 'Síntese';
  useWebSearch?: boolean;
  image?: { data: string; mimeType: string };
  context?: Record<string, unknown>;
}

const modeForCapability = (capability: string): SystemAspect => {
  if (capability === 'planning' || capability === 'reasoning' || capability === 'einstein_reasoning') return SystemAspect.ANALYSIS;
  if (capability === 'multimodal-analysis' || capability === 'mpvs' || capability === 'multimodal_cortex') return SystemAspect.ANALYSIS;
  if (capability === 'eus' || capability === 'emergent_cognition' || capability === 'ecas') return SystemAspect.ABSTRACT;
  return SystemAspect.SYNTHESIS;
};

const promptFor = (capability: string, payload: SoulMeshTaskPayload): string => {
  const input = payload.prompt ?? (typeof payload.input === 'string' ? payload.input : JSON.stringify(payload.input ?? {}));
  const context = payload.context ? `\nContexto de execução: ${JSON.stringify(payload.context)}` : '';
  return `[Soul Mesh N02] Capability=${capability}. Execute a capacidade solicitada usando o runtime cognitivo real do N02. Não alegue execução de ferramenta que não exista. Retorne resultado verificável e indique limitações quando aplicável.\n\nEntrada:\n${input}${context}`;
};

export async function executeN02Capability(capability: string, payload: SoulMeshTaskPayload): Promise<unknown> {
  const supported = new Set([
    'gemini-inference', 'reasoning', 'planning', 'multimodal-analysis',
    'cognitive.process', 'mpvs', 'multimodal_cortex', 'eus', 'ecas',
    'asc', 'einstein_reasoning', 'einstein_code', 'einstein_quantum',
    'neural_forge', 'csae', 'dcrs', 'adaptation_module', 'scre', 'mlfg',
    'cot_arhd', 'cot_drc', 'cot_area', 'emergent_cognition',
    'ethical_governance', 'biomolecular_designer', 'strategic_planning',
    'existential_safety', 'skill_acquisition', 'reality_synthesis',
  ]);

  if (!supported.has(capability)) {
    return { supported: false, code: 'CAPABILITY_HANDLER_NOT_REGISTERED', capability };
  }

  const prompt = promptFor(capability, payload);
  const contents: Content[] = [{ role: 'user', parts: [{ text: prompt }] }];
  if (payload.image?.data && payload.image?.mimeType) {
    contents[0].parts.push({ inlineData: { data: payload.image.data, mimeType: payload.image.mimeType } });
  }

  const response = await processUserDirective(
    payload.mode ? (payload.mode as SystemAspect) : modeForCapability(capability),
    contents,
    Boolean(payload.useWebSearch),
    [],
    false,
  );

  return {
    supported: true,
    capability,
    provider: 'N02:Eternium-Gemini',
    text: response.text,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata ?? null,
  };
}
