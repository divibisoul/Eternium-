import test from 'node:test';
import assert from 'node:assert/strict';

test('N02 peer client preserves an explicit correlationId on delegated requests', async () => {
  const previousUrl = process.env.SOUL_MESH_N07_URL;
  const previousSecret = process.env.SOUL_MESH_HMAC_SECRET;
  const previousFetch = globalThis.fetch;

  process.env.SOUL_MESH_N07_URL = 'http://n07.test';
  delete process.env.SOUL_MESH_HMAC_SECRET;

  let outbound: any;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    outbound = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      protocol: 'soul-mesh/1',
      contractVersion: '1.1.0',
      id: 'n07-response',
      correlationId: outbound.correlationId,
      source: 'N07',
      target: 'N02',
      kind: 'response',
      capability: outbound.capability,
      payload: { status: 'ok' },
      timestamp: Date.now(),
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  try {
    const { requestPeerCapability } = await import('./peer-client.ts');
    const result = await requestPeerCapability(
      'N07',
      'prefrontal.orbital.evaluate@1.0.0',
      { workloads_json: '[{"id":"w1"}]' },
      1000,
      0,
      'corr-n02-orbit-001',
    );

    assert.equal(outbound.correlationId, 'corr-n02-orbit-001');
    assert.equal(outbound.meta.traceId, 'corr-n02-orbit-001');
    assert.equal(outbound.source, 'N02');
    assert.equal(outbound.target, 'N07');
    assert.equal(result.correlationId, 'corr-n02-orbit-001');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SOUL_MESH_N07_URL;
    else process.env.SOUL_MESH_N07_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.SOUL_MESH_HMAC_SECRET;
    else process.env.SOUL_MESH_HMAC_SECRET = previousSecret;
  }
});
