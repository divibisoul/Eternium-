import type { SoulNucleus } from './SoulMeshProtocol';

export const SOUL_MESH_PEER_ENDPOINTS: Record<Exclude<SoulNucleus, 'N06'>, { in: string; out: string }> = {
  N01: { in: '/soul-mesh/N01/in', out: '/soul-mesh/N01/out' },
  N02: { in: '/soul-mesh/N02/in', out: '/soul-mesh/N02/out' },
  N03: { in: '/soul-mesh/N03/in', out: '/soul-mesh/N03/out' },
  N04: { in: '/soul-mesh/N04/in', out: '/soul-mesh/N04/out' },
  N05: { in: '/soul-mesh/N05/in', out: '/soul-mesh/N05/out' },
};
