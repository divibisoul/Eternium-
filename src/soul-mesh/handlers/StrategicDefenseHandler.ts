/**
 * External capability provenance: microsoft/agent-framework.
 * Reference: https://github.com/microsoft/agent-framework
 * License/provenance: MIT — verified.
 * Adaptation only; no upstream source code is copied into this handler.
 */
import { createExternalProvider, requireRecord, boundedArray } from './N02ExternalHandlerSupport';
export class StrategicDefenseHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'strategic_defense');
    const signals = boundedArray<Record<string,unknown>>(value.signals ?? [], 32, 'signals');
    const controls = boundedArray<string>(value.controls ?? [], 32, 'controls');
    const assessment = await this.provider.json<{threats:Array<Record<string,unknown>>;priority_controls:string[];unknowns:string[]}>('Perform defensive multi-domain risk assessment. Signals=' + JSON.stringify(signals) + ' Controls=' + JSON.stringify(controls) + '. Return threats, defensive controls and unknowns. Do not provide offensive intrusion steps. JSON {"threats":[],"priority_controls":[],"unknowns":[]}', correlationId, 'strategic-defense');
    return { signals_observed: signals.length, ...assessment };
  }
}