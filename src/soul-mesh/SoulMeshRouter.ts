import type { SoulMeshMessage, SoulMeshTransport, SoulNucleus } from './SoulMeshProtocol';

type Pending = {
  resolve: (message: SoulMeshMessage) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class SoulMeshRouter {
  private readonly pending = new Map<string, Pending>();
  private readonly unsubscribe: () => void;

  constructor(
    private readonly transport: SoulMeshTransport,
    private readonly local: SoulNucleus,
    private readonly timeoutMs = 30000,
  ) {
    this.unsubscribe = transport.onMessage(message => this.handle(message));
  }

  request<T = unknown>(
    target: SoulNucleus,
    capability: string,
    payload: T,
  ): Promise<SoulMeshMessage> {
    const id = crypto.randomUUID();
    const message: SoulMeshMessage<T> = {
      protocol: 'soul-mesh/1',
      contractVersion: '1.1.0',
      id,
      correlationId: id,
      source: this.local,
      target,
      kind: 'request',
      capability,
      payload,
      timestamp: Date.now(),
      meta: {
        runtime: 'Eternium-N02',
        transport: 'REALTIME',
        encoding: 'json',
        version: '1.1.0',
        traceId: id,
      },
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`SOUL_MESH_TIMEOUT:${target}:${capability}`));
      }, this.timeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      void this.transport.send(message).catch(error => {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  sendEvent<T = unknown>(target: SoulNucleus, capability: string, payload: T): Promise<void> {
    const message: SoulMeshMessage<T> = {
      protocol: 'soul-mesh/1',
      contractVersion: '1.1.0',
      id: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      source: this.local,
      target,
      kind: 'event',
      capability,
      payload,
      timestamp: Date.now(),
      meta: {
        runtime: 'Eternium-N02',
        transport: 'REALTIME',
        encoding: 'json',
        version: '1.1.0',
      },
    };
    return this.transport.send(message);
  }

  close(): void {
    this.unsubscribe();
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error('SOUL_MESH_ROUTER_CLOSED'));
      this.pending.delete(id);
    }
  }

  private handle(message: SoulMeshMessage): void {
    if (message.target !== this.local) return;
    if (message.kind !== 'response' && message.kind !== 'error') return;
    const correlationId = message.correlationId;
    const pending = this.pending.get(correlationId);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(correlationId);
    if (message.kind === 'error') {
      pending.reject(new Error(`SOUL_MESH_REMOTE_ERROR:${String(message.payload)}`));
      return;
    }
    pending.resolve(message);
  }
}
