/**
 * External capability provenance: TransformerOptimus/SuperAGI.
 * Reference: https://github.com/TransformerOptimus/SuperAGI
 * License/provenance: MIT — verified at commit 1ec41bdb6ecfdc2db7d578233d3a603ab51d2aad.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, boundedArray, optionalNumber } from './N02ExternalHandlerSupport';
export class MlfgHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'mlfg');
    const tasks = boundedArray<Record<string,unknown>>(value.tasks ?? [], 32, 'tasks');
    const budget = optionalNumber(value, 'meta_budget', 5);
    const design = await this.provider.json<{hypotheses:Array<Record<string,unknown>>;evaluation_protocol:Array<Record<string,unknown>>;selection_rules:string[]}>('Generate candidate meta-learning methods for tasks ' + JSON.stringify(tasks) + ' with meta-budget ' + budget + '. Return JSON {"hypotheses":[],"evaluation_protocol":[],"selection_rules":[]} without claiming benchmark results.', correlationId, 'mlfg');
    return { task_count: tasks.length, meta_budget: budget, ...design };
  }
}