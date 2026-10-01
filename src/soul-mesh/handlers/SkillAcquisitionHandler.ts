import { createExternalProvider, requireRecord, boundedArray, requireString } from './N02ExternalHandlerSupport';
export class SkillAcquisitionHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'skill_acquisition');
    const name = requireString(value, 'skill_name');
    const demonstrations = boundedArray<Record<string,unknown>>(value.demonstrations ?? [], 16, 'demonstrations');
    if (demonstrations.length === 0) throw new Error('N02_SKILL_DEMONSTRATIONS_REQUIRED');
    const skill = await this.provider.json<{preconditions:string[];procedure:Array<Record<string,unknown>>;verification:string[];failure_modes:string[]}>('Infer a reusable skill specification from demonstrations for skill ' + name + '. Preserve uncertainty and do not claim generalization beyond evidence. JSON {"preconditions":[],"procedure":[],"verification":[],"failure_modes":[]}. Demonstrations: ' + JSON.stringify(demonstrations), correlationId, 'skill-acquisition');
    return { skill_name: name, source_demonstrations: demonstrations.length, skill };
  }
}