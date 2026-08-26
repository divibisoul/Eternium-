export type SoulMeshCapability = { id: string; version: string; description: string; request: boolean; response: boolean; events: boolean };

/** Declared N02 capabilities. Declaration never implies that a runtime handler is installed. */
export const SOUL_MESH_CAPABILITIES: SoulMeshCapability[] = [
  { id: 'cognitive-processing', version: '1.0', description: 'N02 cognitive processing services', request: true, response: true, events: true },
  { id: 'ai.generate', version: '1.0', description: 'N02 generative AI capability', request: true, response: true, events: false },
  { id: 'ai.multimodal', version: '1.0', description: 'N02 multimodal AI capability', request: true, response: true, events: false },
  { id: 'mesh.health', version: '1.0', description: 'N02 Mesh health probe', request: true, response: true, events: false },
  { id: 'mesh.describe', version: '1.0', description: 'N02 identity and capability discovery', request: true, response: true, events: false },
];
