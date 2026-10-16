import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './soul-mesh.ts';

function invoke(body: unknown) {
  process.env.NODE_ENV = 'test';
  const req: any = { method: 'POST', headers: {}, body };
  let statusCode = 200;
  let payload: any;
  const res: any = {
    status(code: number) { statusCode = code; return this; },
    json(value: unknown) { payload = value; return this; },
  };
  return Promise.resolve(handler(req, res)).then(() => ({ status: statusCode, payload }));
}

test('OctaCore N02 boundary executes the canonical Mesh ping kernel', async () => {
  const result = await invoke({
    protocol: 'soul-mesh/1', contractVersion: '1.1.0', id: 'g2-n02-001', correlationId: 'g2-n02-c1',
    source: 'N07', target: 'N02', kind: 'request', capability: 'octacore.execute',
    payload: { capability: 'mesh.ping', payload: { certification: true }, job_id: 'g2-job-001' }, timestamp: Date.now(),
  });
  assert.equal(result.status, 200);
  assert.equal(result.payload.correlationId, 'g2-n02-c1');
  assert.equal(result.payload.payload.kernel, 'G2');
  assert.equal(result.payload.payload.value.ok, true);
});

test('OctaCore N02 boundary rejects non-executable inner capability', async () => {
  const result = await invoke({
    protocol: 'soul-mesh/1', contractVersion: '1.1.0', id: 'g2-n02-002', correlationId: 'g2-n02-c2',
    source: 'N07', target: 'N02', kind: 'request', capability: 'octacore.execute',
    payload: { capability: 'does.not.exist' }, timestamp: Date.now(),
  });
  assert.equal(result.status, 501);
  assert.equal(result.payload.payload.code, 'OCTACORE_N02_CAPABILITY_NOT_EXECUTABLE');
});


test('N02 exposes the restored read-only SARA Clareira audit capability', async () => {
  const source = await readFile(new URL('./soul-mesh.ts', import.meta.url), 'utf8');
  assert.match(source, /sara\.clareira\.audit/);
  assert.match(source, /\/v1\/clareira\/audit/);
});
