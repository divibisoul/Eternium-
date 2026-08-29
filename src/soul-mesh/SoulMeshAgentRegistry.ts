import type { SoulMeshMessage } from './SoulMeshProtocol';
import type { SoulMeshAgent } from './SoulMeshAgentContract';

/** Registry of the independent agents owned by N02. */
export class SoulMeshAgentRegistry {
  private readonly agents = new Map<string, SoulMeshAgent>();

  register(agent: SoulMeshAgent): () => void {
    if (this.agents.has(agent.id)) throw new Error(`AGENT_ALREADY_REGISTERED:${agent.id}`);
    this.agents.set(agent.id, agent);
    return () => this.agents.delete(agent.id);
  }

  findForCapability(capability: string): SoulMeshAgent | undefined {
    return [...this.agents.values()].find(agent => agent.capabilities.some(c => capability === c || (c.endsWith('.*') && capability.startsWith(c.slice(0, -1)))));
  }

  async execute(message: SoulMeshMessage): Promise<unknown> {
    const agent = this.findForCapability(message.capability);
    if (!agent) throw new Error(`AGENT_NOT_AVAILABLE:${message.capability}`);
    return agent.handle(message);
  }

  list(): SoulMeshAgent[] { return [...this.agents.values()]; }
}
