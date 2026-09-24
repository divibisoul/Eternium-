import assert from 'node:assert/strict';
import test from 'node:test';
import { SoulMeshMemoryTransport } from './SoulMeshMemoryTransport.ts';
import { SoulMeshMultiplexTransport } from './SoulMeshMultiplexTransport.ts';
import { N02DelegationCoordinator } from './N02DelegationCoordinator.ts';
import { executeSoulTask, registerSoulTaskExecutor } from '../../services/soulMeshAdapter.ts';

const message = {
  protocol: 'soul-mesh/1',
  contractVersion: '1.1.0',
  id: 'test-message',
  correlationId: 'test-correlation',
  source: 'N02',
  target: 'N07',
  kind: 'request',
  capability: 'mesh.ping',
  payload: {},
  timestamp: Date.now(),
};

test('N02 multiplex transport does not duplicate a successful request', async () => {
  let firstCalls = 0;
  let secondCalls = 0;
  const first = {
    send: async () => { firstCalls += 1; },
    onMessage: () => () => undefined,
  };
  const second = {
    send: async () => { secondCalls += 1; },
    onMessage: () => () => undefined,
  };

  const transport = new SoulMeshMultiplexTransport([first, second]);
  await transport.send(message as never);

  assert.equal(firstCalls, 1);
  assert.equal(secondCalls, 0);
});

test('N02 multiplex transport falls back only after the first transport fails', async () => {
  let secondCalls = 0;
  const first = {
    send: async () => { throw new Error('first failed'); },
    onMessage: () => () => undefined,
  };
  const second = {
    send: async () => { secondCalls += 1; },
    onMessage: () => () => undefined,
  };

  const transport = new SoulMeshMultiplexTransport([first, second]);
  await transport.send(message as never);
  assert.equal(secondCalls, 1);
});

test('N02 memory transport waits for handler execution', async () => {
  let executed = false;
  const transport = new SoulMeshMemoryTransport();
  transport.onMessage(async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    executed = true;
  });

  await transport.send(message as never);
  assert.equal(executed, true);
});

test('N02 Soul task adapter fails closed until a real executor is registered', async () => {
  registerSoulTaskExecutor(null);
  const unavailable = await executeSoulTask({
    capability: 'reasoning',
    input: 'test',
  });
  assert.equal(unavailable.success, false);
  assert.equal(unavailable.error?.code, 'EXECUTOR_NOT_CONNECTED');

  registerSoulTaskExecutor(async task => ({
    capability: task.capability,
    executed: true,
  }));
  const executed = await executeSoulTask({
    capability: 'reasoning',
    input: 'test',
  });
  assert.deepEqual(executed, {
    success: true,
    output: { capability: 'reasoning', executed: true },
  });
  registerSoulTaskExecutor(null);
});

test('N02 default delegation peer set includes N07', () => {
  const coordinator = new N02DelegationCoordinator();
  const peers = (coordinator as unknown as { peers: readonly string[] }).peers;
  assert.deepEqual(peers, ['N01', 'N03', 'N04', 'N05', 'N06', 'N07']);
});
