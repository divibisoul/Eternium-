import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';
import { createN02AIProviderBridge } from './N02AIProviderBridge';
import { generateWithOllama, ollamaConfigured } from './N02OllamaProviderBridge';
import { SoulMeshAgentRegistry } from './SoulMeshAgentRegistry';
import { createSoulMeshAgent } from './SoulMeshAgentContract';

/** N02 runtime: Mesh handlers are wired to existing provider/service code, never to placeholders. */
export const n02CapabilityRuntime = new SoulMeshCapabilityExecutor();

const handlers = createN02AIProviderBridge();
if (ollamaConfigured()) {
  handlers['ai.generate.ollama'] = async message => generateWithOllama(message.payload as any);
}

for (const [capability, handler] of Object.entries(handlers)) {
  if (!n02CapabilityRuntime.registry.has(capability)) {
    throw new Error(`N02_CAPABILITY_NOT_DECLARED:${capability}`);
  }
  n02CapabilityRuntime.register(capability, handler);
}

/** N02 is an independent AI nucleus. Agents expose only capabilities actually registered above. */
export const n02AgentRegistry = new SoulMeshAgentRegistry();

const agentCapabilities = new Map<string, string[]>();
for (const capability of n02CapabilityRuntime.listExecutable()) {
  const agentId =
    capability === 'ai.multimodal' || capability === 'mpvs' || capability === 'acai'
      ? 'N02.perception-agent'
      : capability === 'cognitive-processing' || capability === 'neural.bnc_v2' || capability === 'cognitive.csae' || capability === 'resource.dcrs'
        ? 'N02.cognition-agent'
        : capability === 'einstein_code'
          ? 'N02.code-audit-agent'
          : capability === 'neural_forge'
            ? 'N02.neural-modeling-agent'
            : capability === 'asc'
              ? 'N02.scientific-discovery-agent'
          : 'N02.inference-agent';

  const list = agentCapabilities.get(agentId) ?? [];
  list.push(capability);
  agentCapabilities.set(agentId, list);
}

for (const [agentId, capabilities] of agentCapabilities) {
  n02AgentRegistry.register(createSoulMeshAgent(
    agentId,
    capabilities,
    message => n02CapabilityRuntime.execute(message),
  ));
}

export async function executeN02Agent(message: Parameters<typeof n02CapabilityRuntime.execute>[0]) {
  return n02AgentRegistry.execute(message);
}

export function getN02RuntimeStatus() {
  const declaredCapabilities = n02CapabilityRuntime.registry.getAll().map(c => c.id).sort();
  const executableCapabilities = n02CapabilityRuntime.listExecutable().sort();

  return {
    nucleus: 'N02' as const,
    declaredCapabilities,
    executableCapabilities,
    agents: n02AgentRegistry.list().map(agent => ({ id: agent.id, capabilities: agent.capabilities })),
    aiBridgeConnected: executableCapabilities.includes('ai.generate'),
    executionCoverage: {
      declared: declaredCapabilities.length,
      executable: executableCapabilities.length,
      ratio: declaredCapabilities.length > 0 ? executableCapabilities.length / declaredCapabilities.length : 0,
    },
  };
}
