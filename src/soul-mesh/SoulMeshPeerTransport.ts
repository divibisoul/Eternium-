import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';
import { SoulMeshHttpTransport } from './SoulMeshHttpTransport';

export class SoulMeshPeerTransport implements SoulMeshTransport {
  private readonly handlers = new Set<(message: SoulMeshMessage) => void | Promise<void>>();
  private readonly transports = new Map<string, SoulMeshHttpTransport>();

  constructor(private readonly endpoints: Partial<Record<SoulMeshMessage['target'], string>>) {}

  async send(message: SoulMeshMessage): Promise<void> {
    const endpoint = this.endpoints[message.target];
    if (!endpoint) throw new Error(`SOUL_MESH_PEER_URL_NOT_CONFIGURED:${message.target}`);
    let transport = this.transports.get(message.target);
    if (!transport) {
      transport = new SoulMeshHttpTransport(endpoint);
      this.transports.set(message.target, transport);
    }
    await transport.send(message);
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async receive(message: SoulMeshMessage): Promise<void> {
    await Promise.allSettled([...this.handlers].map(handler => handler(message)));
  }
}
