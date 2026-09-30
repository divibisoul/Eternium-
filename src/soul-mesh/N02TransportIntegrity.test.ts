import test from 'node:test';
import assert from 'node:assert/strict';
import { SoulMeshMemoryTransport } from './SoulMeshMemoryTransport.ts';
import { SoulMeshMultiplexTransport } from './SoulMeshMultiplexTransport.ts';

const message = {
  protocol: 'soul-mesh/1',
  contractVersion: '1.1.0',
  id: 'n02-transport-test',
  correlationId: 'n02-transport-correlation',
  source: 'N02',
  target: 'N07',
  kind: 'request',
  capability: 'mesh.ping',
  payload: {},
  timestamp: Date.now(),
} as any;

test('N02 memory transport awaits async handler completion', async () => {
  const transport = new SoulMeshMemoryTransport();
  let completed = false;

  transport.onMessage(async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    completed = true;
  });

  await transport.send(message);
  assert.equal(completed, true);
});

test('N02 memory transport propagates handler failure', async () => {
  const transport = new SoulMeshMemoryTransport();
  transport.onMessage(async () => {
    throw new Error('handler-failed');
  });

  await assert.rejects(() => transport.send(message), /handler-failed/);
});

test('N02 multiplex transport stops after the first successful transport', async () => {
  let firstCalls = 0;
  let secondCalls = 0;

  const first = {
    send: async () => { firstCalls += 1; },
    onMessage: () => () => undefined,
  } as any;
  const second = {
    send: async () => { secondCalls += 1; },
    onMessage: () => () => undefined,
  } as any;

  const transport = new SoulMeshMultiplexTransport([first, second]);
  await transport.send(message);

  assert.equal(firstCalls, 1);
  assert.equal(secondCalls, 0);
});

test('N02 multiplex transport uses later transports only after failure', async () => {
  let secondCalls = 0;

  const first = {
    send: async () => { throw new Error('first-failed'); },
    onMessage: () => () => undefined,
  } as any;
  const second = {
    send: async () => { secondCalls += 1; },
    onMessage: () => () => undefined,
  } as any;

  const transport = new SoulMeshMultiplexTransport([first, second]);
  await transport.send(message);

  assert.equal(secondCalls, 1);
});

test('N02 multiplex transport fails when every transport fails', async () => {
  const first = {
    send: async () => { throw new Error('first-failed'); },
    onMessage: () => () => undefined,
  } as any;
  const second = {
    send: async () => { throw new Error('second-failed'); },
    onMessage: () => () => undefined,
  } as any;

  const transport = new SoulMeshMultiplexTransport([first, second]);
  await assert.rejects(() => transport.send(message), /Soul Mesh all transports failed/);
});
