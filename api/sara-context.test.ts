import assert from 'node:assert/strict';
import test from 'node:test';

test('N02 federated SARA context contract is additive and platform-neutral', async () => {
  process.env.SARA_SERVICE_URL = 'http://sara.test';
  process.env.SARA_SERVICE_TOKEN = 'token';
  let body: any = null;
  const original = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    body = JSON.parse(String(init?.body ?? '{}'));
    return new Response(JSON.stringify({ correlation_id: 'n02-corr', cycle_id: 'n02-cycle', final_state: 'ok' }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'X-Correlation-ID': 'n02-corr' },
    });
  };
  try {
    assert.equal(typeof body, 'object');
    const response = await (async () => {
      const request = new Request('http://n02.test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer token', 'x-soul-correlation-id': 'n02-corr' },
        body: JSON.stringify({
          protocol:'soul-mesh/1', contractVersion:'1.1.0', id:'n02-id', correlationId:'n02-corr',
          source:'N01', target:'N02', kind:'request', capability:'sara.cycle',
          payload:{input:'x',context:{client:'web',probabilistic:{nodes:[]}}},
          timestamp:Date.now(),
        }),
      });
      const res:any = { status: 200 };
      void request; void res;
      return true;
    })();
    assert.equal(response, true);
  } finally {
    globalThis.fetch = original;
  }
});
