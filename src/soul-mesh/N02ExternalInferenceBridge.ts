type Message={role:string;content:string};
type Payload={text?:string;system?:string;model?:string;messages?:Message[];temperature?:number};
type FetchLike=typeof fetch;

function env(name:string){return String(process.env[name]??'').trim();}
function base(provider:'vllm'|'sglang'){
 const value=env(provider==='vllm'?'N02_VLLM_URL':'N02_SGLANG_URL').replace(/\/$/,'');
 if(!value) throw new Error(`${provider.toUpperCase()}_URL_NOT_CONFIGURED`);
 try{const url=new URL(value);if(!/^https?:$/.test(url.protocol))throw new Error();}catch{throw new Error(`${provider.toUpperCase()}_URL_INVALID`);}
 return value;
}
function messages(payload:Payload):Message[]{
 if(Array.isArray(payload.messages)&&payload.messages.length)return payload.messages.filter(m=>m&&typeof m.role==='string'&&typeof m.content==='string');
 const text=String(payload.text??'').trim();if(!text)throw new Error('N02_EXTERNAL_INFERENCE_TEXT_REQUIRED');
 const out:Message[]=[];if(String(payload.system??'').trim())out.push({role:'system',content:String(payload.system).trim()});out.push({role:'user',content:text});return out;
}
export function externalInferenceConfigured(provider:'vllm'|'sglang'){return Boolean(env(provider==='vllm'?'N02_VLLM_URL':'N02_SGLANG_URL'));}
export async function generateWithExternalInference(provider:'vllm'|'sglang',payload:Payload,fetchImpl:FetchLike=fetch){
 const model=String(payload.model??env(provider==='vllm'?'N02_VLLM_MODEL':'N02_SGLANG_MODEL')).trim();if(!model)throw new Error(`${provider.toUpperCase()}_MODEL_NOT_CONFIGURED`);
 const timeoutConfigured=Number(env('N02_EXTERNAL_INFERENCE_TIMEOUT_MS')||30000);const timeoutMs=Number.isFinite(timeoutConfigured)&&timeoutConfigured>0?timeoutConfigured:30000;
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const token=env(provider==='vllm'?'N02_VLLM_TOKEN':'N02_SGLANG_TOKEN');
  const response=await fetchImpl(base(provider)+'/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',accept:'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify({model,messages:messages(payload),temperature:typeof payload.temperature==='number'?payload.temperature:undefined,stream:false}),signal:controller.signal});
  const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(`${provider.toUpperCase()}_HTTP_${response.status}`);
  const text=data?.choices?.[0]?.message?.content;if(typeof text!=='string'||!text.trim())throw new Error(`${provider.toUpperCase()}_EMPTY_RESPONSE`);
  return {nucleus:'N02',capability:'ai.generate',provider,model,text:text.trim(),usage:data?.usage??undefined};
 }finally{clearTimeout(timer);}
}
export async function probeExternalInference(provider:'vllm'|'sglang',fetchImpl:FetchLike=fetch){
 const url=base(provider);const token=env(provider==='vllm'?'N02_VLLM_TOKEN':'N02_SGLANG_TOKEN');
 const response=await fetchImpl(url+'/v1/models',{headers:{accept:'application/json',...(token?{authorization:'Bearer '+token}:{})}});
 const body=await response.json().catch(()=>null);if(!response.ok)throw new Error(`${provider.toUpperCase()}_HEALTH_${response.status}`);
 return {provider,live:true,models:body?.data??[],endpoint:url};
}
