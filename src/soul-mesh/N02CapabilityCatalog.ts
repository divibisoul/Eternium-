import { SOUL_MESH_CAPABILITIES } from './SoulMeshCapabilities';
import { n02CapabilityRuntime } from './N02CapabilityRuntime';

/**
 * Runtime-neutral catalog exposed to peers.
 * Declared capabilities are metadata; executability is determined by the
 * live N02 runtime so discovery never advertises an unavailable handler.
 */
export function getN02CapabilityCatalog() {
  const executable = new Set(n02CapabilityRuntime.listExecutable());
  return SOUL_MESH_CAPABILITIES.map((capability) => ({
    ...capability,
    owner: 'N02' as const,
    execution: executable.has(capability.id) ? 'local-executable' : 'declared-unavailable',
  }));
}

export function canN02Handle(capability: string): boolean {
  return n02CapabilityRuntime.has(capability);
}
