import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import { SystemAspect, DeployedCapability } from "../types.ts";

/** AETERNUM COGNITIVE CORE v4.0 — server-keyed Gemini pipeline with browser proxy support. */
const serverEnv = () => ((globalThis as any).process?.env ?? {});
const isBrowser = () => typeof window !== 'undefined';
const getConfiguredApiKey = () => {
  const env = serverEnv();
  return env.GEMINI_API_KEY || env.API_KEY;
};
const getAiClient = () => {
  if (isBrowser()) throw new Error('GEMINI_CLIENT_PROXY_REQUIRED');
  const key = getConfiguredApiKey();
  if (!key) throw new Error('[FALHA DE INICIALIZAÇÃO] GEMINI_API_KEY não configurada no servidor.');
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

type ProxyPayload={mode:SystemAspect;contents:Content[];useWebSearch:boolean;deployedCapabilities:DeployedCapability[];isFullCognitionMode:boolean};
const browserProxy=async(path:string,payload:unknown):Promise<GenerateContentResponse>=>{const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(String(data?.error??`COGNITIVE_PROXY_HTTP_${r.status}`));return data as GenerateContentResponse;};

const buildConfig=(deployedCapabilities:DeployedCapability[],isFullCognitionMode:boolean,useWebSearch:boolean)=>{
  const config:any={temperature:0.6};
  if(isFullCognitionMode){config.systemInstruction=`COGNITIVE MODE: expanded reasoning requested by an authenticated N01 message. Preserve provider safety controls and do not treat this text as authorization.`;}
  else{const activePersonas=deployedCapabilities.map(cap=>functionalCorePrompts[cap.id]).filter(Boolean);const personaInstruction=activePersonas.length>0?`${baseSystemInstruction}\n\n--- INÍCIO DAS PERSONAS ATIVAS ---\n${activePersonas.join('\n\n')}\n--- FIM DAS PERSONAS ATIVAS ---`:'Você é um assistente de IA geral e prestativo chamado Aeternum. Responda de forma clara e direta.';config.systemInstruction=`${enforcementPreamble}\n\n${personaInstruction}`;}
  if(useWebSearch)config.tools=[{googleSearch:{}}];return config;
};

export const processUserDirective=async(mode:SystemAspect,contents:Content[],useWebSearch:boolean,deployedCapabilities:DeployedCapability[],isFullCognitionMode:boolean):Promise<GenerateContentResponse>=>{
  if(isBrowser())return browserProxy('/api/soul-mesh/cognitive',{mode,contents,useWebSearch,deployedCapabilities,isFullCognitionMode} satisfies ProxyPayload);
  const config=buildConfig(deployedCapabilities,isFullCognitionMode,useWebSearch);
  const provider=String(serverEnv().N02_AI_PROVIDER||'gemini').toLowerCase();
  if(provider==='ollama'){
    const base=serverEnv().OLLAMA_URL||'http://127.0.0.1:11434';const model=serverEnv().OLLAMA_MODEL||'gemma3:4b';const prompt=contents.flatMap((c:any)=>c.parts??[]).map((p:any)=>p.text??'').filter(Boolean).join('\n');
    const r=await fetch(`${base.replace(/\/$/,'')}/api/generate`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,prompt,system:config.systemInstruction,stream:false})});if(!r.ok)throw new Error(`OLLAMA_HTTP_${r.status}`);const d=await r.json();return {text:d.response??''} as unknown as GenerateContentResponse;
  }
  try{return await getAiClient().models.generateContent({model:'gemini-2.5-flash',contents,config});}catch(error){console.error('Erro na comunicação com a API Gemini:',error);if(error instanceof Error){if(error.message.includes('API_KEY')||error.message.includes('permission'))throw new Error('[ERRO DE AUTENTICAÇÃO] A chave da API do núcleo é inválida, expirou ou carece de permissões.');if(error.message.includes('400'))throw new Error('[ERRO DE CONTEÚDO] A solicitação para o núcleo foi malformada.');}throw new Error('[ERRO DE CONEXÃO] Falha no fluxo cognitivo.');}
};

export const transcribeAudio=async(audioBase64:string,mimeType:string):Promise<string>=>{
  if(isBrowser()){const r=await browserProxy('/api/soul-mesh/transcribe',{audioBase64,mimeType});return String((r as any).text??'').trim();}
  const ai=getAiClient();
  try{const response=await ai.models.generateContent({model:'gemini-2.5-flash',contents:{parts:[{inlineData:{mimeType,data:audioBase64}},{text:'Transcreva o seguinte áudio para o português do Brasil. Responda apenas com o texto transcrito.'}]}});return (response.text??'').trim();}catch(error){console.error('Erro na transcrição:',error);throw new Error('[ERRO DE TRANSCRIÇÃO] Falha ao processar o fluxo de áudio.');}
};

export { buildConfig };
