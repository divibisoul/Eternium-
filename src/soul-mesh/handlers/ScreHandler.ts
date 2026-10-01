import { createExternalProvider, requireRecord, requireString } from './N02ExternalHandlerSupport';
export class ScreHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'scre');
    const target = requireString(value, 'target_code');
    const objective = requireString(value, 'objective');
    const language = typeof value.language === 'string' ? value.language : 'typescript';
    const review = await this.provider.json<{risk:string[];patch:string;tests:string[];reasoning:string}>('Review this ' + language + ' code for objective ' + objective + '. Return a minimal patch proposal, tests, risks and reasoning. Never execute or silently apply the patch. JSON {"risk":[],"patch":"","tests":[],"reasoning":""}. Code:\n' + target, correlationId, 'scre');
    return { mode: 'proposal', language, ...review };
  }
}