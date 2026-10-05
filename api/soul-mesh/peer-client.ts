import { createHmac, timingSafeEqual } from 'node:crypto';
import { MeshResilienceController, jitteredBackoffDelayMs, isIdempotentMeshCapability } from './resilience.ts';
export type NucleusId='N01'|'N02'|'N03'|'N04'|'N05'|'N06'|'N07';
export type MeshKind='request'|'response'|'event'|'error';
export type SoulMeshMessage={protocol:'soul-mesh/1';contractVersion:'1.1.0';id:string;correlationId:string;source:NucleusId;target:NucleusId;kind:MeshKind;capability:string;payload:unknown;timestamp:number;nonce?:string;hmac?:string;meta?:{runtime?:string;transport?:string;encoding?:string;version?:string;nonce?:string;traceId?:string}};
export type PeerDescription={nucleus:NucleusId;peers:NucleusId[];protocol:string;status:string;declaredCapabilities:string[];executableCapabilities:string[];transports:string[];channels?:{in:string[];out:string[]}};
export type SuperGPUTask={id?:string;capability:string;payload:Record<string,unknown>;required?:boolean;timeout_ms?:number};
const PEERS:Exclude<NucleusId,'N02'>[]=['N01','N03','N04','N05','N06','N07'];
const env=(globalThis as any).process?.env ?? {};
const urls:Partial<Record<NucleusId,string>>={N01:env.SOUL_MESH_N01_URL,N03:env.SOUL_MESH_N03_URL,N04:env.SOUL_MESH_N04_URL,N05:env.SOUL_MESH_N05_URL,N06:env.SOUL_MESH_N06_URL,N07:env.SOUL_MESH_N07_URL};
const tokens:Partial<Record<NucleusId,string>>={N01:env.SOUL_MESH_N01_TOKEN,N03:env.SOUL_MESH_N03_TOKEN,N04:env.SOUL_MESH_N04_TOKEN,N05:env.SOUL_MESH_N05_TOKEN,N06:env.SOUL_MESH_N06_TOKEN,N07:env.SOUL_MESH_N07_TOKEN};
const secret=env.SOUL_MESH_HMAC_SECRET?.trim() ?? '';
const uuid=()=>globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const traceId=()=>uuid().replaceAll('-','').slice(0,32).padEnd(32,'0');
const spanId=()=>uuid().replaceAll('-','').slice(0,16).padEnd(16,'0');
export const n02MeshResilience = new MeshResilienceController();
const valid=(x:unknown):x is SoulMeshMessage=>{if(!x||typeof x!=='object')return false;const m=x as Record<string,unknown>;return m.protocol==='soul-mesh/1'&&m.contractVersion==='1.1.0'&&typeof m.id==='string'&&m.id.length<=200&&typeof m.correlationId==='string'&&m.correlationId.length<=200&&typeof m.source==='string'&&/^N0[1-7]$/.test(m.source)&&typeof m.target==='string'&&/^N0[1-7]$/.test(m.target)&&typeof m.kind==='string'&&['request','response','event','error'].includes(m.kind as string)&&typeof m.capability==='string'&&m.capability.length<=200&&typeof m.timestamp==='number'&&Number.isFinite(m.timestamp)};
function peerUrl(target:NucleusId){const url=urls[target];if(!url)throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);return url}
function canonical(m:SoulMeshMessage,n:string){return JSON.stringify({protocol:m.protocol,contractVersion:m.contractVersion,id:m.id,correlationId:m.correlationId,source:m.source,target:m.target,kind:m.kind,capability:m.capability??null,payload:m.payload,timestamp:m.timestamp,transport:m.meta?.transport,meta:m.meta??null,nonce:n});}
function sign(m:SoulMeshMessage,n:string){return createHmac('sha256',secret).update(canonical(m,n),'utf8').digest('hex');}
function canonicalLegacyResponse(m:SoulMeshMessage,n:string){return JSON.stringify({version:'1.0',contractVersion:m.contractVersion,messageId:m.id,source:m.source,target:m.target,timestamp:m.timestamp,nonce:n,correlationId:m.correlationId,type:m.kind==='error'?'ERROR':'TASK_RESULT',payload:{capability:m.capability??'',payload:m.payload??{}}});}
function verifyResponseHmac(m:SoulMeshMessage,secretValue:string):void{const nonce=String(m.nonce??m.meta?.nonce??'').trim();const provided=String(m.hmac??'').trim();if(!nonce||!/^[0-9a-f]{64}$/i.test(provided))throw new Error('SOUL_MESH_RESPONSE_HMAC_MISSING');if(!Number.isFinite(m.timestamp)||Math.abs(Date.now()-m.timestamp)>30000)throw new Error('SOUL_MESH_RESPONSE_TIMESTAMP_INVALID');const expected=createHmac('sha256',secretValue).update(canonicalLegacyResponse(m,nonce),'utf8').digest('hex');const actual=Buffer.from(provided,'hex');const wanted=Buffer.from(expected,'hex');if(actual.length!==wanted.length||!timingSafeEqual(actual,wanted))throw new Error('SOUL_MESH_RESPONSE_HMAC_INVALID');}
async function request(target:NucleusId,capability:string,payload:unknown,timeoutMs=15000,retries=1):Promise<SoulMeshMessage>{const url=peerUrl(target);if(!n02MeshResilience.canRequest(target))throw new Error(`SOUL_MESH_CIRCUIT_OPEN:${target}`);const correlationId=uuid();const nonceValue=uuid().replaceAll('-','').padEnd(32,'0').slice(0,32);const message:SoulMeshMessage={protocol:'soul-mesh/1',contractVersion:'1.1.0',id:uuid(),correlationId,source:'N02',target,kind:'request',capability,payload,timestamp:Date.now(),nonce:nonceValue,meta:{runtime:'Eternium-',transport:'HTTP',encoding:'json',version:'1.1.0',nonce:nonceValue,traceId:correlationId}};const idempotent=isIdempotentMeshCapability(capability);const retryLimit=idempotent?Math.min(3,Math.max(0,retries)):0;let last:unknown;const startedAt=Date.now();n02MeshResilience.begin(target);for(let attempt=0;attempt<=retryLimit;attempt++){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),Math.max(250,timeoutMs));try{const headers:Record<string,string>={'content-type':'application/json','accept':'application/json','traceparent':`00-${traceId()}-${spanId()}-01`,'x-soul-correlation-id':correlationId};if(secret){headers['x-soul-mesh-nonce']=nonceValue;headers['x-soul-mesh-hmac']=sign(message,nonceValue);} else if(tokens[target])headers.authorization=`Bearer ${tokens[target]}`;const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(message),signal:controller.signal});const body:unknown=await response.json().catch(()=>null);if(!valid(body)||body.correlationId!==correlationId||body.source!==target||body.target!=='N02')throw new Error('SOUL_MESH_INVALID_RESPONSE');if(secret)verifyResponseHmac(body,secret);if(!response.ok||body.kind==='error')throw new Error(`SOUL_MESH_REMOTE_ERROR:${target}:${body.capability}`);n02MeshResilience.success(target,Date.now()-startedAt);return body;}catch(error){last=error;n02MeshResilience.failure(target);const retryable=attempt<retryLimit&&n02MeshResilience.canRequest(target);if(!retryable)break;n02MeshResilience.retry(target);await new Promise(resolve=>setTimeout(resolve,jitteredBackoffDelayMs(attempt)));}finally{clearTimeout(timer)}}throw last instanceof Error?last:new Error(String(last));}
export const sendTo=request;export const requestPeerCapability=request;
export const describePeer=async(target:NucleusId,timeoutMs=10000):Promise<PeerDescription>=>{const message=await request(target,'mesh.describe',{from:'N02',intent:'capability-discovery'},timeoutMs,1);return message.payload as PeerDescription};
export async function discoverPeerCapabilities(target:NucleusId,timeoutMs=10000){return describePeer(target,timeoutMs)}
export async function requestPeerTool(target:NucleusId,toolCapability:string,payload:unknown,timeoutMs=15000){return request(target,toolCapability,payload,timeoutMs,1)}
export async function superGPUExecute(values:number[],operation='identity',device?:string,timeoutMs=15000){
  if(!Array.isArray(values)||values.length===0||values.some(value=>!Number.isFinite(value)))throw new Error('SUPERGPU_VALUES_INVALID');
  const metadata:Record<string,unknown>={operation,nucleus:'N02'};
  if(device?.trim())metadata.device=device.trim();
  const message=await request('N07','supergpu.execute',{payload:{values},metadata},timeoutMs,1);
  return message.payload;
}
export async function superGPUParallel(tasks:SuperGPUTask[],timeoutMs=30000){
  if(!Array.isArray(tasks)||tasks.length===0)throw new Error('SUPERGPU_TASKS_REQUIRED');
  const message=await request('N07','supergpu.parallel',{payload:{tasks}},timeoutMs,1);
  return message.payload;
}
export async function pingAll(timeoutMs=5000){return Promise.all(PEERS.map(async target=>{try{return{target,status:'CONNECTED' as const,response:await request(target,'mesh.ping',{from:'N02',channel:`N02.OUT.${target}`},timeoutMs,1)}}catch(error){return{target,status:'FAILED' as const,error:String(error)}}}))}
export const N02_OUT_CHANNELS=PEERS.map(x=>`N02.OUT.${x}`);export const N02_IN_CHANNELS=PEERS.map(x=>`N02.IN.${x}`);
