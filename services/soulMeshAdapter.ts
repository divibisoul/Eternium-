import { executeN02Capability } from './soulMeshRuntime.ts';

export type NucleusId = 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06';

export type EterniumCapability =
  | 'reasoning'
  | 'planning'
  | 'agent-execution'
  | 'multimodal-analysis'
  | 'gemini-inference';

export interface SoulMeshMessage<T = unknown> {
  protocol: 'soul-mesh/1';
  id: string;
  correlationId: string;
  source: NucleusId;
  target: NucleusId;
  kind: 'request' | 'response' | 'event' | 'error';
  capability: string;
  timestamp: number;
  payload: T;
}

export interface EterniumTask {
  capability: EterniumCapability;
  input: unknown;
  context?: Record<string, unknown>;
  mode?: 'Harmonia' | 'Análise' | 'Abstrato' | 'Síntese';
  useWebSearch?: boolean;
  image?: { data: string; mimeType: string };
}

export interface EterniumTaskResult {
  success: boolean;
  output?: unknown;
  error?: { code: string; message: string };
}

export const ETERNIUM_CAPABILITIES: EterniumCapability[] = [
  'reasoning', 'planning', 'agent-execution', 'multimodal-analysis', 'gemini-inference',
];

export function announceEterniumCapabilities(): SoulMeshMessage<{ capabilities: EterniumCapability[] }> {
  return {
    protocol: 'soul-mesh/1',
    id: crypto.randomUUID(),
    correlationId: crypto.randomUUID(),
    source: 'N02',
    target: 'N01',
    kind: 'event',
    capability: 'capability.list',
    timestamp: Date.now(),
    payload: { capabilities: ETERNIUM_CAPABILITIES },
  };
}

export async function executeSoulTask(task: EterniumTask): Promise<EterniumTaskResult> {
  if (!ETERNIUM_CAPABILITIES.includes(task.capability)) {
    return { success: false, error: { code: 'CAPABILITY_UNAVAILABLE', message: task.capability } };
  }

  if (task.capability === 'agent-execution') {
    return { success: false, error: { code: 'CAPABILITY_RUNTIME_NOT_IMPLEMENTED', message: 'agent-execution requires the N02 agent runtime; it is not emulated by the Mesh adapter.' } };
  }

  try {
    const output = await executeN02Capability(task.capability, {
      input: task.input,
      context: task.context,
      mode: task.mode,
      useWebSearch: task.useWebSearch,
      image: task.image,
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: { code: 'CAPABILITY_EXECUTION_ERROR', message: error instanceof Error ? error.message : String(error) },
    };
  }
}
