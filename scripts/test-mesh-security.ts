import assert from 'node:assert/strict';
import {
  MAX_CLOCK_SKEW_MS,
  SOUL_MESH_CONTRACT_VERSION,
  SOUL_MESH_VERSION,
  signMeshMessage,
  verifyMeshMessage,
} from '../src/soul-mesh/SoulMeshSecurity.ts';

const secret = '0123456789abcdef0123456789abcdef';
const unsigned = {
  protocol: 'soul-mesh/1' as const,
  version: SOUL_MESH_VERSION,
  contractVersion: SOUL_MESH_CONTRACT_VERSION,
  id: 'msg-1',
  messageId: 'msg-1',
  correlationId: 'corr-1',
  source: 'N02',
  target: 'N01',
  kind: 'request' as const,
  type: 'CAPABILITY_REQUEST' as const,
  capability: 'mesh.ping',
  payload: { ok: true },
  timestamp: Date.now(),
  nonce: '0123456789abcdef',
};

const signed = { ...unsigned, hmac: await signMeshMessage(unsigned, secret) };
assert.equal(signed.hmac.length, 64);
await verifyMeshMessage(signed, secret);

const replay = new Set<string>();
await verifyMeshMessage(signed, secret, Date.now(), MAX_CLOCK_SKEW_MS, replay);
await assert.rejects(() => verifyMeshMessage(signed, secret, Date.now(), MAX_CLOCK_SKEW_MS, replay), /REPLAY_DETECTED/);

const tampered = { ...signed, payload: { ok: false } };
await assert.rejects(() => verifyMeshMessage(tampered, secret), /HMAC_INVALID/);

const stale = { ...signed, nonce: 'fedcba9876543210', timestamp: Date.now() - MAX_CLOCK_SKEW_MS - 1 };
await assert.rejects(() => verifyMeshMessage(stale, secret), /CLOCK_SKEW/);

await assert.rejects(() => verifyMeshMessage({ ...signed, hmac: 'bad' }, secret), /HMAC_FORMAT_INVALID/);

console.log('N02 Mesh security: PASS');
