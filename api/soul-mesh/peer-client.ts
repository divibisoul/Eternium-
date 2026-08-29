import { createSoulMeshNonce, signSoulMeshMessage } from './hmac';

export type NucleusId='N01'|'N02'|'N03'|'N04'|'N05'|'N06';
export type MeshKind='request'|'response'|'event'|'error';
export type MeshMessage={protocol:'soul-mesh/1';id:string;correlationId:string;source:NucleusId;target:NucleusId;kind:MeshKind;capability:string;payload:unknown;timestamp:number;transport?:string;meta?:Record<string,unknown>};
export type PeerDescription={nucleus:NucleusId;peers:NucleusId[];protocol:string;status:string;declaredCapabilities:string[];executableCapabilities:string[];transports:string[];channels?:{in:string[];out:string[]}};
const PEERS:Exclude<NucleusId,'N02'>[]=['N01','N03','N04','N05','N06'];
const env=(globalThis as any).process?.env ?? {};
const urls:Partial<Record<NucleusId,string>>={N01:env.SOUL_MESH_N01_URL,N03:env.SOUL_MESH_N03_URL,N04:env.SOUL_MESH_N04_URL,N05:env.SOUL_MESH_N05_URL,N06:env.SOUL_MESH_N06_URL};
const tokens:Partial<Record<NucleusId,string>>={N01:env.SOUL_MESH_N01_TOKEN,N03:env.SOUL_MESH_N03_TOKEN,N04:env.SOUL_MESH_N04_TOKEN,N05:env.SOUL_MESH_N05_TOKEN,N06:env.SOUL_MESH_N06_TOKEN};
const uuid=()=>globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const traceId=()=>uuid().replaceAll('-','').slice(0,32).padEnd(32,'0');
const spanId=()=>uuid().replaceAll('-','').slice(0,16).padEnd(16,'0');
const valid=(x:unknown):x is MeshMessage=>{if(!x||typeof x!=='object')return false;const m=x as Record<string,unknown>;return m.protocol==='soul-mesh/1'&&typeof m.id==='string'&&m.id.length<=200&&typeof m.correlationId==='string'&&m.correlationId.length<=200&&typeof m.source==='string'&&/^N0[1-6]$/.test(m.source)&&typeof m.target==='string'&&/^N0[1-6]$/.test(m.target)&&typeof m.kind==='string'&&['request','response','event','error'].includes(m.kind as string)&&typeof m.capability==='string'&&m.capability.length<=200&&typeof m.timestamp==='number'&&Number.isFinite(m.timestamp)};
function peerUrl(target:NucleusId){const url=urls[target];if(!url)throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${target}`);return url}
async function request(target:NucleusId,capability:string,payload:unknown,timeoutMs=15000,retries=1):Promise<MeshMessage>{
  const url=peerUrl(target);const correlationId=uuid();const message:MeshMessage={protocol:'soul-mesh/1',id:uuid(),correlationId,source:'N02',target,kind:'request',capability,payload,timestamp:Date.now(),transport:'HTTP'};
  let last:unknown;
  for(let attempt=0;attempt<=Math.min(3,Math.max(0,retries));attempt++){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),Math.max(250,timeoutMs));
    try{
      const headers:Record<string,string>={'content-type':'application/json','accept':'application/json','traceparent':`00-${traceId()}-${spanId()}-01`,'x-soul-correlation-id':correlationId};
      const hmacSecret=String(env.SOUL_MESH_HMAC_SECRET ?? '').trim();
      if(hmacSecret){
        const nonce=createSoulMeshNonce();
        headers['x-soul-mesh-nonce']=nonce;
        headers['x-soul-mesh-hmac']=signSoulMeshMessage(message,hmacSecret,nonce);
      } else if(tokens[target]) {
        headers.authorization=`Bearer ${tokens[target]}`;
      }
      const response=await fetch(`${url}/api/soul-mesh`,{method:'POST',headers,body:JSON.stringify(message),signal:controller.signal});
      const body:unknown=await response.json().catch(()=>null);
      if(!valid(body)||body.correlationId!==correlationId||body.source!==target||body.target!=='N02')throw new Error('SOUL_MESH_INVALID_RESPONSE');
      if(!response.ok||body.kind==='error')throw new Error(`SOUL_MESH_REMOTE_ERROR:${target}:${body.capability}`);
      return body;
    }catch(error){last=error;if(attempt<Math.min(3,Math.max(0,retries)))await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)))}finally{clearTimeout(timer)}
  }
  throw last instanceof Error?last:new Error(String(last));
}
export const sendTo=request;
export const requestPeerCapability=request;
export const describePeer=async(target:NucleusId,timeoutMs=10000):Promise<PeerDescription>=>{const message=await request(target,'mesh.describe',{from:'N02',intent:'capability-discovery'},timeoutMs,1);return message.payload as PeerDescription};
export async function discoverPeerCapabilities(target:NucleusId,timeoutMs=10000){return describePeer(target,timeoutMs)}
export async function requestPeerTool(target:NucleusId,toolCapability:string,payload:unknown,timeoutMs=15000){return request(target,toolCapability,payload,timeoutMs,1)}
export async function pingAll(timeoutMs=5000){return Promise.all(PEERS.map(async target=>{try{return{target,status:'CONNECTED' as const,response:await request(target,'mesh.ping',{from:'N02',channel:`N02.OUT.${target}`},timeoutMs,1)}}catch(error){return{target,status:'FAILED' as const,error:String(error)}}}))}
export const N02_OUT_CHANNELS=PEERS.map(x=>`N02.OUT.${x}`);export const N02_IN_CHANNELS=PEERS.map(x=>`N02.IN.${x}`);
