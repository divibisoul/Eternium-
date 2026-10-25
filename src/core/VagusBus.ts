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

export type NervoVagoForwarder = <T>(signal: VagusSignal<T>) => Promise<void>;

/**
 * Legacy compatibility facade.
 *
 * The class name is preserved because historical N02 modules import VagusBus.
 * It is no longer a second transport authority: when a NervoVago forwarder is
 * bound, publishes are forwarded to the canonical transversal service while
 * legacy in-process subscribers continue to receive the same signal.
 */
export class VagusBus {
  private readonly subscriptions = new Map<VagusSignalKind, Set<VagusHandler<any>>>();
  private forwarder?: NervoVagoForwarder;
  private forwarderState: 'UNBOUND' | 'BOUND' = 'UNBOUND';

  bindNervoVago(forwarder: NervoVagoForwarder): void {
    this.forwarder = forwarder;
    this.forwarderState = 'BOUND';
  }

  unbindNervoVago(): void {
    this.forwarder = undefined;
    this.forwarderState = 'UNBOUND';
  }

  nervoVagoState(): 'UNBOUND' | 'BOUND' {
    return this.forwarderState;
  }

  subscribe<T>(kind: VagusSignalKind, handler: VagusHandler<T>): () => void {
    const handlers = this.subscriptions.get(kind) ?? new Set();
    handlers.add(handler as VagusHandler<any>);
    this.subscriptions.set(kind, handlers);

    return () => {
      handlers.delete(handler);
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
      id: globalThis.crypto?.randomUUID?.() ?? ('vagus-' + Date.now()),
      correlationId: normalizedCorrelation,
      source,
      target,
      kind,
      timestamp: Date.now(),
      payload,
    };

    if (this.forwarder) {
      await this.forwarder(signal);
    }

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
