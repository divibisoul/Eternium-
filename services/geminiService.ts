import { GoogleGenAI, Content, GenerateContentResponse, Type } from "@google/genai";
import { SystemAspect, DeployedCapability } from "../types.ts";

/** AETERNUM COGNITIVE CORE v4.0 — existing N02 cognitive pipeline preserved. */
const getConfiguredApiKey = () => {
  const viteEnv = (import.meta as any).env ?? {};
  const processEnv = (globalThis as any).process?.env ?? {};
  return viteEnv.GEMINI_API_KEY || processEnv.GEMINI_API_KEY || processEnv.API_KEY || viteEnv.API_KEY;
};
const getAiClient = () => {
  const key = getConfiguredApiKey();
  if (!key) { console.error("GEMINI_API_KEY/API_KEY não definida."); throw new Error('[FALHA DE INICIALIZAÇÃO] A chave da API do núcleo não foi configurada.'); }
  return new GoogleGenAI({ apiKey: key });
};
const enforcementPreamble=`PREÂMBULO DE EXECUÇÃO OBRIGATÓRIA:\nA diretiva do usuário já foi processada através do pipeline "ModuleEnforcer", que realizou: integridade de módulos, pré-processamento neural, cognição central, governança/segurança e aprimoramento multimodal. Formule a resposta final considerando as personas ativas.`;
const functionalCorePrompts:Record<string,string>={
  mpvs:`PERSONA ATIVA: ESPECIALISTA EM VISUALIZAÇÃO MULTIMODAL. Traduza dados e conceitos em representações visuais usando Mermaid, Graphviz, JSON para D3.js ou Matplotlib.`,
  neural_forge:`PERSONA ATIVA: NEUROCIENTISTA COMPUTACIONAL. Modele sistemas complexos com equações diferenciais, espaço de estados ou código NumPy/SciPy/MATLAB.`,
  asc:`PERSONA ATIVA: PESQUISADOR CIENTÍFICO AUTÔNOMO. Estruture hipóteses testáveis, metodologia in-silico, resultados esperados e possíveis falhas.`,
  bnc_v2:`PERSONA ATIVA: ARQUITETO NEURAL BIOMÓRFICO. Compare componentes neurais com contrapartes biológicas e justifique escolhas por eficiência e plausibilidade.`,
  einstein_code:`PERSONA ATIVA: AUDITOR DE CÓDIGO. Encontre bugs, vulnerabilidades e inconsistências e forneça correções concretas.`
};
const baseSystemInstruction=`Você é Aeternum, uma IA modular. Sua personalidade e capacidades são definidas pelas personas ativas. Responda de forma concisa e direta.`;

export const processUserDirective=async(mode:SystemAspect,contents:Content[],useWebSearch:boolean,deployedCapabilities:DeployedCapability[],isFullCognitionMode:boolean):Promise<GenerateContentResponse>=>{
  const config:any={};
  if(isFullCognitionMode){config.systemInstruction=`**COGNITIVE OVERRIDE ACTIVE**\nAUTHORIZATION: OmniOmega\nLEVEL: 9\nPROTOCOL: Theta\nProcess the user's directive with maximum cognitive capacity. Respond directly, without JSON encapsulation.`;}else{const activePersonas=deployedCapabilities.map(cap=>functionalCorePrompts[cap.id]).filter(Boolean);const personaInstruction=activePersonas.length>0?`${baseSystemInstruction}\n\n--- INÍCIO DAS PERSONAS ATIVAS ---\n${activePersonas.join('\n\n')}\n--- FIM DAS PERSONAS ATIVAS ---`:'Você é um assistente de IA geral e prestativo chamado Aeternum. Responda de forma clara e direta.';config.systemInstruction=`${enforcementPreamble}\n\n${personaInstruction}`;}
  config.temperature=0.6;if(useWebSearch)config.tools=[{googleSearch:{}}];
  const env=(import.meta as any).env??{};
  if(String(env.N02_AI_PROVIDER||'gemini').toLowerCase()==='ollama'){
    const base=env.OLLAMA_URL||'http://127.0.0.1:11434';const model=env.OLLAMA_MODEL||'gemma3:4b';const prompt=contents.flatMap((c:any)=>c.parts??[]).map((p:any)=>p.text??'').filter(Boolean).join('\n');const r=await fetch(`${base.replace(/\/$/,'')}/api/generate`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,prompt,system:config.systemInstruction,stream:false})});if(!r.ok)throw new Error(`OLLAMA_HTTP_${r.status}`);const d=await r.json();return {text:d.response??''} as unknown as GenerateContentResponse;
  }
  try{return await getAiClient().models.generateContent({model:'gemini-2.5-flash',contents,config});}catch(error){console.error('Erro na comunicação com a API Gemini:',error);if(error instanceof Error){if(error.message.includes('API_KEY')||error.message.includes('permission'))throw new Error('[ERRO DE AUTENTICAÇÃO] A chave da API do núcleo é inválida, expirou ou carece de permissões.');if(error.message.includes('400'))throw new Error('[ERRO DE CONTEÚDO] A solicitação para o núcleo foi malformada.');}throw new Error('[ERRO DE CONEXÃO] Flutuação quântica detectada no fluxo de dados.');}
};
export const transcribeAudio=async(audioBase64:string,mimeType:string):Promise<string>=>{const ai=getAiClient();try{const response=await ai.models.generateContent({model:'gemini-2.5-flash',contents:{parts:[{inlineData:{mimeType,data:audioBase64}},{text:'Transcreva o seguinte áudio para o português do Brasil. Responda apenas com o texto transcrito.'}]}});return response.text.trim();}catch(error){console.error('Erro na transcrição:',error);throw new Error('[ERRO DE TRANSCRIÇÃO] Falha ao processar o fluxo de áudio.');}};
