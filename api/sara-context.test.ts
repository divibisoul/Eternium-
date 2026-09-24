import assert from 'node:assert/strict';
import test from 'node:test';

test('N02 forwards the complete federated SARA context to the real route', async () => {
  process.env.NODE_ENV = 'test';
  process.env.SARA_SERVICE_URL = 'http://sara.test';
  process.env.SARA_SERVICE_TOKEN = 'token';
  const original = globalThis.fetch;
  let saraBody: any = null;
  globalThis.fetch = async (_input, init) => {
    saraBody = JSON.parse(String(init?.body ?? '{}'));
    return new Response(JSON.stringify({
      cycle_id: 'n02-cycle',
      final_state: 'validated',
      correlation_id: 'n02-corr',
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'X-Correlation-ID': 'n02-corr' },
    });
  };

  try {
    const { default: handler } = await import('./soul-mesh');
    let responseBody: any = null;
    let statusCode = 0;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: any) {
        responseBody = body;
        return body;
      },
    };

    await handler({
      method: 'POST',
      headers: {
        'x-soul-correlation-id': 'n02-corr',
      },
      body: {
        protocol: 'soul-mesh/1',
        contractVersion: '1.1.0',
        id: 'n02-message',
        correlationId: 'n02-corr',
        source: 'N01',
        target: 'N02',
        kind: 'request',
        capability: 'sara.cycle',
        payload: {
          input: 'validar contexto',
          cycle_id: 'n02-cycle',
          context: {
            session_id: 'n02-session',
            client: 'web',
            probabilistic: { nodes: [] },
          },
        },
        timestamp: Date.now(),
      },
    }, res);

    assert.equal(statusCode, 200);
    assert.equal(saraBody.context.client, 'web');
    assert.deepEqual(saraBody.context.probabilistic.nodes, []);
    assert.equal(responseBody.payload.cycle_id, 'n02-cycle');
  } finally {
    globalThis.fetch = original;
  }
});
