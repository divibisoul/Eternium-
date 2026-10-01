/**
 * External capability provenance: Nezha.
 * Reference: https://github.com/nezhahq/nezha
 * License/provenance: Exact Nezha/AGI source mapping not independently resolved; verify source/license.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, requireString, boundedArray, optionalNumber } from './N02ExternalHandlerSupport';
export class AdaptationModuleHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'adaptation_module');
    const pre = boundedArray<number>(value.pre_spikes ?? [], 256, 'pre_spikes');
    const post = boundedArray<number>(value.post_spikes ?? [], 256, 'post_spikes');
    const weights = boundedArray<number>(value.weights ?? [], 256, 'weights');
    const aPlus = optionalNumber(value, 'a_plus', 0.01);
    const aMinus = optionalNumber(value, 'a_minus', 0.012);
    const tau = optionalNumber(value, 'tau', 20);
    const dt = optionalNumber(value, 'delta_t', 0);
    if (tau <= 0) throw new RangeError('N02_STDP_TAU_INVALID');
    const deltaW = dt <= 0 ? aPlus * Math.exp(dt / tau) : -aMinus * Math.exp(-dt / tau);
    const updatedWeights = weights.map(w => w + deltaW);
    const feedback = typeof value.feedback === 'string' ? value.feedback : '';
    const adaptation = await this.provider.json<{diagnosis:string;recommended_changes:string[]}>('Analyze adaptation feedback: ' + feedback + '. Runtime STDP delta=' + deltaW + '. Return JSON {"diagnosis":"","recommended_changes":[]} and do not claim automatic source-code patching.', correlationId, 'adaptation');
    return { plasticity: 'STDP-style deterministic update', pre_spikes: pre.length, post_spikes: post.length, delta_weight: deltaW, updated_weights: updatedWeights, adaptation };
  }
}