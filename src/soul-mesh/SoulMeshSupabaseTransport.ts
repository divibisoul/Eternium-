import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';

export class SoulMeshSupabaseTransport implements SoulMeshTransport {
  private readonly channel: RealtimeChannel;
  private handlers = new Set<(message: SoulMeshMessage) => void | Promise<void>>();

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase Realtime configuration');
    const client = createClient(url, key);
    this.channel = client.channel('soul-mesh-v1');
    this.channel.on('broadcast', { event: 'soul_mesh_message' }, ({ payload }) => {
      const message = payload as SoulMeshMessage;
      if (message.protocol !== 'soul-mesh/1') return;
      for (const handler of this.handlers) void handler(message);
    });
    void this.channel.subscribe();
  }

  onMessage(handler: (message: SoulMeshMessage) => void | Promise<void>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async send(message: SoulMeshMessage): Promise<void> {
    const result = await this.channel.send({ type: 'broadcast', event: 'soul_mesh_message', payload: message });
    if (result !== 'ok') throw new Error(`Soul Mesh broadcast failed: ${result}`);
  }
}
