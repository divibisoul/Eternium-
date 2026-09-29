export const CLAREIRA_CONTRACT_VERSION = '1.0.0' as const;
export type ClareiraPacketType = 'Data'|'StateReport'|'DecisionRequest'|'DecisionResponse'|'Control'|'Heartbeat';
export interface ClareiraPacket {
  id:string; data:string; informationalValue:number; criticality:number; packetType:ClareiraPacketType; sourceId:string;
  destinationHint?:string; timestamp:number; correlationId:string; metadata:Record<string,string|number|boolean>;
}
export interface ClareiraMetrics {
  capturedAtMs:number; packets:{ingested:number;forwarded:number;failed:number;inFlight:number};
  latencyMs:{last:number;p50:number;p95:number;max:number};
}
export function isClareiraPacket(value:unknown):value is ClareiraPacket{
  if(!value||typeof value!=='object')return false;
  const p=value as Record<string,unknown>;
  return typeof p.id==='string'&&p.id.length>0&&typeof p.data==='string'&&
    typeof p.informationalValue==='number'&&Number.isFinite(p.informationalValue)&&
    typeof p.criticality==='number'&&Number.isFinite(p.criticality)&&p.criticality>=0&&p.criticality<=1&&
    ['Data','StateReport','DecisionRequest','DecisionResponse','Control','Heartbeat'].includes(String(p.packetType))&&
    typeof p.sourceId==='string'&&p.sourceId.length>0&&
    (p.destinationHint===undefined||typeof p.destinationHint==='string')&&
    typeof p.timestamp==='number'&&Number.isFinite(p.timestamp)&&
    typeof p.correlationId==='string'&&p.correlationId.length>0&&
    !!p.metadata&&typeof p.metadata==='object'&&!Array.isArray(p.metadata);
}
