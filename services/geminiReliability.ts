export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  sleep?: (delayMs: number) => Promise<void>;
};

const DEFAULT_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MAX_DELAY_MS = 2_000;

const sleep = (delayMs: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, delayMs));

function statusOf(error: unknown): number {
  if (typeof error !== 'object' || error === null || !('status' in error)) return 0;
  const status = Number((error as { status?: unknown }).status);
  return Number.isFinite(status) ? status : 0;
}

export function isRetryableGeminiError(error: unknown): boolean {
  const status = statusOf(error);
  if (status === 408 || status === 409 || status === 429 || status >= 500) return true;
  if (!(error instanceof Error)) return false;
  return /(timeout|timed out|temporar|unavailable|overloaded|rate.?limit|network|fetch failed|econn|socket)/i.test(error.message);
}

export async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const retries = Math.max(0, Math.min(5, options.retries ?? DEFAULT_RETRIES));
  const baseDelayMs = Math.max(25, options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS);
  const wait = options.sleep ?? sleep;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= retries || !isRetryableGeminiError(error)) throw error;
      const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const jitter = Math.floor(exponential * 0.2 * Math.random());
      await wait(exponential + jitter);
      attempt += 1;
    }
  }
}

export function shouldFallbackGemini(error: unknown): boolean {
  const status = statusOf(error);
  if (status === 401 || status === 403 || status === 400) return false;
  if (error instanceof Error && /(invalid api key|api key|permission|unauthori[sz]ed|forbidden|malformed|invalid argument)/i.test(error.message)) return false;
  return true;
}

export function geminiRetryOptions(): RetryOptions {
  const retries = Number.parseInt(process.env.GEMINI_MAX_RETRIES ?? String(DEFAULT_RETRIES), 10);
  const baseDelayMs = Number.parseInt(process.env.GEMINI_RETRY_BASE_MS ?? String(DEFAULT_BASE_DELAY_MS), 10);
  const maxDelayMs = Number.parseInt(process.env.GEMINI_RETRY_MAX_MS ?? String(DEFAULT_MAX_DELAY_MS), 10);
  return {
    retries: Number.isFinite(retries) ? retries : DEFAULT_RETRIES,
    baseDelayMs: Number.isFinite(baseDelayMs) ? baseDelayMs : DEFAULT_BASE_DELAY_MS,
    maxDelayMs: Number.isFinite(maxDelayMs) ? maxDelayMs : DEFAULT_MAX_DELAY_MS,
  };
}
