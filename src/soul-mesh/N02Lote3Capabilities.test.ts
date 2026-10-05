import test from 'node:test';
import assert from 'node:assert/strict';
import { n02CapabilityRuntime, n02AgentRegistry } from './N02CapabilityRuntime.ts';

test('Lote 3 N02 capabilities are executable through the canonical runtime', () => {
  for (const capability of ['ai.generate', 'ai.multimodal', 'cognitive-processing']) {
    assert.equal(n02CapabilityRuntime.has(capability), true, capability + ' must be executable');
  }
});

test('Lote 3 N02 executable capabilities are attached to functional agents', () => {
  const agents = n02AgentRegistry.list();
  for (const capability of ['ai.generate', 'ai.multimodal', 'cognitive-processing']) {
    assert.equal(
      agents.some(agent => agent.capabilities.includes(capability)),
      true,
      capability + ' must have an agent boundary',
    );
  }
});
