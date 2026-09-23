import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './soul-mesh';

function invoke(body: unknown) {
  process.env.NODE_ENV = 'test';
  const req: any = { method: 'POST', headers: {} , body };
  let statusCode = 200;
  let payload: any;
  const res: any = {
    status(code: number) { statusCode = code; return this; },
    json(value: unknown) { payload = value; return this; },
  };
  handler(req, res);
  return new Promise<{status: number; payload: any}>((resolve) => {
    queueMicrotask(() => resolve({ status: statusCode, payload }));
  });
}

test('G2 Octacore wrapper executes the canonical Mesh ping kernel', async () => {
  const correlationId = 'g2-octa-cert-001';
  const result = await invoke({
    protocol: 'soul-mesh/1',
    contractVersion: '1.1.0',
    id: 'g2-msg-001',
    correlationId,
    source: 'N07',
    target: 'N02',
    kind: 'request',
    capability: 'octacore.execute',
    payload: {
      capability: 'mesh.ping',
      payload: { certification: true },
      job_id: 'g2-job-001',
    },
    timestamp: Date.now(),
  });
  assert.equal(result.status, 200);
  assert.equal(result.payload.correlationId, correlationId);
  assert.equal(result.payload.payload.kernel, 'G2');
  assert.equal(result.payload.payload.value.ok, true);
});

test('G2 Octacore wrapper rejects undeclared execution deterministically', async () => {
  const result = await invoke({
    protocol: 'soul-mesh/1',
    contractVersion: '1.1.0',
    id: 'g2-msg-002',
    correlationId: 'g2-octa-cert-002',
    source: 'N07',
    target: 'N02',
    kind: 'request',
    capability: 'octacore.execute',
    payload: {
      capability: 'nonexistent.capability',
      payload: {},
    },
    timestamp: Date.now(),
  });
  assert.equal(result.status, 501);
  assert.equal(result.payload.payload.code, 'OCTACORE_N02_CAPABILITY_NOT_EXECUTABLE');
});
