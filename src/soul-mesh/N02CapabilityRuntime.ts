import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';
import { createN02AIProviderBridge } from './N02AIProviderBridge';

/** N02 runtime: Mesh handlers are wired to the existing AI provider/service, not mocked. */
export const n02CapabilityRuntime = new SoulMeshCapabilityExecutor();

const handlers = createN02AIProviderBridge();
for (const [capability, handler] of Object.entries(handlers)) {
  if (!n02CapabilityRuntime.registry.has(capability)) {
    throw new Error(`N02_CAPABILITY_NOT_DECLARED:${capability}`);
  }
  n02CapabilityRuntime.register(capability, handler);
}

/** Runtime introspection used by Mesh discovery and diagnostics. */
export function getN02RuntimeStatus() {
  return {
    nucleus: 'N02' as const,
    declaredCapabilities: n02CapabilityRuntime.registry.getAll().map(c => c.id).sort(),
    executableCapabilities: n02CapabilityRuntime.listExecutable(),
    aiBridgeConnected: n02CapabilityRuntime.listExecutable().includes('ai.generate'),
  };
}
