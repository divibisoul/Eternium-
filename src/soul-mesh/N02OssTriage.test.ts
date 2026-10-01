import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const triage = JSON.parse(fs.readFileSync('docs/N02-OSS-TRIAGE-ROUTING.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('docs/N02-OSS-TRIAGE-ROUTING.json', 'utf8'));

test('every triaged capability has exactly one primary downstream and valid state', () => {
  assert.equal(triage.mappings.length, 21);
  const ids = triage.mappings.map((entry: string[]) => entry[0]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [id, primary, coNuclei, state] of triage.mappings as string[][]) {
    assert.ok(id);
    assert.match(primary, /^(N01|N02|N03|N04|N05|N06|N07|SARA)$/);
    assert.ok(coNuclei.split(',').every(value => /^(N01|N02|N03|N04|N05|N06|N07|SARA)$/.test(value)));
    assert.equal(state, 'TRIAGED');
  }
});

test('every resolved upstream is assigned to a downstream nucleus', () => {
  const expected = [
    'brain-system','GENesis-AGI','nanobot','syntra_kernel','crewAI','PraisonAI',
    'hermes-agent','agent-framework','SuperAGI','HASHIRU','Codette-Reasoning','chyren-selin','xun-agent'
  ];
  for (const source of expected) {
    assert.ok(triage.upstreams[source], source);
  }
  assert.deepEqual(triage.unresolved, []);
});
