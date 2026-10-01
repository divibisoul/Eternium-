import { createExternalProvider, requireRecord, requireString, boundedArray } from './N02ExternalHandlerSupport';

/**
 * Structured scientific-analysis handler.
 * Reference pattern: Codette/Newton analytical-agent concept named in the acquisition map.
 * No upstream source code is copied.
 */
export class ScientificReasoningHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'einstein_reasoning');
    const problem = requireString(value, 'problem');
    const data = boundedArray<Record<string,unknown>>(value.data ?? [], 64, 'data');
    const reasoning = await this.provider.json<{assumptions:string[];derivation:string[];equations:string[];checks:string[];conclusion:string;uncertainties:string[]}>(
      'Analyze the supplied scientific problem with explicit assumptions, derivation steps, equations, verification checks and uncertainty. Problem=' + problem + ' Data=' + JSON.stringify(data) + '. JSON {"assumptions":[],"derivation":[],"equations":[],"checks":[],"conclusion":"","uncertainties":[]}',
      correlationId, 'scientific-reasoning',
    );
    return { problem, ...reasoning };
  }
}