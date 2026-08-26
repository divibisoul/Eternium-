import { SOUL_MESH_CAPABILITIES } from './SoulMeshCapabilities';
import { n02CapabilityRuntime } from './N02CapabilityRuntime';

/** Canonical machine-readable N02 manifest used by peer discovery. */
export function getN02MeshManifest() {
  return {
    protocol: 'soul-mesh/1' as const,
    nucleus: 'N02' as const,
    capabilities: SOUL_MESH_CAPABILITIES.map(c => ({
      id: c.id,
      version: c.version,
      owner: c.owner,
      request: c.request,
      response: c.response,
      events: c.events,
      context: c.context ?? [],
      tools: c.tools ?? [],
      executable: n02CapabilityRuntime.has(c.id),
    })),
    executableCapabilities: n02CapabilityRuntime.listExecutable(),
  };
}
