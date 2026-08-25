import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';

export type SoulMeshHandler = (message: SoulMeshMessage) => void | Promise<void>;

/** Runtime bridge for wiring the Eternium node to an external Soul Mesh transport. */
export class SoulMeshLoopback implements SoulMeshTransport {
  private handlers = new Set<SoulMeshHandler>();

  constructor(private readonly forward: (message: SoulMeshMessage) => Promise<void>) {}

  async send(message: SoulMeshMessage): Promise<void> {
    await this.forward(message);
  }

  onMessage(handler: SoulMeshHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async receive(message: SoulMeshMessage): Promise<void> {
    await Promise.all([...this.handlers].map((handler) => handler(message)));
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}
