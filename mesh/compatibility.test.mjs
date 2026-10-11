import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLegacyRequest, legacyResponse } from './compatibility.mjs';

const legacy = {
  protocol: 'soul-mesh/1',
  id: 'legacy-message',
  source: 'N01',
  correlationId: 'correlation-legacy',
  timestamp: Date.now(),
  kind: 'request',
  capability: 'mesh.ping',
  payload: { probe: true },
};

test('legacy unsigned Mesh translation is blocked by default', () => {
  assert.throws(() => normalizeLegacyRequest(legacy), /LEGACY_MESH_REQUIRES_CANONICAL_SIGNED_ENVELOPE/);
});

test('explicit legacy translation marks reauthentication as mandatory and preserves correlation', () => {
  const normalized = normalizeLegacyRequest(legacy, true);
  assert.equal(normalized.correlationId, legacy.correlationId);
  assert.equal(normalized.source, 'N01');
  assert.equal(normalized.target, 'N02');
  assert.equal(normalized.legacyUnsigned, true);
  assert.equal(normalized.requiresReauthentication, true);
  assert.equal(normalized.hmac, undefined);
});

test('legacy response preserves correlation and capability without claiming authentication', () => {
  const response = legacyResponse(legacy, { ok: true });
  assert.equal(response.correlationId, legacy.correlationId);
  assert.equal(response.capability, 'mesh.ping');
  assert.equal(response.hmac, undefined);
});
