import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';

/** In-process transport used when Eternium is embedded in the same runtime as another nucleus. */
export class SoulMeshMemoryTransport implements SoulMeshTransport {
  private readonly handlers = new Set<(message: SoulMeshMessage) => void | Promise<void>>();

  async send(message: SoulMeshMessage): Promise<void> {
    for (const handler of this.handlers) void Promise.resolve(handler(message));
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}
