import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';
import { SoulMeshHttpTransport } from './SoulMeshHttpTransport';

/**
 * @deprecated Supabase Realtime is not part of the active N02 dependency graph.
 * Keep this adapter for source compatibility, but route it through the canonical
 * HTTP transport until a native realtime adapter is introduced.
 */
export class SoulMeshSupabaseTransport implements SoulMeshTransport {
  private readonly delegate: SoulMeshHttpTransport;

  constructor(endpoint?: string, token?: string) {
    const env = (globalThis as any).process?.env ?? {};
    const resolvedEndpoint = endpoint ?? env.SOUL_MESH_N01_URL;
    if (!resolvedEndpoint) throw new Error('SOUL_MESH_HTTP_ENDPOINT_REQUIRED');
    const normalized = String(resolvedEndpoint).includes('/mesh/in/')
      ? String(resolvedEndpoint)
      : `${String(resolvedEndpoint).replace(/\/$/, '')}/mesh/in/N02`;
    this.delegate = new SoulMeshHttpTransport(
      normalized,
      token ? { authorization: `Bearer ${token}` } : {},
      { timeoutMs: 10000, retries: 2 },
    );
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    return this.delegate.onMessage(handler);
  }

  async send(message: SoulMeshMessage): Promise<void> {
    return this.delegate.send(message);
  }

  close(): void {
    this.delegate.close();
  }
}
