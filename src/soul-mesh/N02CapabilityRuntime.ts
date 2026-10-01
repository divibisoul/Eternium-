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

// External upstream functions are assigned to dedicated N02 agents by semantic affinity.
// These agents are wrappers over the canonical N02 capability runtime; they do not copy
// upstream runtimes or create a second execution engine.
export const N02_EXTERNAL_AGENT_BY_CAPABILITY = {
  multimodal_cortex: 'N02.perception-agent',
  autonomous_embodiment: 'N02.embodiment-agent',
  biomolecular_designer: 'N02.biomolecular-design-agent',
  reality_synthesis: 'N02.world-model-agent',
  strategic_planning: 'N02.strategic-planning-agent',
  adaptation_module: 'N02.adaptation-agent',
  scre: 'N02.code-audit-agent',
  ecas: 'N02.architecture-agent',
  eus: 'N02.epistemology-agent',
  mlfg: 'N02.meta-learning-agent',
  emergent_cognition: 'N02.emergent-cognition-agent',
  skill_acquisition: 'N02.skill-acquisition-agent',
  uci: 'N02.integration-agent',
  ethical_governance: 'N02.ethics-agent',
  strategic_defense: 'N02.defense-agent',
  existential_safety: 'N02.safety-agent',
  einstein_reasoning: 'N02.reasoning-agent',
  einstein_quantum: 'N02.quantum-reasoning-agent',
  cot_arhd: 'N02.resource-scheduling-agent',
  cot_drc: 'N02.decomposition-agent',
  cot_area: 'N02.evolution-agent',
} as const;

function agentForCapability(capability: string): string {
  return N02_EXTERNAL_AGENT_BY_CAPABILITY[capability as keyof typeof N02_EXTERNAL_AGENT_BY_CAPABILITY]
    ?? (
      capability === 'ai.multimodal' || capability === 'mpvs' || capability === 'acai'
        ? 'N02.perception-agent'
        : capability === 'cognitive-processing' || capability === 'neural.bnc_v2' || capability === 'cognitive.csae' || capability === 'resource.dcrs'
          ? 'N02.cognition-agent'
          : capability === 'einstein_code' || capability === 'scre'
            ? 'N02.code-audit-agent'
            : capability === 'neural_forge'
              ? 'N02.neural-modeling-agent'
              : capability === 'asc'
                ? 'N02.scientific-discovery-agent'
                : 'N02.inference-agent'
    );
}

const agentCapabilities = new Map<string, string[]>();
for (const capability of n02CapabilityRuntime.listExecutable()) {
  const agentId = agentForCapability(capability);
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
