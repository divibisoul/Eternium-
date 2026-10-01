/**
 * External capability provenance: xun-agent.
 * Reference: https://github.com/
 * License/provenance: Exact public xun-agent repository not independently resolved; no source code copied.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, boundedArray, requireString } from './N02ExternalHandlerSupport';
export class CotDrcHandler {
  private readonly provider=createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value=requireRecord(input,'cot_drc');
    const problem=requireString(value,'problem');
    let subtasks=boundedArray<string>(value.subtasks??[],12,'subtasks');
    if(subtasks.length===0){ const split=await this.provider.json<{subtasks:string[]}>('Decompose problem into at most 12 independently executable subtasks with explicit dependencies. Problem='+problem+'. JSON {"subtasks":[]}',correlationId,'cot-drc-decompose'); subtasks=split.subtasks.slice(0,12); }
    const results=await Promise.all(subtasks.map(async(task,index)=>({id:'task-'+(index+1),task,result:await this.provider.text('Solve only this subtask: '+task,correlationId)})));
    return { problem, subtask_count:results.length, results };
  }
}