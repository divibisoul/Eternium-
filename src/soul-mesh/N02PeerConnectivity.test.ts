import assert from 'node:assert/strict';
import test from 'node:test';
import { n02CapabilityRuntime, n02AgentRegistry } from './N02CapabilityRuntime.ts';

test('N02 binds the real authenticated N01 peer-probe capability', () => {
  assert.equal(n02CapabilityRuntime.registry.has('mesh.peer.ping'), true);
  assert.equal(n02CapabilityRuntime.has('mesh.peer.ping'), true);
  assert.ok(n02CapabilityRuntime.listExecutable().includes('mesh.peer.ping'));
  assert.ok(n02AgentRegistry.list().some(agent =>
    agent.capabilities.includes('mesh.peer.ping')
  ), 'The declared executable peer-probe capability must be assigned to a real registered N02 agent.');
});
