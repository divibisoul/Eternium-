import { SOUL_MESH_PEERS, type SoulNucleusId } from './soulMeshTopology';
import type { SoulMeshMessage } from './soulMeshAdapter';

const endpointEnv: Record<SoulNucleusId, string> = {
  N01: 'VITE_SOUL_MESH_N01_URL', N02: 'VITE_SOUL_MESH_N02_URL', N03: 'VITE_SOUL_MESH_N03_URL',
  N04: 'VITE_SOUL_MESH_N04_URL', N05: 'VITE_SOUL_MESH_N05_URL', N06: 'VITE_SOUL_MESH_N06_URL',
};

function endpointFor(peer: SoulNucleusId) {
  const env = import.meta.env as Record<string, string | undefined>;
  const endpoint = env[endpointEnv[peer]];
  if (!endpoint) throw new Error(`SOUL_MESH_ENDPOINT_NOT_CONFIGURED:${peer}`);
  return endpoint;
}

export async function sendToPeer(message: SoulMeshMessage) {
  if (!SOUL_MESH_PEERS.N06.includes(message.target as SoulNucleusId)) throw new Error(`INVALID_N06_PEER:${message.target}`);
  const response = await fetch(endpointFor(message.target as SoulNucleusId), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) throw new Error(`SOUL_MESH_TRANSPORT_${response.status}`);
  return response.json() as Promise<SoulMeshMessage>;
}
