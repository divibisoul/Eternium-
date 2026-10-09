import assert from 'node:assert/strict';
import test from 'node:test';
import { MeshResilienceController, backoffDelayMs, jitteredBackoffDelayMs, isIdempotentCapability, isIdempotentMeshCapability } from './resilience.ts';

test('Mesh resilience retains bounded idempotency and jitter semantics', () => {
  assert.equal(isIdempotentMeshCapability('mesh.ping'), true);
  assert.equal(isIdempotentMeshCapability('task.execute'), false);
  assert.equal(backoffDelayMs(0, { baseBackoffMs: 50, maxBackoffMs: 1000 }), 50);
  assert.equal(backoffDelayMs(5, { baseBackoffMs: 50, maxBackoffMs: 120 }), 120);
  assert.equal(jitteredBackoffDelayMs(0, { baseBackoffMs: 100, maxBackoffMs: 1000 }, 0), 100);
  assert.equal(jitteredBackoffDelayMs(0, { baseBackoffMs: 100, maxBackoffMs: 1000 }, 1), 120);
});

test('Mesh resilience opens, recovers and exposes SLIs without fake success', () => {
  const controller = new MeshResilienceController({ failureThreshold: 2, resetTimeoutMs: 1 });
  controller.begin('N07');
  controller.failure('N07','mesh.ping',new Error('network'),0,false);
  controller.begin('N07');
  controller.failure('N07','mesh.ping',new Error('network'),1,false);
  assert.equal(controller.snapshot().peers.N07.state, 'open');
  assert.equal(controller.canRequest('N07'), true);
  controller.success('N07', 10);
  const snapshot = controller.snapshot().peers.N07;
  assert.equal(snapshot.state, 'closed');
  assert.equal(snapshot.metrics.recoveryCount, 1);
  assert.ok(snapshot.metrics.totalLatencyMs >= 10);
  assert.match(controller.prometheus(), /n02_mesh_circuit_state\{target="N07"\}/);
});
