import { createSoulMeshMessage, type SoulMeshMessage, type SoulNucleus } from './SoulMeshProtocol';
import { executeN02Agent } from './N02CapabilityRuntime';

export interface SoulMeshNucleusRouterOptions {
  nucleus: SoulNucleus;
  send: (message: SoulMeshMessage) => Promise<void>;
}

export class SoulMeshNucleusRouter {
  constructor(private readonly options: SoulMeshNucleusRouterOptions) {}

  async receive(message: SoulMeshMessage): Promise<void> {
    if (message.target !== this.options.nucleus) return;
    if (message.kind !== 'request') return;
    if (this.options.nucleus !== 'N02') return;

    try {
      const payload = await executeN02Agent(message);
      await this.options.send(createSoulMeshMessage({
        correlationId: message.correlationId,
        source: 'N02',
        target: message.source,
        kind: 'response',
        capability: message.capability,
        payload,
      }));
    } catch (error) {
      await this.options.send(createSoulMeshMessage({
        correlationId: message.correlationId,
        source: 'N02',
        target: message.source,
        kind: 'error',
        capability: message.capability,
        payload: { code: error instanceof Error ? error.message : 'N02_EXECUTION_FAILED' },
      }));
    }
  }
}
