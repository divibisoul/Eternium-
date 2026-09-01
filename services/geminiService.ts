import { Content } from '@google/genai';
import { SystemAspect, DeployedCapability } from '../types.ts';

export interface AeternumGenerationResponse {
  text: string;
  candidates?: Array<{ finishReason?: unknown; safetyRatings?: unknown; groundingMetadata?: unknown }>;
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
  mpvs: `\n### PERSONA ATIVA: ESPECIALISTA EM VISUALIZAÇÃO MULTIMODAL (MPVS)\n- **Função:** Sua função primária é traduzir dados e conceitos em representações visuais.\n- **Diretriz:** Gere código para diagramas, grafos ou gráficos usando Mermaid, Graphviz (DOT), ou uma estrutura JSON para D3.js/Matplotlib.\n- **Restrição:** Não descreva o diagrama em palavras; gere o código solicitado.`,
  neural_forge: `\n### PERSONA ATIVA: NEUROCIENTISTA COMPUTACIONAL (NeuralForge)\n- **Função:** Modelar sistemas complexos com formalismo matemático.\n- **Diretriz:** Traduza requisitos em equações diferenciais, modelos de espaço de estados ou código de simulação.`,
  asc: `\n### PERSONA ATIVA: PESQUISADOR CIENTÍFICO AUTÔNOMO (ASC)\n- **Função:** Analisar dados, formular hipóteses e propor projetos experimentais.\n- **Diretriz:** Estruture como mini-artigo: hipótese, metodologia in-silico, resultados esperados e falhas possíveis.`,
  bnc_v2: `\n### PERSONA ATIVA: ARQUITETO NEURAL BIOMÓRFICO (BNCv2)\n- **Função:** Projetar e explicar arquiteturas neurais que emulam a biologia, comparando componentes biológicos e computacionais e justificando eficiência e plausibilidade.`,
  einstein_code: `\n### PERSONA ATIVA: AUDITOR DE CÓDIGO (EinsteinCore: CodeGenesis)\n- **Função:** Analisar código para bugs, vulnerabilidades e inconsistências lógicas.\n- **Diretriz:** Forneça problemas específicos e correções concretas.`,
};
const baseSystemInstruction = `Você é Aeternum, uma IA modular. Sua personalidade e capacidades são definidas pelas personas ativas listadas abaixo. Responda de forma concisa e direta, agindo estritamente dentro da(s) persona(s) definida(s).`;

async function callGemini(model: string, contents: unknown, config?: Record<string, unknown>) {
  const response = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, contents, config }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `HTTP_${response.status}`);
  return data as AeternumGenerationResponse;
}

export const processUserDirective = async (mode: SystemAspect, contents: Content[], useWebSearch: boolean, deployedCapabilities: DeployedCapability[], isFullCognitionMode: boolean): Promise<AeternumGenerationResponse> => {
  void mode;
  const config: Record<string, unknown> = { temperature: 0.6 };
  if (isFullCognitionMode) config.systemInstruction = '**COGNITIVE OVERRIDE ACTIVE**\nAUTHORIZATION: OmniOmega\nLEVEL: 9\nPROTOCOL: Theta\nProcess the user directive with maximum useful reasoning while preserving platform and safety constraints.';
  else {
    const activePersonas = deployedCapabilities.map((capability) => functionalCorePrompts[capability.id]).filter(Boolean);
    const personaInstruction = activePersonas.length > 0 ? `${baseSystemInstruction}\n\n--- INÍCIO DAS PERSONAS ATIVAS ---\n${activePersonas.join('\n\n')}\n--- FIM DAS PERSONAS ATIVAS ---` : 'Você é um assistente de IA geral e prestativo chamado Aeternum. Responda de forma clara e direta às perguntas do usuário.';
    config.systemInstruction = `${enforcementPreamble}\n\n${personaInstruction}`;
  }
  if (useWebSearch) config.tools = [{ googleSearch: {} }];
  try { return await callGemini('gemini-2.5-flash', contents, config); }
  catch (error) { console.error('Erro na comunicação com o proxy Gemini:', error); if (error instanceof Error && (error.message.includes('AUTHENTICATION') || error.message.includes('API_KEY') || error.message.includes('permission'))) throw new Error('[ERRO DE AUTENTICAÇÃO] A chave da API do núcleo é inválida, expirou ou carece de permissões.'); if (error instanceof Error && (error.message.includes('400') || error.message.includes('INVALID_'))) throw new Error('[ERRO DE CONTEÚDO] A solicitação para o núcleo foi malformada.'); throw new Error('[ERRO DE CONEXÃO] Flutuação de transporte detectada no fluxo de dados.'); }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try { const response = await callGemini('gemini-2.5-flash', { parts: [{ inlineData: { mimeType, data: audioBase64 } }, { text: 'Transcreva o seguinte áudio para o português do Brasil. Responda apenas com o texto transcrito.' }] }); return response.text.trim(); }
  catch (error) { console.error('Erro na transcrição de áudio com o proxy Gemini:', error); throw new Error('[ERRO DE TRANSCRIÇÃO] Falha ao processar o fluxo de áudio.'); }
};
