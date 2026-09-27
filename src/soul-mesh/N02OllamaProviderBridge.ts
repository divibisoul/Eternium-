type OllamaMessage = {
  role: string;
  content: string;
};

type OllamaPayload = {
  text?: string;
  model?: string;
  system?: string;
  messages?: OllamaMessage[];
  temperature?: number;
};

function baseUrl(): string {
  const value = String(process.env.OLLAMA_BASE_URL ?? '').trim().replace(/\/$/, '');
  if (!value) throw new Error('OLLAMA_BASE_URL_NOT_CONFIGURED');
  return value;
}

function normalizeMessages(payload: OllamaPayload): OllamaMessage[] {
  if (Array.isArray(payload.messages) && payload.messages.length > 0) {
    return payload.messages
      .filter(message => typeof message?.role === 'string' && typeof message?.content === 'string')
      .map(message => ({ role: message.role, content: message.content }));
  }
  const text = String(payload.text ?? '').trim();
  if (!text) throw new Error('OLLAMA_TEXT_REQUIRED');
  const messages: OllamaMessage[] = [];
  if (String(payload.system ?? '').trim()) messages.push({ role: 'system', content: String(payload.system).trim() });
  messages.push({ role: 'user', content: text });
  return messages;
}

export function ollamaConfigured(): boolean {
  return Boolean(String(process.env.OLLAMA_BASE_URL ?? '').trim());
}

export async function generateWithOllama(payload: OllamaPayload) {
  const model = String(payload.model ?? process.env.OLLAMA_MODEL ?? '').trim();
  if (!model) throw new Error('OLLAMA_MODEL_NOT_CONFIGURED');

  const controller = new AbortController();
  const timeoutMs = Number(process.env.OLLAMA_REQUEST_TIMEOUT_MS ?? 30000);
  const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30000);
  try {
    const response = await fetch(`${baseUrl()}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        model,
        messages: normalizeMessages(payload),
        temperature: typeof payload.temperature === 'number' ? payload.temperature : undefined,
        stream: false,
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`OLLAMA_HTTP_${response.status}`);
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('OLLAMA_EMPTY_RESPONSE');
    return {
      nucleus: 'N02',
      provider: 'ollama',
      model,
      text: text.trim(),
      usage: data?.usage ?? undefined,
    };
  } finally {
    clearTimeout(timer);
  }
}
