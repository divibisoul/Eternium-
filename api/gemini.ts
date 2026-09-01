import { GoogleGenAI } from '@google/genai';

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const ALLOWED_MODELS = new Set(['gemini-2.5-flash']);

type GeminiRequest = {
  model: string;
  contents: unknown;
  config?: Record<string, unknown>;
};

function apiKey() {
  const value = process.env.GEMINI_API_KEY?.trim();
  if (!value) throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  return value;
}

function validRequest(body: unknown): body is GeminiRequest {
  if (!body || typeof body !== 'object') return false;
  const value = body as Record<string, unknown>;
  return typeof value.model === 'string'
    && ALLOWED_MODELS.has(value.model)
    && value.contents !== undefined
    && (value.config === undefined || (typeof value.config === 'object' && value.config !== null));
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const length = Number(req.headers['content-length'] ?? 0);
  if (length > MAX_BODY_BYTES) return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE' });
  if (!validRequest(req.body)) return res.status(400).json({ error: 'INVALID_GEMINI_REQUEST' });

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey() });
    const response = await ai.models.generateContent({
      model: req.body.model,
      contents: req.body.contents as any,
      config: req.body.config as any,
    });
    return res.status(200).json({
      text: response.text,
      candidates: response.candidates ?? [],
    });
  } catch (error) {
    console.error('Gemini proxy error:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('API_KEY') || message.includes('permission') || message.includes('401') || message.includes('403')) {
      return res.status(401).json({ error: 'GEMINI_AUTHENTICATION_FAILED' });
    }
    return res.status(502).json({ error: 'GEMINI_UPSTREAM_FAILURE' });
  }
}
