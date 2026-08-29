import { createSoulMeshMessage, type SoulMeshMessage, type SoulNucleus } from './SoulMeshProtocol';

export interface SoulMeshDelegationTransport {
  send(message: SoulMeshMessage): Promise<void>;
}

export interface SoulMeshDelegationOptions {
  nucleus: SoulNucleus;
  transport: SoulMeshDelegationTransport;
  capabilityOwners: ReadonlyMap<string, SoulNucleus>;
}

/** N02 outbound delegation: another nucleus can be selected without introducing a parallel API. */
export class SoulMeshDelegator {
  constructor(private readonly options: SoulMeshDelegationOptions) {}

  async request<T = unknown>(target: SoulNucleus, capability: string, payload: T, correlationId = crypto.randomUUID()): Promise<string> {
    if (target === this.options.nucleus) throw new Error('DELEGATION_TARGET_MUST_BE_REMOTE');
    const owner = this.options.capabilityOwners.get(capability);
    if (owner && owner !== target) throw new Error(`CAPABILITY_OWNER_MISMATCH:${capability}:${owner}`);
    const message = createSoulMeshMessage({
      correlationId,
      source: this.options.nucleus,
      target,
      kind: 'request',
      capability,
      payload,
    });
    await this.options.transport.send(message);
    return correlationId;
  }
}
