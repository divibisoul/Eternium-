import assert from 'node:assert/strict';
import test from 'node:test';
import {generateWithExternalInference,externalInferenceConfigured,probeExternalInference} from './N02ExternalInferenceBridge';
const fake=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
test('vLLM adapter uses OpenAI-compatible chat endpoint',async()=>{
 const oldUrl=process.env.N02_VLLM_URL,oldModel=process.env.N02_VLLM_MODEL;process.env.N02_VLLM_URL='http://vllm.test';process.env.N02_VLLM_MODEL='model';
 try{let seen:any;const r=await generateWithExternalInference('vllm',{text:'hello'},async(url,init)=>{seen={url:String(url),init:init??{}};return fake({choices:[{message:{content:'ok'}}]});});assert.equal(externalInferenceConfigured('vllm'),true);assert.equal(seen.url,'http://vllm.test/v1/chat/completions');assert.equal(r.provider,'vllm');}finally{if(oldUrl===undefined)delete process.env.N02_VLLM_URL;else process.env.N02_VLLM_URL=oldUrl;if(oldModel===undefined)delete process.env.N02_VLLM_MODEL;else process.env.N02_VLLM_MODEL=oldModel;}
});
test('SGLang probe and runtime use the same canonical OpenAI boundary',async()=>{
 const oldUrl=process.env.N02_SGLANG_URL,oldModel=process.env.N02_SGLANG_MODEL;process.env.N02_SGLANG_URL='http://sglang.test';process.env.N02_SGLANG_MODEL='model';
 try{let urls:string[]=[];const fetcher=async(url:RequestInfo|URL)=>{urls.push(String(url));return url.toString().endsWith('/models')?fake({data:[{id:'model'}]}):fake({choices:[{message:{content:'ok'}}]});};const p=await probeExternalInference('sglang',fetcher);const r=await generateWithExternalInference('sglang',{text:'hello'},fetcher);assert.equal(p.live,true);assert.deepEqual(urls,['http://sglang.test/v1/models','http://sglang.test/v1/chat/completions']);assert.equal(r.text,'ok');}finally{if(oldUrl===undefined)delete process.env.N02_SGLANG_URL;else process.env.N02_SGLANG_URL=oldUrl;if(oldModel===undefined)delete process.env.N02_SGLANG_MODEL;else process.env.N02_SGLANG_MODEL=oldModel;}
});
test('missing vLLM endpoint fails closed',async()=>{const old=process.env.N02_VLLM_URL,oldModel=process.env.N02_VLLM_MODEL;delete process.env.N02_VLLM_URL;process.env.N02_VLLM_MODEL='model';try{await assert.rejects(generateWithExternalInference('vllm',{text:'hello'}),/VLLM_URL_NOT_CONFIGURED/);}finally{if(old===undefined)delete process.env.N02_VLLM_URL;else process.env.N02_VLLM_URL=old;if(oldModel===undefined)delete process.env.N02_VLLM_MODEL;else process.env.N02_VLLM_MODEL=oldModel;}});
