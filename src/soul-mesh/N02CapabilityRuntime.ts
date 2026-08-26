import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';
import { createN02AIProviderBridge } from './N02AIProviderBridge';

/** N02 runtime: Mesh handlers are wired to the existing AI provider/service, not mocked. */
export const n02CapabilityRuntime = new SoulMeshCapabilityExecutor();

for (const [capability, handler] of Object.entries(createN02AIProviderBridge())) {
  if (n02CapabilityRuntime.registry.has(capability)) {
    n02CapabilityRuntime.register(capability, handler);
  }
}
