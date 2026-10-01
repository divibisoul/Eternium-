/**
 * External capability provenance: MervinPraison/PraisonAI.
 * Reference: https://github.com/MervinPraison/PraisonAI
 * License/provenance: MIT — verified at commit 66c7de22763ed823a11bcf9370b8db94ef57e71c.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, boundedArray } from './N02ExternalHandlerSupport';
export class EusHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'eus');
    const domains = boundedArray<string>(value.domains ?? [], 12, 'domains');
    if (domains.length < 2) throw new Error('N02_EUS_REQUIRES_MULTIPLE_DOMAINS');
    const question = typeof value.question === 'string' ? value.question : '';
    const synthesis = await this.provider.json<{shared_principles:string[];cross_domain_mappings:Array<Record<string,unknown>>;contradictions:string[];open_questions:string[]}>('Unify epistemic structures across domains ' + JSON.stringify(domains) + ' for question ' + question + '. Distinguish shared principles from analogy. Return JSON {"shared_principles":[],"cross_domain_mappings":[],"contradictions":[],"open_questions":[]}.', correlationId, 'eus');
    return { domains, ...synthesis };
  }
}