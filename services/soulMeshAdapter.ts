/**
 * Eternium-side adapter for the Soul six-core mesh.
 * N06 owns cognition/governance capabilities but does not ship an AI model.
 */
export type EterniumCapability =
  | 'reasoning'
  | 'planning'
  | 'agent-execution'
  | 'multimodal-analysis'
  | 'synthesis'
  | 'governance';

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

export interface EterniumTask { capability: EterniumCapability; input: unknown; context?: Record<string, unknown>; }
export interface EterniumTaskResult { success: boolean; output?: unknown; error?: { code: string; message: string }; }
export type EterniumCapabilityHandler = (input: unknown, context?: Record<string, unknown>) => Promise<unknown> | unknown;

export const ETERNIUM_CAPABILITIES: EterniumCapability[] = [
  'reasoning',
  'planning',
  'agent-execution',
  'multimodal-analysis',
  'synthesis',
  'governance',
];

const handlers = new Map<EterniumCapability, EterniumCapabilityHandler>();

export function registerEterniumCapabilityHandler(capability: EterniumCapability, handler: EterniumCapabilityHandler) {
  handlers.set(capability, handler);
  return () => handlers.delete(capability);
}

export function announceEterniumCapabilities(): SoulMeshMessage<{ capabilities: EterniumCapability[] }> {
  return {
    protocol: 'soul-mesh/1',
    messageId: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    source: 'N06',
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

  const handler = handlers.get(task.capability);
  if (!handler) {
    return { success: false, error: { code: 'CAPABILITY_NOT_CONNECTED', message: task.capability } };
  }

  try {
    return { success: true, output: await handler(task.input, task.context) };
  } catch (error) {
    return { success: false, error: { code: 'CAPABILITY_EXECUTION_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}
