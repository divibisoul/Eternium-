/**
 * External capability provenance: OmegA/Chyren.
 * Reference: https://github.com/mnguyenz/chyren
 * License/provenance: Exact OmegA/Chyren mapping not independently resolved; verify source/license.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { requireRecord, boundedArray, optionalNumber } from './N02ExternalHandlerSupport';
function dftEnergy(signal: number[]): number[] {
  const n=signal.length; const out:number[]=[];
  for(let k=0;k<n;k++){ let re=0, im=0; for(let t=0;t<n;t++){ const angle=2*Math.PI*k*t/n; re+=signal[t]*Math.cos(angle); im-=signal[t]*Math.sin(angle); } out.push((re*re+im*im)/Math.max(1,n)); }
  return out;
}
export class CotArhdHandler {
  async handle(input: unknown, correlationId: string) {
    void correlationId;
    const value=requireRecord(input,'cot_arhd');
    const load=boundedArray<number>(value.load_history??[],64,'load_history');
    if(load.length<2) throw new Error('N02_ARHD_LOAD_HISTORY_REQUIRED');
    const energy=dftEnergy(load);
    const peakIndex=energy.indexOf(Math.max(...energy));
    const urgency=optionalNumber(value,'urgency',0.5);
    const budget=optionalNumber(value,'budget',1);
    const trend=load[load.length-1]-load[0];
    const predicted=Math.max(0,Math.min(1,load[load.length-1]+trend*0.25));
    const allocation=Math.max(0,Math.min(budget,(0.5+0.5*urgency)*budget*(1-predicted*0.5)));
    return { scheduler:'spectral-demand', peak_frequency_bin:peakIndex, spectral_energy:energy, trend, predicted_load:predicted, allocation, budget };
  }
}