import assert from 'node:assert/strict';
import {
  MeshResilienceController,
  backoffDelayMs,
  classifyMeshError,
  isIdempotentCapability,
} from '../api/soul-mesh/resilience.ts';

assert.equal(isIdempotentCapability('mesh.ping'), true);
assert.equal(isIdempotentCapability('mesh.describe'), true);
assert.equal(isIdempotentCapability('capability.list'), true);
assert.equal(isIdempotentCapability('task.execute'), false);
assert.equal(backoffDelayMs(0, { baseBackoffMs: 50, maxBackoffMs: 1000 }), 50);
assert.equal(backoffDelayMs(1, { baseBackoffMs: 50, maxBackoffMs: 1000 }), 100);
assert.equal(backoffDelayMs(5, { baseBackoffMs: 50, maxBackoffMs: 120 }), 120);
assert.equal(classifyMeshError(new Error('SOUL_MESH_CORRELATION_MISMATCH')), 'correlation');
assert.equal(classifyMeshError(new Error('SOUL_MESH_INVALID_REMOTE_JSON:N03:502')), 'invalid_json');

const resilience = new MeshResilienceController({
  failureThreshold: 2,
  resetTimeoutMs: 10,
  maxRetries: 1,
  baseBackoffMs: 1,
  maxBackoffMs: 5,
  forensicLimit: 4,
});

let attempts = 0;
await assert.rejects(
  resilience.execute('N03', 'mesh.ping', async () => {
    attempts += 1;
    throw new Error('network unavailable');
  }),
  /RESILIENCE_EXHAUSTED/,
);
const first = resilience.snapshot().peers.N03;
assert.equal(attempts, 2, 'idempotent ping must retry once');
assert.equal(first.metrics.requests, 1, 'logical request counter must not count retries');
assert.equal(first.metrics.retries, 1, 'retry counter must count only retry attempts');
assert.equal(first.state, 'open');
assert.match(first.forensic[0].stack ?? '', /Error/);

const beforeMutation = attempts;
await assert.rejects(
  resilience.execute('N03', 'task.execute', async () => {
    attempts += 1;
    throw new Error('network unavailable');
  }),
  /CIRCUIT_OPEN|RESILIENCE_EXHAUSTED/,
);
assert.equal(attempts, beforeMutation, 'open circuit must reject without invoking mutation');

await new Promise(resolve => setTimeout(resolve, 12));
const recovered = await resilience.execute('N03', 'mesh.ping', async () => ({ ok: true }));
assert.deepEqual(recovered, { ok: true });
const final = resilience.snapshot().peers.N03;
assert.equal(final.state, 'closed');
assert.equal(final.metrics.consecutiveFailures, 0);
assert.equal(final.metrics.requests, 2);

const prometheus = resilience.prometheus();
assert.match(prometheus, /n02_mesh_requests_total\{target="N03"\} 2/);
assert.match(prometheus, /n02_mesh_retries_total\{target="N03"\} 1/);
assert.match(prometheus, /n02_mesh_failures_by_kind_total\{target="N03",kind="network"\} 2/);
assert.match(prometheus, /n02_mesh_circuit_state\{target="N03"\} 0/);

console.log('N02 Mesh resilience: PASS');
