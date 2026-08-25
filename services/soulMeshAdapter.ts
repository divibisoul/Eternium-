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

  // Dispatch remains provider-neutral: existing Eternium services perform the
  // actual cognitive work; this adapter only translates the Soul mesh contract.
  return {
    success: true,
    output: {
      capability: task.capability,
      input: task.input,
      context: task.context,
      provider: 'eternium',
    },
  };
}
