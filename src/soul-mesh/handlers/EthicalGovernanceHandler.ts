import { createExternalProvider, requireRecord, requireString, boundedArray } from './N02ExternalHandlerSupport';
export class EthicalGovernanceHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'ethical_governance');
    const decision = requireString(value, 'decision');
    const context = value.context ?? {};
    const principles = boundedArray<string>(value.principles ?? ['non-maleficence','transparency','human-oversight','provenance','privacy','reversibility'], 12, 'principles');
    const roles = ['ethics','privacy','safety','fairness','provenance','human-oversight'];
    const reviews = await Promise.all(roles.map(async role => ({ role, review: await this.provider.text('Review this decision from the ' + role + ' perspective. Principles=' + JSON.stringify(principles) + ' Decision=' + decision + ' Context=' + JSON.stringify(context), correlationId) })));
    const critic = await this.provider.json<{decision:'allow'|'allow_with_constraints'|'block';reasons:string[];required_controls:string[]}>('Act as final critic over six independent reviews. Produce conservative governance output. Reviews=' + JSON.stringify(reviews) + '. JSON {"decision":"allow|allow_with_constraints|block","reasons":[],"required_controls":[]}', correlationId, 'ethical-critic');
    return { decision, reviews, critic };
  }
}