import assert from 'node:assert/strict';
import { createSecureFields, signMeshMessage, verifyMeshMessage, type SecureMeshMessage } from './SoulMeshSecurity.ts';

const secret = 'forensic-test-secret-32-bytes-minimum';
const secure = createSecureFields();
const base: Omit<SecureMeshMessage, 'hmac'> = {
  protocol: 'soul-mesh/1',
  version: secure.version,
  contractVersion: secure.contractVersion,
  id: 'msg-1',
  messageId: secure.messageId,
  correlationId: 'corr-1',
  source: 'N01',
  target: 'N02',
  kind: 'request',
  type: 'TASK',
  capability: 'ai.generate',
  payload: { text: 'hello' },
  timestamp: Date.now(),
  nonce: secure.nonce,
};

const signed: SecureMeshMessage = { ...base, hmac: signMeshMessage(base, secret) };
verifyMeshMessage(signed, secret);

for (const mutate of [
  { ...signed, capability: 'ai.multimodal' },
  { ...signed, kind: 'event' as const },
  { ...signed, payload: { text: 'tampered' } },
]) {
  assert.throws(() => verifyMeshMessage(mutate, secret), /SOUL_MESH_HMAC_INVALID/);
}

const replaySeen = new Set<string>();
verifyMeshMessage(signed, secret, Date.now(), 30_000, replaySeen);
assert.throws(() => verifyMeshMessage(signed, secret, Date.now(), 30_000, replaySeen), /SOUL_MESH_REPLAY_DETECTED/);
assert.throws(() => verifyMeshMessage({ ...signed, timestamp: Date.now() - 60_000 }, secret), /SOUL_MESH_CLOCK_SKEW/);

console.log('N02 SoulMeshSecurity invariants: PASS');
