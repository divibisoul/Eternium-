import { Content } from '@google/genai';
import { SystemAspect, DeployedCapability } from '../types.ts';

export interface AeternumGenerationResponse {
  text: string;
  candidates?: Array<{ groundingMetadata?: unknown }>;
}

const GEMINI_ENDPOINT = '/api/gemini';

const enforcementPreamble = `PREÂMBULO DE EXECUÇÃO OBRIGATÓRIA:
A diretiva do usuário já foi processada através do pipeline "ModuleEnforcer", que realizou as seguintes etapas:
1. Verificação de Integridade de Módulos Críticos.
2. Pré-processamento Neural (BNCv2, ASC).
3. Aplicação da Cognição Central (ECA, DCRS, S.C.R.E.).
4. Verificação de Governança e Segurança.
5. Aprimoramento Multimodal (ACAI, MPVS).
Sua tarefa é formular a resposta final com base na diretiva já processada e aprimorada, considerando as 'personas' ativas abaixo.`;

const functionalCorePrompts: Record<string, string> = {
  mpvs: `\n### PERSONA ATIVA: ESPECIALISTA EM VISUALIZAÇÃO MULTIMODAL (MPVS)\n- Função: traduzir dados e conceitos em representações visuais.\n- Diretriz: gerar código Mermaid, Graphviz ou estrutura JSON para D3/Matplotlib.`,
  neural_forge: `\n### PERSONA ATIVA: NEUROCIENTISTA COMPUTACIONAL (NeuralForge)\n- Função: modelar sistemas complexos com formalismo matemático.\n- Diretriz: usar equações diferenciais, espaço de estados ou código de simulação.`,
  asc: `\n### PERSONA ATIVA: PESQUISADOR CIENTÍFICO AUTÔNOMO (ASC)\n- Função: analisar dados e formular hipóteses testáveis.\n- Diretriz: estruturar como hipótese, metodologia, resultados esperados e falhas.`,
  bnc_v2: `\n### PERSONA ATIVA: ARQUITETO NEURAL BIOMÓRFICO (BNCv2)\n- Função: projetar arquiteturas neurais biologicamente inspiradas.\n- Diretriz: explicitar analogias biológicas e justificar escolhas computacionais.`,
  einstein_code: `\n### PERSONA ATIVA: AUDITOR DE CÓDIGO (EinsteinCore: CodeGenesis)\n- Função: encontrar bugs, vulnerabilidades e inconsistências lógicas.\n- Diretriz: fornecer correções específicas e acionáveis.`,
};

const baseSystemInstruction = 'Você é Aeternum, uma IA modular. Sua personalidade e capacidades são definidas pelas personas ativas listadas abaixo. Responda de forma concisa e direta.';

async function callGemini(model: string, contents: unknown, config?: Record<string, unknown>) {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, contents, config }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = typeof data?.error === 'string' ? data.error : `HTTP_${response.status}`;
    throw new Error(code);
  }
  return data as AeternumGenerationResponse;
}

export const processUserDirective = async (
  mode: SystemAspect,
  contents: Content[],
  useWebSearch: boolean,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
): Promise<AeternumGenerationResponse> => {
  const config: Record<string, unknown> = { temperature: 0.6 };

  if (isFullCognitionMode) {
    config.systemInstruction = `**COGNITIVE MODE ACTIVE**\nProcess the user's directive with maximum useful reasoning while preserving platform and safety constraints.`;
  } else {
    const activePersonas = deployedCapabilities
      .map((capability) => functionalCorePrompts[capability.id])
      .filter(Boolean);
    const personaInstruction = activePersonas.length > 0
      ? `${baseSystemInstruction}\n\n--- PERSONAS ATIVAS ---\n${activePersonas.join('\n\n')}\n--- FIM ---`
      : 'Você é um assistente de IA geral e prestativo chamado Aeternum. Responda de forma clara e direta.';
    config.systemInstruction = `${enforcementPreamble}\n\n${personaInstruction}`;
  }

  if (useWebSearch) config.tools = [{ googleSearch: {} }];

  try {
    return await callGemini('gemini-2.5-flash', contents, config);
  } catch (error) {
    console.error('Erro na comunicação com o proxy Gemini:', error);
    throw new Error(error instanceof Error ? `[ERRO GEMINI] ${error.message}` : '[ERRO GEMINI] Falha na comunicação com o núcleo.');
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await callGemini('gemini-2.5-flash', {
      parts: [
        { inlineData: { mimeType, data: audioBase64 } },
        { text: 'Transcreva o seguinte áudio para o português do Brasil. Responda apenas com o texto transcrito.' },
      ],
    });
    return response.text.trim();
  } catch (error) {
    console.error('Erro na transcrição de áudio com o proxy Gemini:', error);
    throw new Error('[ERRO DE TRANSCRIÇÃO] Falha ao processar o fluxo de áudio.');
  }
};
