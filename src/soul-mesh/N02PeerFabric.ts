import { discoverPeerCapabilities, requestPeerCapability, type NucleusId, type PeerDescription } from '../../api/soul-mesh/peer-client';

export type N02RemoteCapability = {
  nucleus: NucleusId;
  id: string;
  executable: boolean;
};

/**
 * N02-side capability fabric. It discovers peer capabilities and delegates execution
 * to the owning nucleus; it never re-implements a peer capability locally.
 */
export class N02PeerFabric {
  async describe(nucleus: NucleusId): Promise<PeerDescription> {
    return discoverPeerCapabilities(nucleus);
  }

  async discover(nucleus: NucleusId): Promise<N02RemoteCapability[]> {
    const description = await this.describe(nucleus);
    const executable = new Set(description.executableCapabilities ?? []);
    return (description.declaredCapabilities ?? []).map(id => ({
      nucleus,
      id,
      executable: executable.has(id),
    }));
  }

  async execute(nucleus: NucleusId, capability: string, payload: unknown) {
    return requestPeerCapability(nucleus, capability, payload);
  }
}

export const n02PeerFabric = new N02PeerFabric();
