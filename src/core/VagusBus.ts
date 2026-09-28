export type VagusSignalKind =
  | 'bnc.signal'
  | 'csae.plan'
  | 'dcrs.allocation'
  | 'pipeline.error';

export type VagusSignal<T = unknown> = {
  id: string;
  correlationId: string;
  source: string;
  target: string;
  kind: VagusSignalKind;
  timestamp: number;
  payload: T;
};

export type VagusHandler<T = unknown> = (signal: VagusSignal<T>) => void | Promise<void>;

export class VagusBus {
  private readonly subscriptions = new Map<VagusSignalKind, Set<VagusHandler<any>>>();

  subscribe<T>(kind: VagusSignalKind, handler: VagusHandler<T>): () => void {
    const handlers = this.subscriptions.get(kind) ?? new Set();
    handlers.add(handler as VagusHandler<any>);
    this.subscriptions.set(kind, handlers);

    return () => {
      handlers.delete(handler as VagusHandler<any>);
      if (handlers.size === 0) this.subscriptions.delete(kind);
    };
  }

  async publish<T>(
    kind: VagusSignalKind,
    source: string,
    target: string,
    correlationId: string,
    payload: T,
  ): Promise<VagusSignal<T>> {
    const normalizedCorrelation = correlationId.trim();
    if (!normalizedCorrelation) throw new Error('VAGUS_CORRELATION_REQUIRED');

    const signal: VagusSignal<T> = {
      id: globalThis.crypto?.randomUUID?.() ?? `vagus-${Date.now()}`,
      correlationId: normalizedCorrelation,
      source,
      target,
      kind,
      timestamp: Date.now(),
      payload,
    };

    const handlers = [...(this.subscriptions.get(kind) ?? [])];
    await Promise.all(handlers.map(handler => handler(signal)));
    return signal;
  }

  listenerCount(kind?: VagusSignalKind): number {
    if (kind) return this.subscriptions.get(kind)?.size ?? 0;
    let total = 0;
    for (const handlers of this.subscriptions.values()) total += handlers.size;
    return total;
  }
}

export const n02VagusBus = new VagusBus();
