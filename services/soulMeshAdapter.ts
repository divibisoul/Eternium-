/**
 * Eternium-side adapter for the Soul mesh.
 * Capability declaration is separate from execution. This adapter never
 * echoes an input as a synthetic successful result.
 */
export type EterniumCapability =
  | 'reasoning'
  | 'planning'
  | 'agent-execution'
  | 'multimodal-analysis'
  | 'gemini-inference';

export interface SoulMeshMessage<T = unknown> {
  protocol: 'soul-mesh/1';
  messageId: string;
  correlationId: string;
  source: string;
  target: string | '*';
  kind: 'capability:announce' | 'capability:request' | 'capability:result' | 'event' | 'context';
  capability?: string;
  timestamp: number;
  payload: T;
}

export interface EterniumTask {
  capability: EterniumCapability;
  input: unknown;
  context?: Record<string, unknown>;
}

export interface EterniumTaskResult {
  success: boolean;
  output?: unknown;
  error?: { code: string; message: string };
}

export type EterniumTaskExecutor = (task: EterniumTask) => Promise<unknown>;

export const ETERNIUM_CAPABILITIES: readonly EterniumCapability[] = Object.freeze([
  'reasoning',
  'planning',
  'agent-execution',
  'multimodal-analysis',
  'gemini-inference',
]);

let taskExecutor: EterniumTaskExecutor | null = null;

export function bindEterniumTaskExecutor(executor: EterniumTaskExecutor): void {
  if (taskExecutor && taskExecutor !== executor) {
    throw new Error('ETERNium_TASK_EXECUTOR_ALREADY_BOUND');
  }
  taskExecutor = executor;
}

export function isEterniumTaskExecutorBound(): boolean {
  return taskExecutor !== null;
}

export function announceEterniumCapabilities(): SoulMeshMessage<{ capabilities: EterniumCapability[] }> {
  return {
    protocol: 'soul-mesh/1',
    messageId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    source: 'eternium',
    target: '*',
    kind: 'capability:announce',
    timestamp: Date.now(),
    payload: { capabilities: [...ETERNIUM_CAPABILITIES] },
  };
}

export async function executeSoulTask(task: EterniumTask): Promise<EterniumTaskResult> {
  if (!ETERNIUM_CAPABILITIES.includes(task.capability)) {
    return {
      success: false,
      error: {
        code: 'CAPABILITY_UNAVAILABLE',
        message: task.capability,
      },
    };
  }

  if (!taskExecutor) {
    return {
      success: false,
      error: {
        code: 'EXECUTOR_UNBOUND',
        message: 'Nenhum executor real foi conectado ao adaptador Eternium-SOUL.',
      },
    };
  }

  try {
    const output = await taskExecutor(task);
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'EXECUTION_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
