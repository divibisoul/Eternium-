import assert from 'node:assert/strict';
import {
  MeshResilienceController,
  backoffDelayMs,
  jitteredBackoffDelayMs,
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
assert.equal(jitteredBackoffDelayMs(0, { baseBackoffMs: 100, maxBackoffMs: 1000 }, 0), 100);
assert.equal(jitteredBackoffDelayMs(0, { baseBackoffMs: 100, maxBackoffMs: 1000 }, 1), 120);
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
assert.equal(attempts, 2, 'idempotent ping must retry once');
assert.equal(resilience.snapshot().peers.N03.metrics.retries, 1);
assert.equal(resilience.snapshot().peers.N03.state, 'open');
assert.ok((resilience.snapshot().peers.N03.metrics.lastLatencyMs ?? 0) >= 0);
assert.ok(resilience.snapshot().peers.N03.metrics.totalLatencyMs >= 0);
assert.match(resilience.snapshot().peers.N03.forensic[0].stack ?? '', /Error/);

await assert.rejects(
  resilience.execute('N03', 'task.execute', async () => {
    attempts += 1;
    throw new Error('network unavailable');
  }),
  /CIRCUIT_OPEN|RESILIENCE_EXHAUSTED/,
);
assert.equal(attempts, 2, 'non-idempotent operation must not be retried');

await new Promise(resolve => setTimeout(resolve, 12));
const recovered = await resilience.execute('N03', 'mesh.ping', async () => ({ ok: true }));
assert.deepEqual(recovered, { ok: true });
assert.equal(resilience.snapshot().peers.N03.state, 'closed');
assert.equal(resilience.snapshot().peers.N03.metrics.consecutiveFailures, 0);
assert.equal(resilience.snapshot().peers.N03.metrics.recoveryCount, 1);
assert.ok(resilience.snapshot().peers.N03.metrics.totalRecoveryMs >= 0);

const prometheus = resilience.prometheus();
assert.match(prometheus, /n02_mesh_requests_total\{target="N03"\}/);
assert.match(prometheus, /n02_mesh_failures_total\{target="N03"\}/);
assert.match(prometheus, /n02_mesh_retries_total\{target="N03"\}/);
assert.match(prometheus, /n02_mesh_latency_ms_total\{target="N03"\}/);
assert.match(prometheus, /n02_mesh_recovery_ms_total\{target="N03"\}/);
assert.match(prometheus, /n02_mesh_circuit_opens_total\{target="N03"\}/);
assert.match(prometheus, /n02_mesh_circuit_state\{target="N03"\}/);

console.log('N02 Mesh resilience: PASS');
