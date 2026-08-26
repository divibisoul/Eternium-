import type { DeployedCapability, SystemAspect } from '../types.ts';

export interface AIContent {
  role: string;
  parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }>;
}

export interface AIProviderResponse {
  text: string;
  groundingMetadata?: unknown;
}

export interface SoulAIProvider {
  generate(input: {
    mode: SystemAspect;
    contents: AIContent[];
    systemInstruction: string;
    useWebSearch: boolean;
  }): Promise<AIProviderResponse>;
  transcribeAudio?(audioBase64: string, mimeType: string): Promise<string>;
}

let activeProvider: SoulAIProvider | null = null;

/**
 * The nucleus ships without an AI model. The user supplies an AI through the
 * hybrid APK Web Session / Pilot boundary at runtime.
 */
export function registerSoulAIProvider(provider: SoulAIProvider | null) {
  activeProvider = provider;
}

export function getSoulAIProvider(): SoulAIProvider {
  if (!activeProvider) throw new Error('AI_PROVIDER_NOT_CONNECTED');
  return activeProvider;
}

const functionalCorePrompts: Record<string, string> = {
  mpvs: 'Translate data and concepts into visual representations; prefer Mermaid, Graphviz or structured JSON suitable for visualization.',
  neural_forge: 'Model complex systems with mathematical formalisms or executable computational simulations.',
  asc: 'Analyze data, formulate testable hypotheses, propose in-silico methodology, expected results and failure modes.',
  bnc_v2: 'Design biomimetic neural architectures and explain computational efficiency and biological analogies.',
  einstein_code: 'Audit source code for concrete bugs, vulnerabilities and logical inconsistencies and propose actionable fixes.',
};

function buildSystemInstruction(
  mode: SystemAspect,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
) {
  const activePersonas = deployedCapabilities
    .map((capability) => functionalCorePrompts[capability.id])
    .filter(Boolean);

  const personaInstruction = activePersonas.length
    ? activePersonas.join('\n\n')
    : 'Act as a clear, direct and useful AI assistant.';

  const cognitionInstruction = isFullCognitionMode
    ? 'Use the full set of currently available capabilities, while retaining normal safety, privacy and authorization boundaries.'
    : 'Use only capabilities that are actually available and authorized.';

  return [
    `Mode: ${mode}`,
    cognitionInstruction,
    personaInstruction,
    'The nucleus contains no built-in AI model. AI inference is supplied by the authenticated Web Session provider.',
  ].join('\n\n');
}

export async function processUserDirective(
  mode: SystemAspect,
  contents: AIContent[],
  useWebSearch: boolean,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
): Promise<AIProviderResponse> {
  return getSoulAIProvider().generate({
    mode,
    contents,
    systemInstruction: buildSystemInstruction(mode, deployedCapabilities, isFullCognitionMode),
    useWebSearch,
  });
}

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const provider = getSoulAIProvider();
  if (!provider.transcribeAudio) throw new Error('AI_PROVIDER_TRANSCRIPTION_UNAVAILABLE');
  return provider.transcribeAudio(audioBase64, mimeType);
}
