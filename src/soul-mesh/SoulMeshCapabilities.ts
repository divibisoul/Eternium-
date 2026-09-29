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

/** N02-owned AI capabilities. Declaration describes the contract; runtime registration determines executability. */
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
    id: 'mesh.describe', version: '1.0', description: 'N02 identity, capabilities, tools and transport discovery',
    request: true, response: true, events: false, owner: 'N02', context: [], tools: []
  },
];
