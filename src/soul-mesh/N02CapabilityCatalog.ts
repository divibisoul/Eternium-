import { SOUL_MESH_CAPABILITIES } from './SoulMeshCapabilities';
import { n02CapabilityRuntime } from './N02CapabilityRuntime';

/**
 * Runtime-aware catalog. A declaration is metadata; executability is derived
 * from the canonical capability runtime.
 */
export function getN02CapabilityCatalog() {
  return SOUL_MESH_CAPABILITIES.map((capability) => ({
    ...capability,
    owner: 'N02' as const,
    execution: n02CapabilityRuntime.has(capability.id) ? 'executable' as const : 'declared' as const,
  }));
}

export function canN02Handle(capability: string): boolean {
  return n02CapabilityRuntime.has(capability);
}
