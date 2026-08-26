export const SOUL_MESH_PEERS = ['N01', 'N03', 'N04', 'N05', 'N06'] as const;
export type SoulMeshPeer = typeof SOUL_MESH_PEERS[number];
export type SoulMeshDirection = 'in' | 'out';
export type SoulMeshPeerRoute = { peer: SoulMeshPeer; direction: SoulMeshDirection; channel: string; enabled: boolean };

export const R3_PEER_ROUTES: SoulMeshPeerRoute[] = SOUL_MESH_PEERS.flatMap(peer => [
  { peer, direction: 'in' as const, channel: `N02.IN.${peer}`, enabled: true },
  { peer, direction: 'out' as const, channel: `N02.OUT.${peer}`, enabled: true },
]);

export function peerRoutes(peer: SoulMeshPeer): SoulMeshPeerRoute[] {
  return R3_PEER_ROUTES.filter(route => route.peer === peer);
}
