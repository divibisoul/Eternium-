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
];
