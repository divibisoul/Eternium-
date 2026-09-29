import { processUserDirective } from './geminiService.ts';
import { n02CognitivePipeline } from '../src/cognitive/N02CognitivePipeline';
import { SystemAspect } from '../types.ts';
import type { Content } from '@google/genai';

/**
 * Eternium-side compatibility adapter for the preserved Soul mesh contract.
 *
 * This module is not a second mesh implementation. It translates the legacy
 * task vocabulary into the existing N02 provider/runtime primitives and never
 * returns synthetic success.
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

function contentFromInput(input: unknown): Content[] {
  if (typeof input === 'string' && input.trim()) {
    return [{ role: 'user', parts: [{ text: input.trim() }] }] as Content[];
  }

  if (input && typeof input === 'object') {
    const value = input as Record<string, unknown>;
    if (Array.isArray(value.contents)) return value.contents as Content[];
    if (typeof value.text === 'string' && value.text.trim()) {
      return [{ role: 'user', parts: [{ text: value.text.trim() }] }] as Content[];
    }
  }

  throw new Error('ETERNIUM_TASK_INPUT_REQUIRED');
}

function inputText(input: unknown): string {
  const contents = contentFromInput(input);
  const parts = contents.flatMap((content: any) => Array.isArray(content.parts) ? content.parts : []);
  const text = parts.map((part: any) => typeof part?.text === 'string' ? part.text : '').filter(Boolean).join('\n').trim();
  if (!text) throw new Error('ETERNIUM_TASK_TEXT_REQUIRED');
  return text;
}

export async function announceEterniumCapabilities(): Promise<SoulMeshMessage<{ capabilities: EterniumCapability[] }>> {
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
  try {
    switch (task.capability) {
      case 'reasoning': {
        const text = inputText(task.input);
        const pipeline = await n02CognitivePipeline.process(text, crypto.randomUUID());
        return { success: true, output: { capability: task.capability, pipeline, context: task.context } };
      }
      case 'planning': {
        const text = inputText(task.input);
        const pipeline = await n02CognitivePipeline.process(text, crypto.randomUUID());
        return { success: true, output: { capability: task.capability, plan: pipeline.csae, allocation: pipeline.dcrs, context: task.context } };
      }
      case 'multimodal-analysis': {
        const response = await processUserDirective(
          SystemAspect.SYNTHESIS,
          contentFromInput(task.input),
          false,
          [{ id: 'mpvs', name: 'MPVS', status: 'Estável', metric: 100 }],
          false,
        );
        return { success: true, output: { capability: task.capability, text: response.text, context: task.context } };
      }
      case 'gemini-inference': {
        const response = await processUserDirective(
          SystemAspect.SYNTHESIS,
          contentFromInput(task.input),
          false,
          [],
          false,
        );
        return { success: true, output: { capability: task.capability, text: response.text, context: task.context } };
      }
      case 'agent-execution':
        return {
          success: false,
          error: {
            code: 'AGENT_EXECUTION_TARGET_REQUIRED',
            message: 'Legacy task vocabulary does not identify a concrete N02-owned agent or capability.',
          },
        };
      default:
        return { success: false, error: { code: 'CAPABILITY_UNAVAILABLE', message: task.capability } };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CAPABILITY_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
