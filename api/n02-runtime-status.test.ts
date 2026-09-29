import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './n02-runtime-status';

test('N02 runtime status endpoint exposes measured executor state', () => {
  let code = 0;
  let body: any = null;
  const res: any = {
    status(value: number) { code = value; return this; },
    json(value: unknown) { body = value; return this; },
  };

  handler({ method: 'GET' } as any, res);

  assert.equal(code, 200);
  assert.equal(body.nucleus, 'N02');
  assert.ok(Array.isArray(body.executableCapabilities));
  assert.ok(body.executableCapabilities.includes('neural_forge'));
  assert.ok(body.executableCapabilities.includes('asc'));
  assert.ok(Array.isArray(body.agents));
  assert.equal(body.source, 'N02-runtime-status-endpoint');
});

test('N02 runtime status endpoint rejects non-GET requests', () => {
  let code = 0;
  const res: any = { status(value: number) { code = value; return this; }, json() { return this; } };
  handler({ method: 'POST' } as any, res);
  assert.equal(code, 405);
});
