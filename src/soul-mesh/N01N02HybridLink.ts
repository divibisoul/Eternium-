import type { SoulMeshMessage, SoulMeshTransport } from './SoulMeshProtocol';
import { SoulMeshRouter } from './SoulMeshRouter';

/** N02-side bidirectional link. Direct HTTP/Supabase transports may coexist; N01 remains the communication fabric. */
export class N01N02HybridLink {
  readonly router: SoulMeshRouter;
  constructor(transport: SoulMeshTransport, timeoutMs = 30000) {
    this.router = new SoulMeshRouter(transport, 'N02', timeoutMs);
  }
  requestN01<T = unknown>(capability: string, payload: T): Promise<SoulMeshMessage> {
    return this.router.request('N01', capability, payload);
  }
  eventToN01<T = unknown>(capability: string, payload: T): Promise<void> {
    return this.router.sendEvent('N01', capability, payload);
  }
  healthProbe(): Promise<SoulMeshMessage> {
    return this.requestN01('mesh.health', { requestedBy:'N02', probe:true });
  }
  describeN01(): Promise<SoulMeshMessage> {
    return this.requestN01('mesh.describe', { requestedBy:'N02' });
  }
  close(): void { this.router.close(); }
}
