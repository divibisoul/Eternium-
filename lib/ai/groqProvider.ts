import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';

export type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type FastInferenceOptions = {
  messages: readonly GroqMessage[];
  model?: string;
  temperature?: number;
  maxCompletionTokens?: number;
};

export type FastInferenceResult = {
  text: string;
  provider: 'groq' | 'google-gemini';
  model: string;
};

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function groqIsUnavailable(error: unknown): boolean {
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: unknown }).status)
    : 0;
  return status === 429 || status === 498 || status >= 500;
}

function toPrompt(messages: readonly GroqMessage[]): string {
  return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n');
}

async function fallbackToGemini(options: FastInferenceOptions): Promise<FastInferenceResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY_REQUIRED_FOR_GROQ_FALLBACK');
  const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model,
    contents: toPrompt(options.messages),
    config: {
      temperature: options.temperature,
      maxOutputTokens: options.maxCompletionTokens,
    },
  });
  const text = response.text?.trim();
  if (!text) throw new Error('GEMINI_FALLBACK_EMPTY_RESPONSE');
  return { text, provider: 'google-gemini', model };
}

/** Server-side only. Groq is attempted first; quota/capacity/provider failures fall back to Gemini. */
export async function generateFastInference(options: FastInferenceOptions): Promise<FastInferenceResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return fallbackToGemini(options);

  const groq = new Groq({ apiKey });
  const model = options.model?.trim() || DEFAULT_GROQ_MODEL;
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [...options.messages],
      temperature: options.temperature,
      max_completion_tokens: options.maxCompletionTokens,
    });
    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('GROQ_EMPTY_RESPONSE');
    return { text, provider: 'groq', model };
  } catch (error) {
    if (groqIsUnavailable(error) || error instanceof Error) return fallbackToGemini(options);
    throw error;
  }
}
