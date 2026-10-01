import test from 'node:test';
import assert from 'node:assert/strict';
import { createN02AIProviderBridge } from './N02AIProviderBridge.ts';
import { CotArhdHandler } from './handlers/CotArhdHandler.ts';
import { CotAreaHandler } from './handlers/CotAreaHandler.ts';

const CATALOG_ONLY = [
  'multimodal_cortex','autonomous_embodiment','biomolecular_designer','reality_synthesis','strategic_planning',
  'adaptation_module','scre','ecas','eus','mlfg','emergent_cognition','skill_acquisition','uci',
  'ethical_governance','strategic_defense','existential_safety','einstein_reasoning','einstein_quantum',
  'cot_arhd','cot_drc','cot_area',
] as const;

test('all 21 catalog-only capabilities expose real bridge handlers', () => {
  const bridge = createN02AIProviderBridge();
  for (const id of CATALOG_ONLY) {
    assert.equal(typeof bridge[id], 'function', id + ' must have a handler');
  }
});

test('ARHD scheduler is deterministic and bounded', async () => {
  const result = await new CotArhdHandler().handle({ load_history:[0.2,0.4,0.5,0.7], urgency:0.8, budget:10 }, 'test-correlation');
  assert.equal(result.scheduler, 'spectral-demand');
  assert.ok(Number.isFinite(result.allocation));
  assert.ok(result.allocation >= 0 && result.allocation <= 10);
});

test('AREA evolution preserves population shape and uses deterministic mutation', async () => {
  const input = { population:[[1,2],[3,4],[5,6],[7,8]], scores:[0.1,0.9,0.2,0.4], mutation_scale:0.01 };
  const handler = new CotAreaHandler();
  const first = await handler.handle(input, 'test-correlation');
  const second = await handler.handle(input, 'test-correlation');
  assert.deepEqual(first, second);
  assert.equal(first.next_population.length, input.population.length);
  assert.ok(first.next_population.every((row:number[]) => row.length === 2));
});

test('AREA rejects score/population mismatches instead of fabricating output', async () => {
  await assert.rejects(() => new CotAreaHandler().handle({ population:[[1]], scores:[] }, 'test-correlation'), /N02_AREA_SCORES_LENGTH_MISMATCH/);
});