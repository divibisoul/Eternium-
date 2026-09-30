import { isClareiraPacket, type ClareiraMetrics, type ClareiraPacket } from '../../shared/clareira-contract';
import { requestPeerTool } from '../../api/soul-mesh/peer-client';

let ingested=0, forwarded=0, failed=0, dropped=0, processed=0, inFlight=0, lastLatency=0, startedAt=Date.now();
const samples:number[]=[];
export function ingestClareiraPacket(packet:ClareiraPacket):boolean{ if(!isClareiraPacket(packet))throw new Error('INVALID_CLAREIRA_PACKET'); ingested++; inFlight++; return true; }
export async function forwardClareiraToN01(packet:ClareiraPacket):Promise<unknown>{
  ingestClareiraPacket(packet);
  try{
    const response=await requestPeerTool('N01','clareira.ingest',{packet},15000);
    forwarded++; processed++; inFlight=Math.max(0,inFlight-1); lastLatency=Math.max(0,Date.now()-packet.timestamp);
    samples.push(lastLatency); if(samples.length>128)samples.shift();
    return response.payload;
  }catch(error){failed++;inFlight=Math.max(0,inFlight-1);throw error;}
}
export function recordClareiraDrop(packet:ClareiraPacket,reason:string){
  if(!isClareiraPacket(packet))throw new Error('INVALID_CLAREIRA_PACKET');
  dropped++; inFlight=Math.max(0,inFlight-1); return {correlationId:packet.correlationId,reason};
}
export function clareiraMetrics():ClareiraMetrics{
  const ordered=[...samples].sort((a,b)=>a-b);
  const percentile=(p:number)=>ordered.length?ordered[Math.min(ordered.length-1,Math.floor((ordered.length-1)*p))]:0;
  return {
    capturedAtMs:Date.now(),
    nodes:{total:1,active:failed===0?1:0,errored:failed},
    channels:{total:1,open:1},
    packets:{ingested,forwarded,processed,failed,dropped,inFlight},
    latencyMs:{last:lastLatency,p50:percentile(.5),p95:percentile(.95),max:ordered.at(-1)??0},
    uptimeMs:Date.now()-startedAt,
  };
}
