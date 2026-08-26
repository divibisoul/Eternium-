import { SOUL_MESH_CAPABILITIES } from './SoulMeshCapabilities';

/** Runtime-neutral catalog exposed to peers. Declared capabilities are metadata; executability is runtime state. */
export function getN02CapabilityCatalog() {
  return SOUL_MESH_CAPABILITIES.map((capability) => ({
    ...capability,
    owner: 'N02' as const,
    execution: 'remote-authority',
  }));
}

export function canN02Handle(capability: string): boolean {
  return SOUL_MESH_CAPABILITIES.some((item) => item.id === capability);
}
