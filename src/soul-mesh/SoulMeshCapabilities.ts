export type SoulMeshCapability = {
  id: string; version: string; description: string; request: boolean; response: boolean; events: boolean; owner: 'N02'; context?: string[]; tools?: string[];
};
export const SOUL_MESH_CAPABILITIES: SoulMeshCapability[] = [
  { id:'mesh.echo', version:'1.0', description:'Mesh diagnostic echo', request:true, response:true, events:true, owner:'N02' },
  { id:'mesh.health', version:'1.0', description:'N02 health probe', request:true, response:true, events:false, owner:'N02' },
  { id:'mesh.describe', version:'1.0', description:'N02 identity and capability discovery', request:true, response:true, events:false, owner:'N02' },
  { id:'ai.reason', version:'1.0', description:'Language reasoning through the existing Gemini cognitive pipeline', request:true, response:true, events:false, owner:'N02', context:['request','conversation'] },
  { id:'ai.search', version:'1.0', description:'Web-grounded research through Gemini Google Search grounding', request:true, response:true, events:false, owner:'N02', context:['request','web'], tools:['googleSearch'] },
  { id:'ai.transcribe', version:'1.0', description:'Audio transcription through the existing Gemini multimodal service', request:true, response:true, events:false, owner:'N02', context:['audio'] },
  { id:'ai.analyze', version:'1.0', description:'Image analysis through the existing Gemini multimodal pipeline', request:true, response:true, events:false, owner:'N02', context:['image'] },
  { id:'system.orchestrate', version:'1.0', description:'Structured task orchestration using the N02 cognitive pipeline', request:true, response:true, events:false, owner:'N02', context:['task','planning'] },
  { id:'persona.switch', version:'1.0', description:'Selects the active N02 persona for subsequent reasoning', request:true, response:true, events:false, owner:'N02', context:['persona'] },
];
