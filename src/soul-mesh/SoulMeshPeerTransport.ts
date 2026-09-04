import type { SoulMeshMessage, SoulMeshTransport, SoulNucleus } from './SoulMeshProtocol';

/** Adds local-nucleus ownership and inbound filtering around a base transport. */
export class SoulMeshPeerTransport implements SoulMeshTransport {
  private readonly handlers = new Set<(message: SoulMeshMessage) => void | Promise<void>>();
  private readonly unsubscribe: () => void;

  constructor(private readonly inner: SoulMeshTransport, private readonly local: SoulNucleus) {
    this.unsubscribe = inner.onMessage(message => {
      if (message.target !== this.local) return;
      for (const handler of this.handlers) void handler(message);
    });
  }

  async send(message: SoulMeshMessage): Promise<void> {
    if (message.source !== this.local) throw new Error(`SOUL_MESH_SOURCE_MISMATCH:${message.source}`);
    if (message.source === message.target) throw new Error('SOUL_MESH_SELF_ROUTE_FORBIDDEN');
    await this.inner.send(message);
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  close(): void {
    this.unsubscribe();
    this.handlers.clear();
  }
}
