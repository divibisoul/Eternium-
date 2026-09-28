import { BNCv2, type BNCv2Signal } from '../neural/BNCv2';
import { CSAE, type CSAEPlan } from './CSAE';
import { DCRS, type DCRSAllocation } from './DCRS';
import { n02VagusBus } from '../core/VagusBus';

export type N02CognitivePipelineResult = {
  bnc: BNCv2Signal;
  csae: CSAEPlan;
  dcrs: DCRSAllocation;
};

export class N02CognitivePipeline {
  private readonly bnc = new BNCv2();
  private readonly csae = new CSAE();
  private readonly dcrs = new DCRS();
  private readonly plans = new Map<string, CSAEPlan>();
  private readonly allocations = new Map<string, DCRSAllocation>();
  private readonly unsubscribeBnc: () => void;
  private readonly unsubscribeCsae: () => void;

  constructor() {
    this.unsubscribeBnc = n02VagusBus.subscribe<BNCv2Signal>('bnc.signal', async signal => {
      const complexity = Math.min(1, Math.max(0.1, signal.payload.vector.length / 32));
      const plan = this.csae.plan(signal.payload, complexity);
      this.plans.set(signal.correlationId, plan);
      await n02VagusBus.publish(
        'csae.plan',
        'N02.CSAE',
        'N02.DCRS',
        signal.correlationId,
        plan,
      );
    });

    this.unsubscribeCsae = n02VagusBus.subscribe<CSAEPlan>('csae.plan', signal => {
      const started = performance.now();
      const allocation = this.dcrs.allocate(signal.payload);
      this.dcrs.recordExecution('allocation', performance.now() - started);
      this.allocations.set(signal.correlationId, allocation);
    });
  }

  async process(input: string, correlationId: string): Promise<N02CognitivePipelineResult> {
    const started = performance.now();
    const bncStarted = performance.now();
    const bnc = await this.bnc.process(input, correlationId);
    this.dcrs.recordExecution('bnc_v2', performance.now() - bncStarted);

    await n02VagusBus.publish(
      'bnc.signal',
      'N02.BNCv2',
      'N02.CSAE',
      correlationId,
      bnc,
    );

    const csae = this.plans.get(correlationId);
    const dcrs = this.allocations.get(correlationId);
    if (!csae || !dcrs) throw new Error('N02_COGNITIVE_PIPELINE_INCOMPLETE');

    this.dcrs.recordExecution('pipeline', performance.now() - started);
    return { bnc, csae, dcrs };
  }

  dispose(): void {
    this.unsubscribeBnc();
    this.unsubscribeCsae();
    this.plans.clear();
    this.allocations.clear();
  }
}

export const n02CognitivePipeline = new N02CognitivePipeline();
