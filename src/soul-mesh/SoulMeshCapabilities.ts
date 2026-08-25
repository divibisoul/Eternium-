export type SoulMeshCapability = { id: string; version: string; description: string; request: boolean; response: boolean; events: boolean };
export const SOUL_MESH_CAPABILITIES: SoulMeshCapability[] = [{ id: 'cognitive-processing', version: '1.0', description: 'Cognitive processing services', request: true, response: true, events: true }];
