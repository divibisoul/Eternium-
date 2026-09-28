import type { CSAEPlan } from './CSAE';

export type DCRSAllocation = {
  correlationId: string;
  priority: number;
  neuralWeight: number;
  reasoningWeight: number;
  validationWeight: number;
  basis: 'observed-plan';
};

export class DCRS {
  private readonly executionMs = new Map<string, number>();

  recordExecution(stage: string, durationMs: number): void {
    if (!Number.isFinite(durationMs) || durationMs < 0) return;
    this.executionMs.set(stage, durationMs);
  }

  allocate(plan: CSAEPlan): DCRSAllocation {
    const weights: Record<string, number> = {
      integrity: 1,
      'neural': 2,
      'local-neural': 3,
      reasoning: 3,
      'bounded-reasoning': 2,
      validation: 1.5,
    };

    const neuralWeight = weights[plan.stages.find(stage => stage === 'neural' || stage === 'local-neural') ?? 'neural'];
    const reasoningWeight = weights[plan.stages.find(stage => stage === 'reasoning' || stage === 'bounded-reasoning') ?? 'reasoning'];
    const validationWeight = weights.validation;

    const observed = [...this.executionMs.values()];
    const averageObserved = observed.length > 0
      ? observed.reduce((sum, value) => sum + value, 0) / observed.length
      : 0;

    const priority = Math.min(
      100,
      Math.round(50 + plan.stages.length * 8 + Math.min(30, averageObserved / 10)),
    );

    return {
      correlationId: plan.correlationId,
      priority,
      neuralWeight,
      reasoningWeight,
      validationWeight,
      basis: 'observed-plan',
    };
  }
}

export const n02DCRS = new DCRS();
