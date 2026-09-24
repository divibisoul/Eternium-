import type { NucleusId, PeerDescription } from '../../api/soul-mesh/peer-client';
import { discoverPeerCapabilities, requestPeerTool } from '../../api/soul-mesh/peer-client';

export type DelegationRequest = {
  capability: string;
  payload: unknown;
  preferredTargets?: NucleusId[];
  timeoutMs?: number;
};

export type DelegationResult = {
  delegatedTo: NucleusId;
  capability: string;
  response: unknown;
};

const PEERS: NucleusId[] = ['N01', 'N03', 'N04', 'N05', 'N06', 'N07'];

/**
 * N02 delegates work through the existing Soul Mesh peer transport.
 * It never executes another nucleus' capability locally and never creates
 * a second inter-nucleus API. Discovery is used to select an executable peer.
 */
export class N02DelegationCoordinator {
  constructor(private readonly peers: readonly NucleusId[] = PEERS) {}

  async discover(timeoutMs = 5000): Promise<PeerDescription[]> {
    const results = await Promise.all(this.peers.map(async nucleus => {
      try {
        return await discoverPeerCapabilities(nucleus, timeoutMs);
      } catch {
        return null;
      }
    }));
    return results.filter((value): value is PeerDescription => value !== null);
  }

  async delegate(request: DelegationRequest): Promise<DelegationResult> {
    if (!request.capability.trim()) throw new Error('DELEGATION_CAPABILITY_REQUIRED');
    const descriptions = await this.discover(request.timeoutMs ?? 5000);
    const preferred = request.preferredTargets ?? this.peers;
    const peer = descriptions.find(description =>
      preferred.includes(description.nucleus) && description.executableCapabilities.includes(request.capability),
    );

    if (!peer) {
      throw new Error(`NO_EXECUTABLE_PEER_FOR_CAPABILITY:${request.capability}`);
    }

    const response = await requestPeerTool(
      peer.nucleus,
      request.capability,
      request.payload,
      request.timeoutMs ?? 15000,
    );

    return { delegatedTo: peer.nucleus, capability: request.capability, response };
  }
}