import { createSoulMeshMessage, type SoulMeshMessage, type SoulMeshTransport, type SoulNucleus } from './SoulMeshProtocol';

export type SoulMeshHandler = (message: SoulMeshMessage) => Promise<unknown> | unknown;

export class SoulMeshRouter {
  private readonly handlers = new Map<string, SoulMeshHandler>();
  private readonly pending = new Map<string, { resolve: (message: SoulMeshMessage) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  private readonly unsubscribe: () => void;

  constructor(
    private readonly transport: SoulMeshTransport,
    private readonly local: SoulNucleus,
    private readonly timeoutMs = 30000,
  ) {
    this.unsubscribe = transport.onMessage((message) => this.dispatch(message));
  }

  register(capability: string, handler: SoulMeshHandler): () => void {
    this.handlers.set(capability, handler);
    return () => this.handlers.delete(capability);
  }

  async request<T = unknown>(target: SoulNucleus, capability: string, payload: T): Promise<SoulMeshMessage> {
    const message = createSoulMeshMessage({
      source: this.local,
      target,
      kind: 'request',
      capability,
      payload,
      correlationId: '',
    });

    const response = new Promise<SoulMeshMessage>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(message.correlationId);
        reject(new Error(`Soul Mesh request timeout: ${target}/${capability}`));
      }, Math.max(1, this.timeoutMs));
      this.pending.set(message.correlationId, { resolve, reject, timer });
    });

    try {
      await this.transport.send(message);
      return await response;
    } catch (error) {
      const entry = this.pending.get(message.correlationId);
      if (entry) {
        clearTimeout(entry.timer);
        this.pending.delete(message.correlationId);
      }
      throw error;
    }
  }

  sendEvent<T = unknown>(target: SoulNucleus, capability: string, payload: T): Promise<void> {
    return this.transport.send(createSoulMeshMessage({
      source: this.local,
      target,
      kind: 'event',
      capability,
      payload,
      correlationId: '',
    }));
  }

  close(): void {
    this.unsubscribe();
    for (const [correlationId, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(new Error(`Soul Mesh router closed: ${correlationId}`));
    }
    this.pending.clear();
  }

  private async dispatch(message: SoulMeshMessage): Promise<void> {
    if (message.kind === 'response' || message.kind === 'error') {
      const entry = this.pending.get(message.correlationId);
      if (!entry) return;
      clearTimeout(entry.timer);
      this.pending.delete(message.correlationId);
      if (message.kind === 'error') entry.reject(new Error('Soul Mesh remote error'));
      else entry.resolve(message);
      return;
    }

    const capability = message.capability;
    if (!capability) return;
    const handler = this.handlers.get(capability);
    if (!handler || message.kind !== 'request') return;

    try {
      const payload = await handler(message);
      await this.transport.send(createSoulMeshMessage({
        source: this.local,
        target: message.source,
        kind: 'response',
        capability,
        payload,
        correlationId: message.correlationId,
      }));
    } catch (error) {
      await this.transport.send(createSoulMeshMessage({
        source: this.local,
        target: message.source,
        kind: 'error',
        capability,
        payload: { error: error instanceof Error ? error.message : 'handler_failed' },
        correlationId: message.correlationId,
      }));
    }
  }
}
