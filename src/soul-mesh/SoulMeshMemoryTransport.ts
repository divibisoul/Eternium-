import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';

/**
 * In-process transport used when Eternium is embedded in the same runtime as
 * another nucleus. Delivery completion means every subscribed handler settled.
 */
export class SoulMeshMemoryTransport implements SoulMeshTransport {
  private readonly handlers = new Set<(message: SoulMeshMessage) => void | Promise<void>>();

  async send(message: SoulMeshMessage): Promise<void> {
    const results = await Promise.allSettled(
      [...this.handlers].map(handler => Promise.resolve(handler(message))),
    );
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length) {
      throw new Error(
        'Soul Mesh memory transport handler failure: ' +
        failures.map(f => String((f as PromiseRejectedResult).reason)).join(' | '),
      );
    }
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}
