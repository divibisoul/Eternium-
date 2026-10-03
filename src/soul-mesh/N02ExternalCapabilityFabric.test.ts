import assert from 'node:assert/strict';
import test from 'node:test';
import {N02_EXTERNAL_PROVIDERS,describeN02ExternalCapabilityFabric,providersByFunction,resolveN02ExternalProvider} from './N02ExternalCapabilityFabric';

test('N02 fabric contains 25 upstreams with deterministic provenance',()=>{
 const fabric=describeN02ExternalCapabilityFabric();assert.equal(fabric.providerCount,25);
 assert.equal(resolveN02ExternalProvider('vllm').revision,'7dfe3338d5f15dd3ccb233326aa65fde46e427ad');
 assert.equal(resolveN02ExternalProvider('agentscope').n02Functions.includes('multimodal_cortex'),true);
 assert.equal(resolveN02ExternalProvider('ray').canonicalOwner,'N07');
 assert.equal(resolveN02ExternalProvider('metagpt').canonicalOwner,'N06');
 assert.equal(N02_EXTERNAL_PROVIDERS.length,25);
});
test('function affinity is queryable without claiming provider execution',()=>{
 assert.ok(providersByFunction('ai.generate').some(p=>p.id==='vllm'));
 assert.ok(providersByFunction('multimodal_cortex').some(p=>p.id==='agentscope'));
});
test('unknown upstream fails closed',()=>assert.throws(()=>resolveN02ExternalProvider('unknown'),/N02_EXTERNAL_PROVIDER_UNKNOWN/));
