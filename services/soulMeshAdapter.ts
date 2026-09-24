/**
 * Eternium-side adapter for the Soul six-core mesh.
 * This keeps Eternium's cognitive capabilities independent from Android.
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


export type SoulTaskExecutor = (task: EterniumTask) => Promise<unknown> | unknown;
let soulTaskExecutor: SoulTaskExecutor | null = null;

export function registerSoulTaskExecutor(executor: SoulTaskExecutor | null): void {
  soulTaskExecutor = executor;
}

export const ETERNIUM_CAPABILITIES: EterniumCapability[] = [
  'reasoning',
  'planning',
  'agent-execution',
  'multimodal-analysis',
  'gemini-inference',
];

export function announceEterniumCapabilities(): SoulMeshMessage<{ capabilities: EterniumCapability[] }> {
  return {
    protocol: 'soul-mesh/1',
    messageId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    source: 'eternium',
    target: '*',
    kind: 'capability:announce',
    timestamp: Date.now(),
    payload: { capabilities: ETERNIUM_CAPABILITIES },
  };
}

export async function executeSoulTask(task: EterniumTask): Promise<EterniumTaskResult> {
  if (!ETERNIUM_CAPABILITIES.includes(task.capability)) {
    return { success: false, error: { code: 'CAPABILITY_UNAVAILABLE', message: task.capability } };
  }

  if (!soulTaskExecutor) {
    return { success: false, error: { code: 'EXECUTOR_NOT_CONNECTED', message: `No real executor registered for ${task.capability}` } };
  }
  try {
    const output = await soulTaskExecutor(task);
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