import { isSoulMeshMessage, type SoulMeshMessage, type SoulMeshTransport, type SoulNucleus } from './SoulMeshProtocol';

export class SoulMeshPeerTransport implements SoulMeshTransport {
  constructor(private readonly inner: SoulMeshTransport, private readonly local: SoulNucleus) {}

  send(message: SoulMeshMessage): Promise<void> {
    if (!isSoulMeshMessage(message)) throw new Error('Invalid Soul Mesh message');
    if (message.source !== this.local) throw new Error(`Invalid source for ${this.local}`);
    if (message.target === this.local) throw new Error('Soul Mesh target must be remote');
    return this.inner.send(message);
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    return this.inner.onMessage(async (message) => {
      if (!isSoulMeshMessage(message)) return;
      if (message.target !== this.local || message.source === this.local) return;
      await handler(message);
    });
  }
}
