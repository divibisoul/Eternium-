import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';

export class SoulMeshHttpTransport implements SoulMeshTransport {
  private listeners = new Set<(message: SoulMeshMessage) => void | Promise<void>>();
  private closed = false;
  constructor(private readonly endpoint: string, private readonly headers: Record<string, string> = {}, private readonly options: { timeoutMs?: number; retries?: number } = {}) {}

  async send(message: SoulMeshMessage): Promise<void> {
    if (this.closed) throw new Error('SOUL_MESH_TRANSPORT_CLOSED');
    const timeoutMs = this.options.timeoutMs ?? 10000;
    const retries = Math.min(3, Math.max(0, this.options.retries ?? 2));
    let last: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(this.endpoint, { method:'POST', headers:{'content-type':'application/json','accept':'application/json',...this.headers}, body:JSON.stringify(message), signal:controller.signal });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) throw new Error(`SOUL_MESH_HTTP_${response.status}`);
        if (body && typeof body === 'object' && 'protocol' in body) await this.receive(body as SoulMeshMessage);
        return;
      } catch (error) {
        last = error;
        if (attempt < retries) await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
      } finally { clearTimeout(timer); }
    }
    throw last instanceof Error ? last : new Error(String(last));
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void { this.listeners.add(handler); return () => this.listeners.delete(handler); }
  async receive(message: SoulMeshMessage): Promise<void> { await Promise.allSettled([...this.listeners].map(listener => listener(message))); }
  close(): void { this.closed = true; this.listeners.clear(); }
}
