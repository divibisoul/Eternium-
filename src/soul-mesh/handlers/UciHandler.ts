/**
 * External capability provenance: NousResearch/hermes-agent.
 * Reference: https://github.com/NousResearch/hermes-agent
 * License/provenance: MIT — verified.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, requireString, boundedArray } from './N02ExternalHandlerSupport';
export class UciHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'uci');
    const protocol = requireString(value, 'protocol');
    const operation = requireString(value, 'operation');
    const fields = boundedArray<string>(value.fields ?? [], 64, 'fields');
    const adapter = await this.provider.json<{canonical_capability:string;mapping:Record<string,string>;validation:string[]}>('Design a universal adapter from protocol ' + protocol + ' operation ' + operation + ' and fields ' + JSON.stringify(fields) + ' into the canonical SOUL Mesh contract. Never claim a remote endpoint is connected. JSON {"canonical_capability":"","mapping":{},"validation":[]}.', correlationId, 'uci');
    return { protocol, operation, ...adapter };
  }
}