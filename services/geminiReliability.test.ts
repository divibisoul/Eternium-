import { strict as assert } from 'node:assert';
import test from 'node:test';
import { geminiRetryOptions, isRetryableGeminiError, shouldFallbackGemini, withGeminiRetry } from './geminiReliability.ts';
import { FUNCTIONAL_CORE_PERSONA_IDS } from './geminiService.ts';

test('N02 keeps exactly five functional personas', () => {
  assert.deepEqual([...FUNCTIONAL_CORE_PERSONA_IDS].sort(), ['asc', 'bnc_v2', 'einstein_code', 'mpvs', 'neural_forge']);
});

test('retry performs bounded retries for transient errors', async () => {
  let attempts = 0;
  const delays: number[] = [];
  const result = await withGeminiRetry(async () => {
    attempts += 1;
    if (attempts < 3) throw Object.assign(new Error('temporary overload'), { status: 503 });
    return 'ok';
  }, { retries: 2, baseDelayMs: 1, maxDelayMs: 1, sleep: async (delay) => { delays.push(delay); } });
  assert.equal(result, 'ok');
  assert.equal(attempts, 3);
  assert.equal(delays.length, 2);
});

test('non-transient authentication failure is not retried or silently fallen back', async () => {
  let attempts = 0;
  await assert.rejects(
    withGeminiRetry(async () => {
      attempts += 1;
      throw Object.assign(new Error('permission denied'), { status: 403 });
    }, geminiRetryOptions()),
  );
  assert.equal(attempts, 1);
  assert.equal(isRetryableGeminiError(Object.assign(new Error('overloaded'), { status: 503 })), true);
  assert.equal(shouldFallbackGemini(Object.assign(new Error('permission denied'), { status: 403 })), false);
  assert.equal(shouldFallbackGemini(Object.assign(new Error('service unavailable'), { status: 503 })), true);
});

console.log('Gemini reliability tests: PASS');
