import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';
import { createN02AIProviderBridge } from './N02AIProviderBridge';
import { SoulMeshAgentRegistry } from './SoulMeshAgentRegistry';
import { createSoulMeshAgent } from './SoulMeshAgentContract';

/** N02 runtime: Mesh handlers are wired to the existing AI provider/service, not mocked. */
export const n02CapabilityRuntime = new SoulMeshCapabilityExecutor();

const handlers = createN02AIProviderBridge();
for (const [capability, handler] of Object.entries(handlers)) {
  if (!n02CapabilityRuntime.registry.has(capability)) {
    throw new Error(`N02_CAPABILITY_NOT_DECLARED:${capability}`);
  }
  n02CapabilityRuntime.register(capability, handler);
}

/** N02 is an independent AI nucleus. Its agents use the existing capability runtime. */
export const n02AgentRegistry = new SoulMeshAgentRegistry();

const agentCapabilities = new Map<string, string[]>();
for (const capability of n02CapabilityRuntime.listExecutable()) {
  const agentId = capability === 'ai.multimodal'
    ? 'N02.multimodal-agent'
    : capability === 'cognitive-processing'
      ? 'N02.cognition-agent'
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

/** Execute an incoming Mesh request through an N02-owned agent. */
export async function executeN02Agent(message: Parameters<typeof n02CapabilityRuntime.execute>[0]) {
  return n02AgentRegistry.execute(message);
}

/** Runtime introspection used by Mesh discovery and diagnostics. */
export function getN02RuntimeStatus() {
  return {
    nucleus: 'N02' as const,
    declaredCapabilities: n02CapabilityRuntime.registry.getAll().map(c => c.id).sort(),
    executableCapabilities: n02CapabilityRuntime.listExecutable(),
    agents: n02AgentRegistry.list().map(agent => ({ id: agent.id, capabilities: agent.capabilities })),
    aiBridgeConnected: n02CapabilityRuntime.listExecutable().includes('ai.generate'),
  };
}
