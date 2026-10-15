import assert from 'node:assert/strict';
import {
  NUCLEUS_ID,
  SOUL_MESH_PROTOCOL,
  SOUL_MESH_CONTRACT_VERSION,
  validateMeshMessage,
  handleMeshMessage,
  type SoulMeshMessage,
} from './endpoint';

const now = Date.now();
const request: SoulMeshMessage = {
  protocol: SOUL_MESH_PROTOCOL,
  contractVersion: SOUL_MESH_CONTRACT_VERSION,
  id: 'n02-adapter-request-1',
  correlationId: 'n02-adapter-correlation-1',
  source: 'N01',
  target: 'N02',
  kind: 'request',
  capability: 'test.echo',
  payload: { value: 'mesh-contract-proof' },
  timestamp: now,
};

assert.equal(NUCLEUS_ID, 'N02', 'legacy adapter must identify the N02 nucleus');
assert.equal(validateMeshMessage(request), true, 'canonical numeric-timestamp message should validate');

assert.throws(
  () => validateMeshMessage({ ...request, contractVersion: undefined }),
  /INVALID_CONTRACT_VERSION/,
  'unversioned messages must fail closed',
);
assert.throws(
  () => validateMeshMessage({ ...request, target: 'N06' }),
  /WRONG_TARGET/,
  'the N02 endpoint must reject a message addressed to another nucleus',
);
assert.throws(
  () => validateMeshMessage({ ...request, kind: 'ack' }),
  /UNSUPPORTED_MESH_KIND/,
  'legacy-only ACK kind must not bypass canonical Mesh 1.1',
);

const legacyTimestamp = new Date(Date.now()).toISOString();
const legacyRequest: SoulMeshMessage = { ...request, timestamp: legacyTimestamp };
assert.equal(validateMeshMessage(legacyRequest), true, 'explicitly versioned ISO timestamp must adapt');

const response = await handleMeshMessage(legacyRequest, {
  'test.echo': async (payload) => ({ echo: payload }),
});
assert.equal(response.kind, 'response');
assert.equal(response.source, 'N02');
assert.equal(response.target, 'N01');
assert.equal(response.timestamp, legacyTimestamp, 'legacy timestamp representation should be preserved at the boundary');
assert.deepEqual(response.payload, { echo: request.payload });

console.log('N02 legacy Mesh adapter conformance: PASS');
