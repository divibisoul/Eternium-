import { SOUL_MESH_CAPABILITIES } from './SoulMeshCapabilities';

/** Canonical machine-readable N02 manifest used by peer discovery. */
export function getN02MeshManifest(executableCapabilities: string[] = []) {
  const executable = new Set(executableCapabilities);
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
      executable: executable.has(c.id),
    })),
    executableCapabilities: [...executable].sort(),
  };
}
