import { strict as assert } from 'node:assert';
import { SoulMeshRouter } from '../src/soul-mesh/SoulMeshRouter.ts';
import { SoulMeshCapabilityRegistry } from '../src/soul-mesh/SoulMeshCapabilityRegistry.ts';
import { isN02CapabilityDeclared } from '../src/soul-mesh/N02CapabilityCatalog.ts';

class MemoryTransport {
  private handler: ((message: any) => void | Promise<void>) | undefined;
  readonly sent: any[] = [];
  send(message: any): void { this.sent.push(message); }
  onMessage(handler: (message: any) => void | Promise<void>): () => void { this.handler = handler; return () => { this.handler = undefined; }; }
  respond(message: any): void { void this.handler?.(message); }
}

const transport = new MemoryTransport();
const router = new SoulMeshRouter(transport as any, 'N02', 1000);
const pending = router.request('N01', 'mesh.ping', { selftest:true });
assert.equal(transport.sent.length, 1);
const request = transport.sent[0];
transport.respond({ ...request, id:'response', kind:'response', source:'N01', target:'N02', payload:{ ok:true } });
const response = await pending;
assert.equal(response.correlationId, request.correlationId);
router.close();

const registry = new SoulMeshCapabilityRegistry();
assert.equal(registry.has('ai.generate'), true);
assert.equal(isN02CapabilityDeclared('ai.generate'), true);
assert.equal(isN02CapabilityDeclared('not-real'), false);

console.log(JSON.stringify({ ok:true, correlationPreserved:true, declaredCapabilitiesChecked:true }));
