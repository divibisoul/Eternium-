import { GoogleGenAI, type Content, type GenerateContentResponse } from "@google/genai";
import { SystemAspect, DeployedCapability } from "../types.ts";

const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

const getAiClient = (): GoogleGenAI => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("[FALHA DE INICIALIZAÇÃO] VITE_GEMINI_API_KEY não está configurada no runtime N02.");
  return new GoogleGenAI({ apiKey });
};

const functionalCorePrompts: Record<string, string> = {
  mpvs: "Especialista em visualização multimodal: gerar Mermaid, Graphviz ou estruturas de dados para visualização.",
  neural_forge: "Neurocientista computacional: modelar sistemas complexos com formalismo matemático e simulação.",
  asc: "Pesquisador científico autônomo: formular hipóteses testáveis, metodologia in-silico, resultados esperados e falhas.",
  bnc_v2: "Arquiteto neural biomórfico: projetar arquiteturas inspiradas em sistemas biológicos e justificar escolhas computacionais.",
  einstein_code: "Auditor de código: encontrar bugs, vulnerabilidades e inconsistências e propor correções concretas.",
};

const enforcementPreamble = "A diretiva já passou pelo pipeline ModuleEnforcer: integridade, pré-processamento, cognição central, governança/segurança e aprimoramento multimodal. Responda somente dentro das capacidades efetivamente disponíveis.";
const baseSystemInstruction = "Você é Aeternum, uma IA modular. Responda de forma concisa, direta e fundamentada.";

export const processUserDirective = async (
  mode: SystemAspect,
  contents: Content[],
  useWebSearch: boolean,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
): Promise<GenerateContentResponse> => {
  const ai = getAiClient();
  const personas = deployedCapabilities.map((cap) => functionalCorePrompts[cap.id]).filter((v): v is string => Boolean(v));
  const systemInstruction = [
    enforcementPreamble,
    baseSystemInstruction,
    `Modo cognitivo: ${mode}.`,
    personas.length ? `Personas ativas:\n${personas.join("\n")}` : "Nenhuma persona especializada está ativa.",
    isFullCognitionMode ? "Cognição ampliada ativada: aumente profundidade e síntese sem desativar validações ou salvaguardas." : "",
  ].filter(Boolean).join("\n\n");

  const config: Record<string, unknown> = { systemInstruction, temperature: 0.6 };
  if (useWebSearch) config.tools = [{ googleSearch: {} }];

  try {
    return await ai.models.generateContent({ model: MODEL, contents, config });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/API_KEY|permission|unauthorized|forbidden/i.test(message)) throw new Error("[ERRO DE AUTENTICAÇÃO] Credencial Gemini inválida ou sem permissão.");
    if (/\b400\b|invalid argument|malformed/i.test(message)) throw new Error("[ERRO DE CONTEÚDO] Solicitação malformada.");
    throw new Error("[ERRO DE CONEXÃO] Falha na comunicação com o runtime Gemini do N02.");
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: { parts: [
        { inlineData: { mimeType, data: audioBase64 } },
        { text: "Transcreva o áudio para português do Brasil. Responda apenas com o texto transcrito." },
      ] },
    });
    return response.text?.trim() || "";
  } catch {
    throw new Error("[ERRO DE TRANSCRIÇÃO] Falha ao processar o fluxo de áudio.");
  }
};
