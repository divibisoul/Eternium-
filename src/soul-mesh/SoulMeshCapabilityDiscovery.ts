import type { SoulNucleus } from './SoulMeshProtocol';
import { n02CapabilityRuntime, getN02RuntimeStatus } from './N02CapabilityRuntime';

export interface SoulMeshCapabilityDescriptor {
  id: string;
  version: '1.0';
  owner: SoulNucleus;
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

/** Local capability view used by Mesh discovery; it does not create another transport/API. */
export function getN02Capabilities(): SoulMeshCapabilityDescriptor[] {
  const status = getN02RuntimeStatus();
  return status.declaredCapabilities.map(id => ({
    id,
    version: '1.0',
    owner: 'N02' as const,
    status: n02CapabilityRuntime.registry.has(id) ? 'AVAILABLE' : 'UNAVAILABLE',
  }));
}
