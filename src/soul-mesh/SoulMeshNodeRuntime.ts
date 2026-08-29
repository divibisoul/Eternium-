import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';
import { createSoulMeshMessage, type SoulMeshMessage, type SoulNucleus } from './SoulMeshProtocol';

export interface SoulMeshNodeRuntimeOptions { nucleus: SoulNucleus; executor: SoulMeshCapabilityExecutor; }

/** Independent nucleus runtime: receives work, executes owned capabilities, and returns correlated results. */
export class SoulMeshNodeRuntime {
  constructor(private readonly options: SoulMeshNodeRuntimeOptions) {}

  async receive(message: SoulMeshMessage): Promise<SoulMeshMessage> {
    if (message.target !== this.options.nucleus) {
      return createSoulMeshMessage({
        correlationId: message.correlationId,
        source: this.options.nucleus,
        target: message.source,
        kind: 'error',
        capability: message.capability,
        payload: { code: 'WRONG_TARGET', expected: this.options.nucleus, received: message.target },
      });
    }

    if (message.kind !== 'request') {
      return createSoulMeshMessage({
        correlationId: message.correlationId,
        source: this.options.nucleus,
        target: message.source,
        kind: 'error',
        capability: message.capability,
        payload: { code: 'REQUEST_REQUIRED' },
      });
    }

    try {
      const result = await this.options.executor.execute(message);
      return createSoulMeshMessage({
        correlationId: message.correlationId,
        source: this.options.nucleus,
        target: message.source,
        kind: 'response',
        capability: message.capability,
        payload: result,
      });
    } catch (error) {
      return createSoulMeshMessage({
        correlationId: message.correlationId,
        source: this.options.nucleus,
        target: message.source,
        kind: 'error',
        capability: message.capability,
        payload: { code: error instanceof Error ? error.message : 'CAPABILITY_EXECUTION_FAILED' },
      });
    }
  }
}
