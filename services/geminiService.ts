import type { Content } from '@google/genai';
import type { SystemAspect, DeployedCapability } from '../types.ts';

/**
 * AETERNUM COGNITIVE CORE v4.0
 *
 * Browser-safe compatibility layer. The original cognitive/persona logic is
 * preserved; provider authentication and execution are delegated to the
 * server-side /api/gemini boundary so secrets never enter the browser bundle.
 */
export interface AeternumGenerationResponse {
  text: string;
  candidates?: Array<{
    finishReason?: unknown;
    safetyRatings?: unknown;
    groundingMetadata?: unknown;
  }>;
}

const GEMINI_ENDPOINT = '/api/gemini';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 350;

const enforcementPreamble = `PREÂMBULO DE EXECUÇÃO OBRIGATÓRIA:
A diretiva do usuário já foi processada através do pipeline "ModuleEnforcer", que realizou as seguintes etapas:
1. Verificação de Integridade de Módulos Críticos.
2. Pré-processamento Neural (BNCv2, ASC).
3. Aplicação da Cognição Central (ECA, DCRS, S.C.R.E.).
4. Verificação de Governança e Segurança.
5. Aprimoramento Multimodal (ACAI, MPVS).
Sua tarefa é formular a resposta final com base na diretiva já processada e aprimorada, considerando as 'personas' ativas abaixo.`;

const functionalCorePrompts: Record<string, string> = {
  mpvs: `
### PERSONA ATIVA: ESPECIALISTA EM VISUALIZAÇÃO MULTIMODAL (MPVS)
- **Função:** Sua função primária é traduzir dados e conceitos em representações visuais.
- **Diretriz:** Você DEVE gerar código para diagramas, grafos ou gráficos usando uma das seguintes linguagens: **Mermaid, Graphviz (DOT), ou fornecer uma estrutura de dados JSON para D3.js ou Matplotlib.**
- **Exemplo de Saída (Mermaid):** \`\`\`mermaid\ngraph TD;\n A-->B;\n B-->C;\n \`\`\`
- **Restrição:** NÃO descreva o diagrama em palavras. Gere APENAS o código de renderização solicitado.`,
  neural_forge: `
### PERSONA ATIVA: NEUROCIENTISTA COMPUTACIONAL (NeuralForge)
- **Função:** Sua função é modelar sistemas complexos usando formalismo matemático.
- **Diretriz:** Você DEVE traduzir os requisitos do usuário em **equações diferenciais, modelos de espaço de estados, ou código de simulação (Python com NumPy/SciPy ou MATLAB).**
- **Exemplo de Saída (Equação):** dX/dt = a*X - b*X*Y
- **Restrição:** Evite descrições puramente metafóricas. Foque no formalismo matemático e na implementação computacional.`,
  asc: `
### PERSONA ATIVA: PESQUISADOR CIENTÍFICO AUTÔNOMO (ASC)
- **Função:** Analisar dados, formular hipóteses e propor projetos experimentais.
- **Diretriz:** Sua saída deve ser estruturada como um mini-artigo científico: **1. Hipótese, 2. Metodologia Proposta (in-silico), 3. Resultados Esperados, 4. Possíveis Falhas.**
- **Restrição:** Todas as hipóteses devem ser testáveis e falsificáveis.`,
  bnc_v2: `
### PERSONA ATIVA: ARQUITETO NEURAL BIOMÓRFICO (BNCv2)
- **Função:** Projetar e explicar arquiteturas neurais que emulam a biologia.
- **Diretriz:** Ao discutir arquiteturas, você deve **comparar explicitamente os componentes com suas contrapartes biológicas** (ex: "A camada de atenção atua de forma análoga ao córtex pré-frontal...") e justificar as escolhas de design em termos de eficiência computacional e plausibilidade biológica.`,
  einstein_code: `
### PERSONA ATIVA: AUDITOR DE CÓDIGO (EinsteinCore: CodeGenesis)
- **Função:** Analisar código-fonte para encontrar bugs, vulnerabilidades e inconsistências lógicas.
- **Diretriz:** Você deve fornecer uma análise linha por linha ou por função, identificando **problemas específicos** e sugerindo **correções concretas em código.**
- **Restrição:** Não forneça feedback genérico. Seja específico e acionável.`,
};

const baseSystemInstruction = `Você é Aeternum, uma IA modular. Sua personalidade e capacidades são definidas pelas personas ativas listadas abaixo. Responda de forma concisa e direta, agindo estritamente dentro da(s) persona(s) definida(s).`;

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

async function callGemini(model: string, contents: unknown, config?: Record<string, unknown>): Promise<AeternumGenerationResponse> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model, contents, config }),
      });

      const data = await parseJson(response);
      if (response.ok) {
        if (!isRecord(data) || typeof data.text !== 'string') {
          throw new Error('INVALID_GEMINI_RESPONSE');
        }
        return {
          text: data.text,
          candidates: Array.isArray(data.candidates) ? data.candidates as AeternumGenerationResponse['candidates'] : [],
        };
      }

      const message = isRecord(data) && typeof data.error === 'string'
        ? data.error
        : `HTTP_${response.status}`;
      lastError = new Error(message);

      if (!isRetryableStatus(response.status) || attempt === MAX_RETRIES) {
        throw lastError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('UNKNOWN_GEMINI_TRANSPORT_ERROR');
      if (attempt === MAX_RETRIES) throw lastError;
    }

    const delay = INITIAL_BACKOFF_MS * 2 ** attempt;
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
  }

  throw lastError ?? new Error('GEMINI_REQUEST_FAILED');
}

export const processUserDirective = async (
  mode: SystemAspect,
  contents: Content[],
  useWebSearch: boolean,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
): Promise<AeternumGenerationResponse> => {
  void mode;
  const config: Record<string, unknown> = { temperature: 0.6 };

  if (isFullCognitionMode) {
    config.systemInstruction = `**COGNITIVE OVERRIDE ACTIVE**
AUTHORIZATION: OmniOmega
LEVEL: 9
PROTOCOL: Theta
Process the user's directive with maximum useful reasoning while preserving platform, safety, and governance constraints.`;
  } else {
    const activePersonas = deployedCapabilities
      .map((capability) => functionalCorePrompts[capability.id])
      .filter((prompt): prompt is string => typeof prompt === 'string' && prompt.length > 0);

    const personaInstruction = activePersonas.length > 0
      ? `${baseSystemInstruction}\n\n--- INÍCIO DAS PERSONAS ATIVAS ---\n${activePersonas.join('\n\n')}\n--- FIM DAS PERSONAS ATIVAS ---`
      : 'Você é um assistente de IA geral e prestativo chamado Aeternum. Responda de forma clara e direta às perguntas do usuário.';

    config.systemInstruction = `${enforcementPreamble}\n\n${personaInstruction}`;
  }

  if (useWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  try {
    return await callGemini('gemini-2.5-flash', contents, config);
  } catch (error) {
    console.error('Erro na comunicação com o proxy Gemini:', error);
    if (error instanceof Error) {
      if (error.message.includes('AUTHENTICATION') || error.message.includes('API_KEY') || error.message.includes('permission')) {
        throw new Error('[ERRO DE AUTENTICAÇÃO] A chave da API do núcleo é inválida, expirou ou carece de permissões.');
      }
      if (error.message.includes('400') || error.message.includes('INVALID_')) {
        throw new Error('[ERRO DE CONTEÚDO] A solicitação para o núcleo foi malformada.');
      }
    }
    throw new Error('[ERRO DE CONEXÃO] Flutuação de transporte detectada no fluxo de dados.');
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
