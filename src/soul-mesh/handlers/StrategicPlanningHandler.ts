import { createExternalProvider, requireRecord, requireString, optionalNumber, boundedArray } from './N02ExternalHandlerSupport';
export class StrategicPlanningHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'strategic_planning');
    const objective = requireString(value, 'objective');
    const resources = value.resources && typeof value.resources === 'object' ? value.resources : {};
    const constraints = boundedArray<string>(value.constraints ?? [], 32, 'constraints');
    const horizon = optionalNumber(value, 'horizon', 12);
    const plan = await this.provider.json<{strategic_goal:string;hierarchy:Array<Record<string,unknown>>;resource_allocation:Record<string,number>;review_points:string[]}>('Build a hierarchical strategy for ' + objective + '. Resources: ' + JSON.stringify(resources) + '. Constraints: ' + JSON.stringify(constraints) + '. Horizon: ' + horizon + '. Return JSON with strategic_goal, hierarchy, resource_allocation and review_points.', correlationId, 'strategic-planning');
    return { objective, horizon, resources, ...plan };
  }
}