import type { SoulNucleus } from './SoulMeshProtocol';
import { SoulMeshRouter } from './SoulMeshRouter';
import { SoulMeshPeerTransport } from './SoulMeshPeerTransport';
import { SoulMeshSupabaseTransport } from './SoulMeshSupabaseTransport';

export function createSoulMeshRouter(local: SoulNucleus): SoulMeshRouter {
  const transport = new SoulMeshSupabaseTransport();
  return new SoulMeshRouter(new SoulMeshPeerTransport(transport, local), local);
}
