import { createSoulMeshMessage, isSoulMeshMessage, type SoulMeshMessage, type SoulMeshTransport, type SoulNucleus } from './SoulMeshProtocol';

type Pending = {
  resolve: (message: SoulMeshMessage) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class SoulMeshRouter {
  private readonly pending = new Map<string, Pending>();
  private readonly unsubscribe: () => void;
  private closed = false;

  constructor(private readonly transport: SoulMeshTransport, private readonly local: SoulNucleus, private readonly timeoutMs = 15000) {
    if (!Number.isFinite(timeoutMs) || timeoutMs < 250) throw new Error('SOUL_MESH_TIMEOUT_INVALID');
    this.unsubscribe = transport.onMessage(message => this.handle(message));
  }

  async request<T = unknown>(target: SoulNucleus, capability: string, payload: T): Promise<SoulMeshMessage> {
    if (this.closed) throw new Error('SOUL_MESH_ROUTER_CLOSED');
    if (target === this.local) throw new Error('SOUL_MESH_SELF_ROUTE_FORBIDDEN');
    if (!capability.trim()) throw new Error('SOUL_MESH_CAPABILITY_REQUIRED');
    const message = createSoulMeshMessage({
      correlationId: crypto.randomUUID(),
      source: this.local,
      target,
      kind: 'request',
      capability,
      payload,
      meta: { runtime: 'Eternium-', transport: 'abstract', encoding: 'json', version: '1.1.0' },
    });

    const promise = new Promise<SoulMeshMessage>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(message.correlationId);
        reject(new Error(`SOUL_MESH_TIMEOUT:${target}:${capability}`));
      }, this.timeoutMs);
      this.pending.set(message.correlationId, { resolve, reject, timer });
    });

    try {
      await this.transport.send(message);
    } catch (error) {
      const pending = this.pending.get(message.correlationId);
      if (pending) {
        clearTimeout(pending.timer);
        this.pending.delete(message.correlationId);
        pending.reject(error instanceof Error ? error : new Error(String(error)));
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
    return promise;
  }

  async sendEvent<T = unknown>(target: SoulNucleus, capability: string, payload: T): Promise<void> {
    if (this.closed) throw new Error('SOUL_MESH_ROUTER_CLOSED');
    if (target === this.local) throw new Error('SOUL_MESH_SELF_ROUTE_FORBIDDEN');
    if (!capability.trim()) throw new Error('SOUL_MESH_CAPABILITY_REQUIRED');
    await this.transport.send(createSoulMeshMessage({
      correlationId: crypto.randomUUID(),
      source: this.local,
      target,
      kind: 'event',
      capability,
      payload,
      meta: { runtime: 'Eternium-', transport: 'abstract', encoding: 'json', version: '1.1.0' },
    }));
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.unsubscribe();
    for (const [correlationId, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(new Error(`SOUL_MESH_ROUTER_CLOSED:${correlationId}`));
    }
    this.pending.clear();
    const candidate = this.transport as SoulMeshTransport & { close?: () => void };
    candidate.close?.();
  }

  private handle(message: SoulMeshMessage): void {
    if (this.closed || message.target !== this.local || message.source === this.local) return;
    if (!isSoulMeshMessage(message)) return;
    if (message.kind !== 'response' && message.kind !== 'error') return;
    const pending = this.pending.get(message.correlationId);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(message.correlationId);
    if (message.kind === 'error') {
      const payload = typeof message.payload === 'object' && message.payload !== null ? message.payload as Record<string, unknown> : {};
      pending.reject(new Error(String(payload.code ?? 'SOUL_MESH_REMOTE_ERROR')));
      return;
    }
    pending.resolve(message);
  }
}
