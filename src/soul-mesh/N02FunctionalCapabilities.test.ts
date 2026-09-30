import test from 'node:test';
import assert from 'node:assert/strict';
import { getN02CapabilityCatalog, canN02Handle } from './N02CapabilityCatalog';
import { n02CapabilityRuntime, n02AgentRegistry } from './N02CapabilityRuntime';

test('NeuralForge and ASC are declared and executable through the canonical runtime', () => {
  assert.equal(canN02Handle('neural_forge'), true);
  assert.equal(canN02Handle('asc'), true);
  assert.equal(n02CapabilityRuntime.has('neural_forge'), true);
  assert.equal(n02CapabilityRuntime.has('asc'), true);
});

test('N02 capability catalog does not confuse declaration with execution', () => {
  const catalog = getN02CapabilityCatalog();
  const neuralForge = catalog.find(c => c.id === 'neural_forge');
  const asc = catalog.find(c => c.id === 'asc');
  assert.equal(neuralForge?.execution, 'executable');
  assert.equal(asc?.execution, 'executable');
});

test('expanded Gemini provider capabilities are executable in the canonical runtime', () => {
  for (const capability of [
    'gemini.text.generate',
    'gemini.multimodal.generate',
    'gemini.audio.transcribe',
    'gemini.audio.analyze',
    'gemini.speech.synthesize',
  ]) {
    assert.equal(canN02Handle(capability), true, `expected ${capability} to be executable`);
    assert.equal(n02CapabilityRuntime.has(capability), true);
  }

  const catalog = getN02CapabilityCatalog();
  for (const capability of [
    'gemini.text.generate',
    'gemini.multimodal.generate',
    'gemini.audio.transcribe',
    'gemini.audio.analyze',
    'gemini.speech.synthesize',
  ]) {
    assert.equal(catalog.find(item => item.id === capability)?.execution, 'executable');
  }
});

test('NeuralForge and ASC use dedicated agent boundaries', () => {
  const agents = n02AgentRegistry.list();
  assert.deepEqual(
    agents.find(a => a.id === 'N02.neural-modeling-agent')?.capabilities,
    ['neural_forge'],
  );
  assert.deepEqual(
    agents.find(a => a.id === 'N02.scientific-discovery-agent')?.capabilities,
    ['asc'],
  );
});
