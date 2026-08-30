import assert from 'node:assert/strict';
import { getCapability } from './protocol.mjs';
import { legacyResponse, normalizeLegacyRequest } from './server.mjs';

const request = {
  protocol: 'soul-mesh/1',
  id: 'legacy-1',
  correlationId: 'corr-1',
  source: 'N01',
  target: 'N02',
  kind: 'request',
  capability: 'inference.generate',
  payload: { text: 'hello' },
  timestamp: Date.now(),
};

const envelope = normalizeLegacyRequest(request, true);
assert.equal(envelope.version, '1.0');
assert.equal(envelope.source, 'N01');
assert.equal(envelope.target, 'N02');
assert.equal(envelope.correlationId, 'corr-1');
assert.equal(getCapability(envelope), 'inference.generate');

const response = legacyResponse(envelope, { ok: true });
assert.equal(response.protocol, 'soul-mesh/1');
assert.equal(response.correlationId, 'corr-1');
assert.equal(response.source, 'N02');
assert.equal(response.target, 'N01');
assert.equal(response.capability, 'inference.generate');

assert.throws(
  () => normalizeLegacyRequest(request, false),
  /LEGACY_MESH_REQUIRES_CANONICAL_SIGNED_ENVELOPE/,
);

console.log('N02 legacy/canonical Mesh compatibility contract: PASS');
