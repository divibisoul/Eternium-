/**
 * External capability provenance: HKUDS/nanobot.
 * Reference: https://github.com/HKUDS/nanobot
 * License/provenance: MIT — verified at commit e06eb24cf4abdc5b46d354fc7d1c9531b2f52dfa.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, requireString, optionalNumber } from './N02ExternalHandlerSupport';
export class BiomolecularDesignerHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'biomolecular_designer');
    const target = requireString(value, 'target');
    const budget = optionalNumber(value, 'design_budget', 8);
    if (budget < 1 || budget > 64) throw new RangeError('N02_DESIGN_BUDGET_RANGE');
    const result = await this.provider.json<{designs:Array<Record<string,unknown>>;assumptions:string[]}>('Generate candidate biomolecular design alternatives for target ' + target + '. Budget: ' + budget + '. Return JSON {"designs":[],"assumptions":[]} and never claim experimental validation or atomic-accuracy. ', correlationId, 'biomolecular-design');
    return { target, budget, ...result, validation: 'in-silico-design-only' };
  }
}