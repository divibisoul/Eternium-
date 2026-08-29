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
    id: 'mesh.describe', version: '1.0', description: 'N02 identity, capabilities, tools and transport discovery',
    request: true, response: true, events: false, owner: 'N02', context: [], tools: []
  },
  {
    id: 'mesh.ping', version: '1.0', description: 'N02 Mesh liveness and correlation probe',
    request: true, response: true, events: false, owner: 'N02', context: [], tools: []
  },
];
