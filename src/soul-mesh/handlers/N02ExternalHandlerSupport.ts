import { processUserDirective, transcribeAudio } from '../../../services/geminiService.ts';
import { SystemAspect } from '../../../types.ts';
import { n02CognitivePipeline } from '../../cognitive/N02CognitivePipeline';

export function requireRecord(input: unknown, id: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('N02_' + id.toUpperCase() + '_PAYLOAD_REQUIRED');
  return input as Record<string, unknown>;
}
export function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) throw new TypeError('N02_INPUT_' + key.toUpperCase() + '_REQUIRED');
  return value.trim();
}
export function optionalNumber(record: Record<string, unknown>, key: string, fallback: number): number {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
export function boundedArray<T>(value: unknown, max: number, label: string): T[] {
  if (!Array.isArray(value)) throw new TypeError('N02_' + label.toUpperCase() + '_ARRAY_REQUIRED');
  if (value.length > max) throw new RangeError('N02_' + label.toUpperCase() + '_LIMIT:' + max);
  return value as T[];
}
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) return fenced[1];
  const starts = [text.indexOf('{'), text.indexOf('[')].filter(v => v >= 0);
  if (starts.length === 0) return text.trim();
  const start = Math.min(...starts);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  return end > start ? text.slice(start, end + 1) : text.trim();
}
export function createExternalProvider() {
  return {
    async text(prompt: string, correlationId: string): Promise<string> {
      const cognitive = await n02CognitivePipeline.process(prompt, correlationId);
      const response = await processUserDirective(SystemAspect.SYNTHESIS, [{ role: 'user', parts: [{ text: prompt }] }], false, [], false, cognitive);
      return response.text;
    },
    async json<T>(prompt: string, correlationId: string, context: string): Promise<T> {
      const raw = await this.text(prompt, correlationId);
      try { return JSON.parse(extractJson(raw)) as T; }
      catch (error) { throw new Error('N02_EXTERNAL_JSON_INVALID:' + context + ':' + (error instanceof Error ? error.message : String(error))); }
    },
    async vision(imageBase64: string, mimeType: string, prompt: string, correlationId: string): Promise<string> {
      const cognitive = await n02CognitivePipeline.process(prompt, correlationId);
      const response = await processUserDirective(SystemAspect.SYNTHESIS, [{ role: 'user', parts: [{ inlineData: { mimeType, data: imageBase64 } }, { text: prompt }] }], false, [], false, cognitive);
      return response.text;
    },
    async transcribe(audioBase64: string, mimeType: string): Promise<string> { return transcribeAudio(audioBase64, mimeType); },
  };
}
