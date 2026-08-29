import type { SoulMeshMessage } from './SoulMeshProtocol';

/**
 * Contract for N02 agents exposed through Soul Mesh.
 * Each nucleus remains an independent AI; Mesh only transports requests,
 * responses and delegation between nuclei.
 */
export type SoulMeshAgentResult = {
  status: 'ok';
  nucleus: 'N02';
  capability: string;
  correlationId: string;
  result: unknown;
};

export type SoulMeshAgent = {
  id: string;
  capabilities: string[];
  handle(message: SoulMeshMessage): Promise<SoulMeshAgentResult>;
};

export function createSoulMeshAgent(
  id: string,
  capabilities: string[],
  handler: (message: SoulMeshMessage) => unknown | Promise<unknown>,
): SoulMeshAgent {
  if (!id.trim()) throw new Error('AGENT_ID_REQUIRED');
  return {
    id,
    capabilities: [...new Set(capabilities)],
    async handle(message) {
      return {
        status: 'ok',
        nucleus: 'N02',
        capability: message.capability,
        correlationId: message.correlationId,
        result: await handler(message),
      };
    },
  };
}
