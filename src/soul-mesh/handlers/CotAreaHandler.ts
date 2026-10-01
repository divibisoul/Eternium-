import { createHash } from 'node:crypto';
import { requireRecord, boundedArray, optionalNumber } from './N02ExternalHandlerSupport';
function mutate(seed:string,value:number,scale:number):number{const hex=createHash('sha256').update(seed).digest('hex').slice(0,12);const unit=parseInt(hex,16)/0xffffffffffff;return value+(unit*2-1)*scale;}
export class CotAreaHandler {
  async handle(input: unknown, correlationId: string) {
    void correlationId;
    const value=requireRecord(input,'cot_area');
    const population=boundedArray<number[]>(value.population??[],32,'population').map(row=>row.map(Number));
    if(population.length===0) throw new Error('N02_AREA_POPULATION_REQUIRED');
    const scores=boundedArray<number>(value.scores??[],32,'scores');
    if(scores.length!==population.length) throw new Error('N02_AREA_SCORES_LENGTH_MISMATCH');
    const scale=optionalNumber(value,'mutation_scale',0.05);
    const ranked=population.map((candidate,index)=>({candidate,index,score:Number.isFinite(scores[index])?scores[index]:-Infinity})).sort((a,b)=>b.score-a.score);
    const eliteCount=Math.max(1,Math.ceil(ranked.length*0.25)); const elites=ranked.slice(0,eliteCount);
    const next=ranked.map((entry,index)=>elites[index%elites.length].candidate.map((gene,geneIndex)=>mutate('N02_AREA|'+index+'|'+geneIndex+'|'+gene,gene,scale)));
    return { generations_generated:1, elite_indices:elites.map(e=>e.index), best_score:elites[0].score, next_population:next, deterministic:true };
  }
}