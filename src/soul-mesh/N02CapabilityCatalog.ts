import { SOUL_MESH_CAPABILITIES } from './SoulMeshCapabilities';
import { n02CapabilityRuntime } from './N02CapabilityRuntime';

/** Runtime-neutral catalog exposed to peers. Declared capabilities are metadata; executability is runtime state. */
export function getN02CapabilityCatalog() {
  return SOUL_MESH_CAPABILITIES.map((capability) => ({
    ...capability,
    owner: 'N02' as const,
    execution: 'remote-authority',
    executable: n02CapabilityRuntime.has(capability.id),
  }));
}

export function isN02CapabilityDeclared(capability: string): boolean {
  return SOUL_MESH_CAPABILITIES.some((item) => item.id === capability);
}

/** True only when the N02 runtime has a registered executable handler. */
export function canN02Handle(capability: string): boolean {
  return isN02CapabilityDeclared(capability) && n02CapabilityRuntime.has(capability);
}
