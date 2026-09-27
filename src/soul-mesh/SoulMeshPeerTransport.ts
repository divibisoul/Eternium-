import type { SoulMeshMessage, SoulMeshTransport, SoulNucleus } from './SoulMeshProtocol';

export class SoulMeshPeerTransport implements SoulMeshTransport {
  private readonly handlers = new Set<(message: SoulMeshMessage) => void | Promise<void>>();
  private readonly unsubscribe: () => void;

  constructor(
    private readonly transport: SoulMeshTransport,
    private readonly local: SoulNucleus,
  ) {
    this.unsubscribe = transport.onMessage(message => {
      if (message.target !== this.local) return;
      for (const handler of this.handlers) void handler(message);
    });
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(message: SoulMeshMessage): Promise<void> {
    if (message.source !== this.local) {
      throw new Error(`SOUL_MESH_SOURCE_MISMATCH:${message.source}`);
    }
    return this.transport.send(message);
  }

  close(): void {
    this.unsubscribe();
    this.handlers.clear();
  }
}
