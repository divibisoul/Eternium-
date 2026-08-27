import { requestPeerCapability, type NucleusId } from '../../api/soul-mesh/peer-client';

export type OrchestrationStep = {
  id: string;
  capability: string;
  target: NucleusId;
  task: string;
};

export type LocalExecutor = (capability: string, task: string, context: Record<string, unknown>) => Promise<unknown>;

/** Runtime orchestration layer. It uses existing N02 handlers locally and the existing Mesh client remotely. */
export class N02SystemOrchestrator {
  constructor(private readonly localCapabilities: () => Set<string>, private readonly localExecute: LocalExecutor) {}

  private decompose(task: string): OrchestrationStep[] {
    const lines = task.split(/\n|\s*;\s*/).map(x => x.trim()).filter(Boolean);
    const units = lines.length > 1 ? lines : [task.trim()];
    return units.map((unit, index) => {
      const targetMatch = unit.match(/(?:^|\s)target\s*=\s*(N01|N02|N03|N04|N05|N06)\b/i);
      const capMatch = unit.match(/(?:^|\s)capability\s*=\s*([\w.-]+)/i);
      const target = (targetMatch?.[1]?.toUpperCase() ?? 'N02') as NucleusId;
      const capability = capMatch?.[1] ?? 'ai.reason';
      return { id: `step-${index + 1}`, capability, target, task: unit.replace(/\b(?:target|capability)\s*=\s*[^\s;]+/gi, '').trim() };
    });
  }

  async execute(task: string, context: Record<string, unknown> = {}) {
    if (!task.trim()) throw new Error('ORCHESTRATION_TASK_REQUIRED');
    const steps = this.decompose(task);
    const results: Array<Record<string, unknown>> = [];
    for (const step of steps) {
      const startedAt = Date.now();
      try {
        const output = step.target === 'N02' && this.localCapabilities().has(step.capability)
          ? await this.localExecute(step.capability, step.task, context)
          : step.target === 'N02'
            ? await this.localExecute('ai.reason', step.task, context)
            : await requestPeerCapability(step.target, step.capability, { task: step.task, context });
        results.push({ ...step, status: 'completed', durationMs: Date.now() - startedAt, output });
      } catch (error) {
        results.push({ ...step, status: 'failed', durationMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
      }
    }
    return { nucleus: 'N02', task, steps: results, completed: results.filter(r => r.status === 'completed').length, failed: results.filter(r => r.status === 'failed').length, timestamp: new Date().toISOString() };
  }
}
