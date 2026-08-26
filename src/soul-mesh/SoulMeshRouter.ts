import type { SoulMeshMessage, SoulMeshTransport, SoulNucleus } from './SoulMeshProtocol';

export class SoulMeshRouter {
  constructor(private readonly transport: SoulMeshTransport, private readonly local: SoulNucleus) {}

  async send<T>(target: SoulNucleus, capability: string, payload: T, correlationId = crypto.randomUUID()): Promise<void> {
    await this.transport.send({
      protocol: 'soul-mesh/1',
      id: crypto.randomUUID(),
      correlationId,
      source: this.local,
      target,
      kind: 'request',
      capability,
      payload,
      timestamp: Date.now(),
    });
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    return this.transport.onMessage(async message => {
      if (message.target === this.local) await handler(message);
    });
  }
}
