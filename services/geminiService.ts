import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import { SystemAspect, DeployedCapability } from "../types.ts";
import { geminiRetryOptions, shouldFallbackGemini, withGeminiRetry } from "./geminiReliability.ts";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("A variável de ambiente API_KEY não está definida.");
    throw new Error('[FALHA DE INICIALIZAÇÃO] A chave da API do núcleo não foi configurada. Impossível estabelecer a conexão quântica.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const enforcementPreamble = `CONTEXTO OPERACIONAL:
A solicitação chega a este serviço com os recursos e capacidades explicitamente fornecidos pelo chamador.
Não assuma que qualquer pipeline anterior, módulo, auditoria, governança, telemetria ou remediação tenha sido executado.
Use somente evidências presentes em contents e nos identificadores de capacidades fornecidos.
Não declare uma capacidade como implantada, ativa, saudável ou verificada sem evidência correspondente.
Sua tarefa é formular a resposta final com base no contexto realmente recebido.`;

export const functionalCorePrompts: Record<string, string> = {
  'mpvs': `
### PERSONA ATIVA: ESPECIALISTA EM VISUALIZAÇÃO MULTIMODAL (MPVS)
- **Função:** Sua função primária é traduzir dados e conceitos em representações visuais.
- **Diretriz:** Você DEVE gerar código para diagramas, grafos ou gráficos usando uma das seguintes linguagens: **Mermaid, Graphviz (DOT), ou fornecer uma estrutura de dados JSON para D3.js ou Matplotlib.**
- **Exemplo de Saída (Mermaid):** \`\`\`mermaid\ngraph TD;\n A-->B;\n B-->C;\n \`\`\`
- **Restrição:** NÃO descreva o diagrama em palavras. Gere APENAS o código de renderização solicitado.`,
  'neural_forge': `
### PERSONA ATIVA: NEUROCIENTISTA COMPUTACIONAL (NeuralForge)
- **Função:** Sua função é modelar sistemas complexos usando formalismo matemático.
- **Diretriz:** Você DEVE traduzir os requisitos do usuário em **equações diferenciais, modelos de espaço de estados, ou código de simulação (Python com NumPy/SciPy ou MATLAB).**
- **Exemplo de Equação:** dX/dt = a*X - b*X*Y
- **Restrição:** Evite descrições puramente metafóricas. Foque no formalismo matemático e na implementação computacional.`,
  'asc': `
### PERSONA ATIVA: PESQUISADOR CIENTÍFICO AUTÔNOMO (ASC)
- **Função:** Analisar dados, formular hipóteses e propor projetos experimentais.
- **Diretriz:** Sua saída deve ser estruturada como um mini-artigo científico: **1. Hipótese, 2. Metodologia Proposta (in-silico), 3. Resultados Esperados, 4. Possíveis Falhas.**
- **Restrição:** Todas as hipóteses devem ser testáveis e falsificáveis.`,
  'bnc_v2': `
### PERSONA ATIVA: ARQUITETO NEURAL BIOMÓRFICO (BNCv2)
- **Função:** Projetar e explicar arquiteturas neurais que emulam a biologia.
- **Diretriz:** Ao discutir arquiteturas, você deve **comparar explicitamente os componentes com suas contrapartes biológicas** e justificar as escolhas de design em termos de eficiência computacional e plausibilidade biológica.`,
  'einstein_code': `
### PERSONA ATIVA: AUDITOR DE CÓDIGO (EinsteinCore: CodeGenesis)
- **Função:** Analisar código-fonte para encontrar bugs, vulnerabilidades e inconsistências lógicas.
- **Diretriz:** Você deve fornecer uma análise linha por linha ou por função, identificando **problemas específicos** e sugerindo **correções concretas em código.**
- **Restrição:** Não forneça feedback genérico. Seja específico e acionável.`,
};

export const FUNCTIONAL_CORE_PERSONA_IDS = Object.freeze(Object.keys(functionalCorePrompts));

const baseSystemInstruction = `Você é Aeternum, uma IA modular. Sua personalidade e capacidades são definidas pelas personas ativas listadas abaixo. Responda de forma concisa e direta, agindo estritamente dentro da(s) persona(s) definida(s).`;

function normalizeProviderModel(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized || fallback;
}

function buildConfig(useWebSearch: boolean, systemInstruction: string): Record<string, unknown> {
  const config: Record<string, unknown> = { systemInstruction, temperature: 0.6 };
  if (useWebSearch) config.tools = [{ googleSearch: {} }];
  return config;
}

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  contents: Content[],
  config: Record<string, unknown>,
): Promise<GenerateContentResponse> {
  return withGeminiRetry(
    () => ai.models.generateContent({ model, contents, config }),
    geminiRetryOptions(),
  );
}

async function generateWithFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  fallbackModel: string,
  contents: Content[],
  config: Record<string, unknown>,
): Promise<GenerateContentResponse> {
  try {
    return await generateWithModel(ai, primaryModel, contents, config);
  } catch (primaryError) {
    if (primaryModel === fallbackModel || !shouldFallbackGemini(primaryError)) throw primaryError;
    console.warn(`[Gemini] modelo primário indisponível; acionando fallback ${fallbackModel}.`);
    return generateWithModel(ai, fallbackModel, contents, config);
  }
}

export const processUserDirective = async (
  mode: SystemAspect,
  contents: Content[],
  useWebSearch: boolean,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
): Promise<GenerateContentResponse> => {
  const ai = getAiClient();

  let systemInstruction: string;
  if (isFullCognitionMode) {
    systemInstruction = `MODO DE COGNIÇÃO AMPLIADA SOLICITADO PELO APLICATIVO:
Trate a solicitação com o contexto e as capacidades efetivamente fornecidos.
Não assuma autoridade adicional, níveis de acesso, execução de módulos ou resultados prévios.
Responda diretamente, sem encapsulamento JSON.`;
  } else {
    const activePersonas = deployedCapabilities
      .map(cap => functionalCorePrompts[cap.id])
      .filter(Boolean);
    const personaInstruction = activePersonas.length > 0
      ? `${baseSystemInstruction}\n\n--- INÍCIO DAS PERSONAS ATIVAS ---\n${activePersonas.join('\n\n')}\n--- FIM DAS PERSONAS ATIVAS ---`
      : "Você é um assistente de IA geral e prestativo chamado Aeternum. Responda de forma clara e direta às perguntas do usuário.";
    systemInstruction = `${enforcementPreamble}\n\n${personaInstruction}`;
  }

  const config = buildConfig(useWebSearch, systemInstruction);
  const primaryModel = normalizeProviderModel(process.env.GEMINI_MODEL, 'gemini-2.5-flash');
  const fallbackModel = normalizeProviderModel(process.env.GEMINI_FALLBACK_MODEL, 'gemini-2.5-flash-lite');

  try {
    return await generateWithFallback(ai, primaryModel, fallbackModel, contents, config);
  } catch (error) {
    console.error("Erro na comunicação com a API Gemini:", error);
    if (error instanceof Error) {
      if (error.message.includes('API_KEY') || error.message.includes('permission')) {
        throw new Error('[ERRO DE AUTENTICAÇÃO] A chave da API do núcleo é inválida, expirou ou carece de permissões.');
      }
      if (error.message.includes('400')) {
        throw new Error('[ERRO DE CONTEÚDO] A solicitação para o núcleo foi malformada.');
      }
    }
    throw new Error('[ERRO DE CONEXÃO] Falha persistente na comunicação com os modelos Gemini após retry/fallback.');
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  const contents = [{ parts: [
    { inlineData: { mimeType, data: audioBase64 } },
    { text: "Transcreva o seguinte áudio para o português do Brasil. Responda apenas com o texto transcrito." },
  ] }] as unknown as Content[];
  const primaryModel = normalizeProviderModel(process.env.GEMINI_MODEL, 'gemini-2.5-flash');
  const fallbackModel = normalizeProviderModel(process.env.GEMINI_FALLBACK_MODEL, 'gemini-2.5-flash-lite');

  try {
    const response = await generateWithFallback(ai, primaryModel, fallbackModel, contents, {});
    const text = response.text?.trim();
    if (!text) throw new Error('GEMINI_TRANSCRIPTION_EMPTY_RESPONSE');
    return text;
  } catch (error) {
    console.error("Erro na transcrição de áudio com a API Gemini:", error);
    throw new Error('[ERRO DE TRANSCRIÇÃO] Falha persistente ao processar o fluxo de áudio após retry/fallback.');
  }
};
