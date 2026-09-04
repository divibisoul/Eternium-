import assert from 'node:assert/strict';
import {
  normalizeSoulMeshWireMessage,
  SOUL_MESH_CONTRACT_VERSION,
  SOUL_MESH_PROTOCOL,
} from '../src/soul-mesh/SoulMeshWireContract.ts';
import {
  signMeshMessage,
  verifyMeshMessage,
  SOUL_MESH_VERSION,
} from '../src/soul-mesh/SoulMeshSecurity.ts';

const secret = '0123456789abcdef0123456789abcdef';
const now = Date.now();
const messageId = 'n01-msg-1';
const nonce = '0123456789abcdef';
const envelope = {
  protocol: SOUL_MESH_PROTOCOL,
  version: SOUL_MESH_VERSION,
  contractVersion: SOUL_MESH_CONTRACT_VERSION,
  messageId,
  source: 'N01' as const,
  target: 'N02' as const,
  timestamp: now,
  nonce,
  correlationId: 'n01-n02-compat',
  type: 'TASK' as const,
  payload: { capabilityId: 'reasoning', prompt: 'compatibility probe' },
};

const signed = {
  ...envelope,
  hmac: await signMeshMessage({ ...envelope, id: messageId }, secret),
};

const normalized = normalizeSoulMeshWireMessage(signed);
assert.equal(normalized.id, messageId);
assert.equal(normalized.messageId, messageId);
assert.equal(normalized.kind, 'request');
assert.equal(normalized.capability, 'reasoning');
assert.equal(normalized.type, 'TASK');
assert.deepEqual(normalized.payload, envelope.payload);
await verifyMeshMessage(signed as never, secret, now);

const pingUnsigned = {
  ...envelope,
  messageId: 'n01-ping-1',
  id: 'n01-ping-1',
  correlationId: 'ping-compat',
  type: 'PING' as const,
  payload: { probe: 'N01' },
  nonce: 'fedcba9876543210',
};
const ping = normalizeSoulMeshWireMessage({ ...pingUnsigned, hmac: await signMeshMessage(pingUnsigned, secret) });
assert.equal(ping.capability, 'mesh.ping');
assert.equal(ping.kind, 'request');
await verifyMeshMessage({ ...pingUnsigned, hmac: await signMeshMessage(pingUnsigned, secret) } as never, secret, now);

console.log('N01↔N02 envelope compatibility: PASS');
