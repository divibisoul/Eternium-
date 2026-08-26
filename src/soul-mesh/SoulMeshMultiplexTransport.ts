import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';

/** Hybrid transport: HTTP, Supabase, memory/test or future transports can coexist. */
export class SoulMeshMultiplexTransport implements SoulMeshTransport {
  private readonly listeners = new Set<(message: SoulMeshMessage) => void | Promise<void>>();
  private readonly unsubs: (() => void)[] = [];

  constructor(private readonly transports: readonly SoulMeshTransport[]) {
    if (!transports.length) throw new Error('Soul Mesh requires at least one transport');
    for (const transport of transports) {
      this.unsubs.push(transport.onMessage(message =>
        Promise.allSettled([...this.listeners].map(listener => listener(message))).then(() => undefined),
      ));
    }
  }

  async send(message: SoulMeshMessage): Promise<void> {
    const results = await Promise.allSettled(this.transports.map(transport => transport.send(message)));
    if (results.every(result => result.status === 'rejected')) {
      throw new Error(`Soul Mesh all transports failed: ${results.map(result => String(result.status === 'rejected' ? result.reason : '')).join(' | ')}`);
    }
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  close(): void { for (const unsubscribe of this.unsubs) unsubscribe(); this.unsubs.length = 0; this.listeners.clear(); }
}
