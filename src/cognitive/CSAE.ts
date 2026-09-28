import type { BNCv2Signal } from '../neural/BNCv2';

export type CSAEPlan = {
  correlationId: string;
  strategy: 'direct' | 'multistage' | 'resource-constrained';
  stages: string[];
  neuralDimension: number;
};

export class CSAE {
  plan(signal: BNCv2Signal, complexity: number): CSAEPlan {
    const normalizedComplexity = Math.max(0, Math.min(1, complexity));
    const strategy =
      normalizedComplexity >= 0.75
        ? 'multistage'
        : signal.sharedNeural === 'BLOCKED' || signal.vector.length < 4
          ? 'resource-constrained'
          : 'direct';

    const stages =
      strategy === 'multistage'
        ? ['integrity', 'neural', 'reasoning', 'validation']
        : strategy === 'resource-constrained'
          ? ['integrity', 'local-neural', 'bounded-reasoning']
          : ['integrity', 'neural', 'reasoning'];

    return {
      correlationId: signal.correlationId,
      strategy,
      stages,
      neuralDimension: signal.vector.length,
    };
  }
}

export const n02CSAE = new CSAE();
