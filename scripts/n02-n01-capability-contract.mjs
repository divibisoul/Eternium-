import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const n01Workdir = process.env.SOUL_N01_WORKDIR;
if (!n01Workdir) throw new Error('SOUL_N01_WORKDIR is required for the cross-repository owner contract.');

const n02ManifestPath = resolve(process.cwd(), 'src/soul-mesh/SoulMeshCapabilities.ts');
const manifestSource = await readFile(n02ManifestPath, 'utf8');
const declared = [...manifestSource.matchAll(/\bid:\s*'([^']+)'[^}]*owner:\s*'N02'/g)].map(match => match[1]);
if (declared.length < 40) throw new Error('N02 capability manifest parse is incomplete: found ' + declared.length);

const n01PrefrontalAgentPath = resolve(n01Workdir, 'src/soul-fusion/N01PrefrontalAgent.ts');
const n01RuntimePath = resolve(n01Workdir, 'src/core/mesh/SoulMeshRuntime.ts');
const [n01PrefrontalAgentSource, n01RuntimeSource] = await Promise.all([
  readFile(n01PrefrontalAgentPath, 'utf8'),
  readFile(n01RuntimePath, 'utf8'),
]);
const n01PrefrontalCapability = 'neural.prefrontal.optimize@1.0.0';
assert.ok(n01PrefrontalAgentSource.includes('N01.neocortex-prefrontal-optimizer'),
  'Pinned N01 source must contain the native prefrontal optimizer.');
assert.ok(n01PrefrontalAgentSource.includes(n01PrefrontalCapability),
  'Pinned N01 source must declare the prefrontal capability.');
assert.ok(n01RuntimeSource.includes('agents.register(createN01PrefrontalOptimizerAgent())'),
  'Pinned N01 runtime must register the prefrontal agent in the native registry.');
assert.ok(n01RuntimeSource.includes('router.onRequest(N01_PREFRONTAL_OPTIMIZE_CAPABILITY, prefrontalAgentHandler)'),
  'Pinned N01 runtime must expose the prefrontal capability through canonical Mesh.');

// The current pinned N01 no longer ships scripts/soul-mesh-routing.mjs.
// Exercise the resolver function from the canonical N01 runtime itself, rather
// than copying its ownership logic into N02 or importing a removed file.
const n01ServerPath = resolve(n01Workdir, 'scripts/soul-mesh-server.mjs');
const n01ServerSource = await readFile(n01ServerPath, 'utf8');
const resolverMatch = n01ServerSource.match(/function resolveOwner\(capability\)\s*\{([\s\S]*?)\}\s*function resolveCapability\(/);
assert.ok(resolverMatch, 'Pinned N01 canonical runtime must expose its active resolveOwner(capability) implementation.');

const peers = new Map([
  ['N02', { id: 'N02', capabilities: declared }],
  ['N03', { id: 'N03', capabilities: [] }],
  ['N04', { id: 'N04', capabilities: [] }],
  ['N05', { id: 'N05', capabilities: [] }],
  ['N06', { id: 'N06', capabilities: [] }],
  ['N07', { id: 'N07', capabilities: [] }],
]);
const resolveCapabilityOwner = new Function(
  'peers',
  'return function resolveCapabilityOwner(capability) {' + resolverMatch[1] + '}',
)(peers);

const mismatches = [];
for (const capability of declared) {
  const expected = capability.startsWith('clareira.') ? 'N01' : 'N02';
  const actual = resolveCapabilityOwner(capability, peers);
  if (actual !== expected) mismatches.push({ capability, expected, actual });
}

const { n02CapabilityRuntime } = await import('../src/soul-mesh/N02CapabilityRuntime.ts');
const executable = n02CapabilityRuntime.listExecutable();
const unroutableExecutable = executable.filter(capability => {
  const expected = capability.startsWith('clareira.') ? 'N01' : 'N02';
  return resolveCapabilityOwner(capability, peers) !== expected;
});

assert.deepEqual(mismatches, [], 'Every declared N02 capability must route to its owner (Clareira remains N01-owned).');
assert.deepEqual(unroutableExecutable, [], 'Every executable N02 capability must be reachable through the canonical N01 routing table.');

console.log(JSON.stringify({
  system: 'SOUL',
  stage: 'N01_N02_CAPABILITY_OWNER_CONTRACT',
  status: 'PASS',
  n02DeclaredCapabilities: declared.length,
  n02ExecutableCapabilities: executable.length,
  n01RoutedClareiraBoundary: declared.filter(capability => capability.startsWith('clareira.')).length,
  n02RoutedCapabilities: declared.filter(capability => !capability.startsWith('clareira.')).length,
  dynamicPeerAdvertisementRequired: true,
  checkedAt: new Date().toISOString(),
}, null, 2));
