export const SOUL_MESH_PEER_ENDPOINTS = {
  N01: { in: '/api/soul-mesh', out: '/api/soul-mesh' },
  N03: { in: '/api/soul-mesh', out: '/api/soul-mesh' },
  N04: { in: '/api/soul-mesh', out: '/api/soul-mesh' },
  N05: { in: '/api/soul-mesh', out: '/api/soul-mesh' },
  N06: { in: '/api/soul-mesh', out: '/api/soul-mesh' },
} as const;

export type SoulMeshPeerId = keyof typeof SOUL_MESH_PEER_ENDPOINTS;
