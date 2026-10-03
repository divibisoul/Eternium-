export type SoulMeshCapability = {
  id: string;
  version: string;
  description: string;
  request: boolean;
  response: boolean;
  events: boolean;
  owner: 'N02';
  context?: string[];
  tools?: string[];
};

/**
 * N02-owned capabilities.
 *
 * IMPORTANT: declaration is not proof of execution. Runtime registration is the
 * authority for whether a capability is executable.
 */
export const SOUL_MESH_CAPABILITIES: SoulMeshCapability[] = [
  {
    id: 'mesh.handshake', version: '1.1', description: 'N02 canonical Mesh handshake and capability discovery',
    request: true, response: true, events: false, owner: 'N02', context: [], tools: []
  },
  {
    id: 'cognitive-processing', version: '1.0', description: 'N02 cognitive processing services',
    request: true, response: true, events: true, owner: 'N02', context: ['request', 'conversation'], tools: []
  },
  {
    id: 'ai.generate', version: '1.0', description: 'N02 generative AI capability',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'conversation'], tools: []
  },
  {
    id: 'gemini.google_search', version: '1.0', description: 'N02 Gemini native Google Search grounding path',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'conversation', 'web-grounding'], tools: ['googleSearch']
  },
  {
    id: 'gemini.code_execution', version: '1.0', description: 'N02 Gemini native Python code execution path; enabled only when explicitly configured',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'reasoning', 'computation'], tools: ['codeExecution']
  },
  {
    id: 'gemini.url_context', version: '1.0', description: 'N02 Gemini native URL Context retrieval path',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'web', 'url'], tools: ['urlContext']
  },
  {
    id: 'gemini.file_search', version: '1.0', description: 'N02 Gemini native File Search over explicitly supplied File Search Stores',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'retrieval', 'documents'], tools: ['fileSearch']
  },
  {
    id: 'gemini.google_maps', version: '1.0', description: 'N02 Gemini native Google Maps grounding path',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'geospatial'], tools: ['googleMaps']
  },
  {
    id: 'inference.reason', version: '1.0', description: 'Compatibility adapter from federated reasoning requests to the canonical N02 cognitive provider',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'conversation', 'perception'], tools: []
  },
  {
    id: 'ai.multimodal', version: '1.0', description: 'N02 multimodal AI capability',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'media'], tools: []
  },
  {
    id: 'acai', version: '1.0', description: 'N02 conversational audio interaction using the existing Gemini audio transcription and generation path',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'audio', 'conversation'], tools: []
  },
  {
    id: 'mpvs', version: '1.0', description: 'N02 visual perception using the existing multimodal Gemini content path',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'media', 'vision'], tools: []
  },
  {
    id: 'neural_forge', version: '1.0', description: 'N02 NeuralForge computational modeling path using the preserved functional persona and Gemini provider',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'neural-modeling'], tools: []
  },
  {
    id: 'asc', version: '1.0', description: 'N02 autonomous scientific discovery reasoning path using the preserved functional persona and Gemini provider',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'scientific-discovery'], tools: []
  },
  {
    id: 'einstein_code', version: '1.0', description: 'N02 code audit reasoning path using the existing Gemini provider with the preserved CodeGenesis persona contract',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'code-audit'], tools: []
  },
  {
    id: 'ai.generate.vllm', version: '1.0', description: 'N02 generative inference through a configured vLLM OpenAI-compatible runtime',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'conversation', 'high-throughput-inference'], tools: []
  },
  {
    id: 'ai.generate.sglang', version: '1.0', description: 'N02 generative inference through a configured SGLang OpenAI-compatible runtime',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'conversation', 'high-performance-inference'], tools: []
  },
  {
    id: 'ai.generate.ollama', version: '1.0', description: 'N02 generative AI through a configured local Ollama OpenAI-compatible endpoint',
    request: true, response: true, events: false, owner: 'N02', context: ['request', 'conversation', 'local-inference'], tools: []
  },
  {
    id: 'neural.bnc_v2', version: '1.0', description: 'N02 BNCv2 neural signal processing adapter',
    request: true, response: true, events: true, owner: 'N02', context: ['request', 'neural'], tools: []
  },
  {
    id: 'cognitive.csae', version: '1.0', description: 'N02 Cognitive Self-Architecting Engine planning stage',
    request: true, response: true, events: true, owner: 'N02', context: ['request', 'planning'], tools: []
  },
  {
    id: 'resource.dcrs', version: '1.0', description: 'N02 Dynamic Cognitive Resource Scheduler allocation stage',
    request: true, response: true, events: true, owner: 'N02', context: ['request', 'resources'], tools: []
  },
  {
    id: 'clareira.ingest', version: '1.0', description: 'N02 Clareira packet relay to N01 through the canonical Mesh',
    request: true, response: true, events: true, owner: 'N02', context: ['request', 'clareira'], tools: []
  },
  {
    id: 'clareira.metrics', version: '1.0', description: 'N02 observable Clareira relay counters and latency samples',
    request: true, response: true, events: false, owner: 'N02', context: ['telemetry', 'clareira'], tools: []
  },
  {
    id: 'octacore.execute', version: '1.0', description: 'N02 OctaCore execution boundary over existing capability handlers',
    request: true, response: true, events: false, owner: 'N02', context: ['execution', 'octacore'], tools: []
  },
  {
    id: 'mesh.describe', version: '1.0', description: 'N02 identity, capabilities, tools and transport discovery',
    request: true, response: true, events: false, owner: 'N02', context: [], tools: []
  },
  { id: 'multimodal_cortex', version: '1.0', description: 'Parallel multimodal fusion across text, audio and visual analysis.', request: true, response: true, events: true, owner: 'N02', context: ['request','media','fusion'], tools: [] },
  { id: 'autonomous_embodiment', version: '1.0', description: 'Autonomous state-to-action decision layer with explicit actuator boundary.', request: true, response: true, events: true, owner: 'N02', context: ['autonomy','state','action'], tools: [] },
  { id: 'biomolecular_designer', version: '1.0', description: 'Constraint-aware biomolecular design reasoning capability.', request: true, response: true, events: false, owner: 'N02', context: ['science','design'], tools: [] },
  { id: 'reality_synthesis', version: '1.0', description: 'Bounded world-model synthesis for simulated environments.', request: true, response: true, events: true, owner: 'N02', context: ['world-model','simulation'], tools: [] },
  { id: 'strategic_planning', version: '1.0', description: 'Hierarchical strategic planning with resource and review constraints.', request: true, response: true, events: true, owner: 'N02', context: ['planning','strategy'], tools: [] },
  { id: 'adaptation_module', version: '1.0', description: 'Online adaptation analysis with deterministic STDP-style plasticity.', request: true, response: true, events: true, owner: 'N02', context: ['adaptation','plasticity'], tools: [] },
  { id: 'scre', version: '1.0', description: 'Self-code refactoring proposal and verification planning.', request: true, response: true, events: true, owner: 'N02', context: ['code','refactoring'], tools: [] },
  { id: 'ecas', version: '1.0', description: 'Emergent cognitive architecture synthesis with bounded expert routing.', request: true, response: true, events: true, owner: 'N02', context: ['architecture','moe'], tools: [] },
  { id: 'eus', version: '1.0', description: 'Cross-domain epistemological unification and contradiction mapping.', request: true, response: true, events: true, owner: 'N02', context: ['knowledge','synthesis'], tools: [] },
  { id: 'mlfg', version: '1.0', description: 'Meta-learning method and evaluation-protocol generation.', request: true, response: true, events: true, owner: 'N02', context: ['meta-learning','research'], tools: [] },
  { id: 'emergent_cognition', version: '1.0', description: 'Bounded subtask spawning and parallel cognitive synthesis.', request: true, response: true, events: true, owner: 'N02', context: ['cognition','subagents'], tools: [] },
  { id: 'skill_acquisition', version: '1.0', description: 'Skill extraction from demonstrations into reusable procedures.', request: true, response: true, events: true, owner: 'N02', context: ['skills','learning'], tools: [] },
  { id: 'uci', version: '1.0', description: 'Universal interface adaptation into the canonical Mesh contract.', request: true, response: true, events: true, owner: 'N02', context: ['integration','protocols'], tools: [] },
  { id: 'ethical_governance', version: '1.0', description: 'Multi-perspective ethical review plus independent critic pass.', request: true, response: true, events: true, owner: 'N02', context: ['governance','ethics'], tools: [] },
  { id: 'strategic_defense', version: '1.0', description: 'Defensive multidomain risk assessment and control planning.', request: true, response: true, events: true, owner: 'N02', context: ['defense','risk'], tools: [] },
  { id: 'existential_safety', version: '1.0', description: 'Constitutional policy evaluation for bounded autonomy.', request: true, response: true, events: true, owner: 'N02', context: ['safety','governance'], tools: [] },
  { id: 'einstein_reasoning', version: '1.0', description: 'Structured scientific reasoning with assumptions, derivation and checks.', request: true, response: true, events: true, owner: 'N02', context: ['science','reasoning'], tools: [] },
  { id: 'einstein_quantum', version: '1.0', description: 'Deterministic probabilistic-state analysis without claiming quantum hardware.', request: true, response: true, events: true, owner: 'N02', context: ['probability','quantum-modeling'], tools: [] },
  { id: 'cot_arhd', version: '1.0', description: 'Spectral demand analysis for hyper-dynamic resource allocation.', request: true, response: true, events: true, owner: 'N02', context: ['resources','scheduling'], tools: [] },
  { id: 'cot_drc', version: '1.0', description: 'Problem decomposition into bounded parallel cognitive subtasks.', request: true, response: true, events: true, owner: 'N02', context: ['decomposition','parallelism'], tools: [] },
  { id: 'cot_area', version: '1.0', description: 'Deterministic population-based algorithmic evolution.', request: true, response: true, events: true, owner: 'N02', context: ['evolution','algorithms'], tools: [] },
];
