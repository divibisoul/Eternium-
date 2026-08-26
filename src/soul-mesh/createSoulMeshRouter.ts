import type { SoulNucleus } from './SoulMeshProtocol';
import { SoulMeshRouter } from './SoulMeshRouter';
import { SoulMeshPeerTransport } from './SoulMeshPeerTransport';

export function createSoulMeshRouter(local: SoulNucleus): SoulMeshRouter {
  const env = (globalThis as any).process?.env ?? {};
  const endpoints: Partial<Record<SoulNucleus, string>> = {
    N01: env.SOUL_MESH_N01_URL,
    N02: env.SOUL_MESH_N02_URL,
    N03: env.SOUL_MESH_N03_URL,
    N04: env.SOUL_MESH_N04_URL,
    N05: env.SOUL_MESH_N05_URL,
    N06: env.SOUL_MESH_N06_URL,
  };
  return new SoulMeshRouter(new SoulMeshPeerTransport(endpoints), local);
}
