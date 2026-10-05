import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';

function canonicalRequest(message: Record<string, unknown>, nonce: string) {
  return JSON.stringify({
    protocol: message.protocol,
    contractVersion: message.contractVersion,
    id: message.id,
    correlationId: message.correlationId,
    source: message.source,
    target: message.target,
    kind: message.kind,
    capability: message.capability ?? '',
    payload: message.payload,
    timestamp: message.timestamp,
    transport: (message.meta as Record<string, unknown> | undefined)?.transport,
    meta: message.meta ?? null,
    nonce,
  });
}

function canonicalLegacyResponse(body: Record<string, unknown>, nonce: string) {
  return JSON.stringify({
    version: '1.0',
    contractVersion: body.contractVersion,
    messageId: body.id,
    source: body.source,
    target: body.target,
    timestamp: body.timestamp,
    nonce,
    correlationId: body.correlationId,
    type: body.kind === 'error' ? 'ERROR' : 'TASK_RESULT',
    payload: {
      capability: body.capability ?? '',
      payload: body.payload ?? {},
    },
  });
}

test('N02 peer client generates nonce/HMAC and validates correlated N01 HTTP response', async () => {
  const previousUrl = process.env.SOUL_MESH_N01_URL;
  const previousSecret = process.env.SOUL_MESH_HMAC_SECRET;
  const previousFetch = globalThis.fetch;

  const secret = 'n02-lote3-hmac-secret-2026';
  process.env.SOUL_MESH_N01_URL = 'http://n01.example.test/api/soul-mesh';
  process.env.SOUL_MESH_HMAC_SECRET = secret;

  try {
    const { requestPeerCapability } = await import('../../api/soul-mesh/peer-client.ts');

    globalThis.fetch = async (_input, init) => {
      const headers = new Headers(init?.headers);
      const request = JSON.parse(String(init?.body)) as Record<string, unknown>;
      const nonce = String(headers.get('x-soul-mesh-nonce') ?? '');
      const suppliedHmac = String(headers.get('x-soul-mesh-hmac') ?? '');

      assert.match(nonce, /^[0-9a-f]{32}$/);
      assert.equal(request.nonce, nonce);
      assert.equal((request.meta as Record<string, unknown>).nonce, nonce);
      assert.equal(headers.get('x-soul-correlation-id'), request.correlationId);

      const expectedHmac = createHmac('sha256', secret)
        .update(canonicalRequest(request, nonce), 'utf8')
        .digest('hex');
      assert.equal(suppliedHmac, expectedHmac);

      const response = {
        protocol: 'soul-mesh/1',
        contractVersion: '1.1.0',
        id: randomUUID(),
        correlationId: request.correlationId,
        source: 'N01',
        target: 'N02',
        kind: 'response',
        capability: request.capability,
        payload: { ok: true, from: 'N01' },
        timestamp: Date.now(),
        nonce: randomUUID().replaceAll('-', '').padEnd(32, '0').slice(0, 32),
      } as Record<string, unknown>;

      response.hmac = createHmac('sha256', secret)
        .update(canonicalLegacyResponse(response, String(response.nonce)), 'utf8')
        .digest('hex');

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };

    const response = await requestPeerCapability('N01', 'mesh.ping', { probe: 'n02-lote3' });
    assert.equal(response.source, 'N01');
    assert.equal(response.target, 'N02');
    assert.equal((response.payload as Record<string, unknown>).ok, true);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.SOUL_MESH_N01_URL;
    else process.env.SOUL_MESH_N01_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.SOUL_MESH_HMAC_SECRET;
    else process.env.SOUL_MESH_HMAC_SECRET = previousSecret;
  }
});
