import assert from 'node:assert/strict';
import { SOUL_MESH_CAPABILITIES } from '../src/soul-mesh/SoulMeshCapabilities.ts';

const runtimeCapabilities = new Set([
  'gemini-inference', 'reasoning', 'planning', 'multimodal-analysis', 'cognitive.process',
  'mpvs', 'multimodal_cortex', 'eus', 'ecas', 'asc', 'einstein_reasoning', 'einstein_code',
  'einstein_quantum', 'neural_forge', 'csae', 'dcrs', 'adaptation_module', 'scre', 'mlfg',
  'cot_arhd', 'cot_drc', 'cot_area', 'emergent_cognition', 'ethical_governance',
  'biomolecular_designer', 'strategic_planning', 'existential_safety', 'skill_acquisition',
  'reality_synthesis',
]);

const cognitive = SOUL_MESH_CAPABILITIES.filter(capability => capability.execution === 'cognitive-runtime');
assert.equal(cognitive.length, runtimeCapabilities.size, 'declared cognitive capability count must match runtime registry');
for (const capability of cognitive) assert.equal(runtimeCapabilities.has(capability.id), true, `missing runtime handler: ${capability.id}`);

const ids = SOUL_MESH_CAPABILITIES.map(capability => capability.id);
assert.equal(new Set(ids).size, ids.length, 'duplicate capability id detected');
for (const capability of SOUL_MESH_CAPABILITIES) {
  assert.equal(capability.request, true, `${capability.id} must accept requests`);
  assert.equal(capability.response, true, `${capability.id} must return responses`);
}

console.log(`N02 capabilities: ${SOUL_MESH_CAPABILITIES.length} declared, ${cognitive.length} cognitive, completeness PASS`);
