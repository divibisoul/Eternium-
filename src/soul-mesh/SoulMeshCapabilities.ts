export type SoulMeshCapability = {
  id: string; version: string; description: string; request: boolean; response: boolean; events: boolean; owner: 'N02'; context?: string[]; tools?: string[];
};
export const SOUL_MESH_CAPABILITIES: SoulMeshCapability[] = [
  { id:'mesh.echo', version:'1.0', description:'Mesh diagnostic echo', request:true, response:true, events:true, owner:'N02' },
  { id:'mesh.health', version:'1.0', description:'N02 health probe', request:true, response:true, events:false, owner:'N02' },
  { id:'mesh.describe', version:'1.0', description:'N02 identity and capability discovery', request:true, response:true, events:false, owner:'N02' },
  { id:'ai.reason', version:'1.1', description:'Language reasoning through the existing Gemini cognitive pipeline', request:true, response:true, events:false, owner:'N02', context:['request','conversation'], tools:['gemini'] },
  { id:'ai.generate', version:'1.1', description:'General generation through the existing Gemini cognitive pipeline', request:true, response:true, events:false, owner:'N02', context:['request','conversation'], tools:['gemini'] },
  { id:'ai.multimodal', version:'1.1', description:'Multimodal generation through the existing Gemini cognitive pipeline', request:true, response:true, events:false, owner:'N02', context:['request','conversation','image','audio'], tools:['gemini'] },
  { id:'ai.search', version:'1.1', description:'Web-grounded research through Gemini Google Search grounding', request:true, response:true, events:false, owner:'N02', context:['request','web'], tools:['googleSearch'] },
  { id:'ai.transcribe', version:'1.1', description:'Audio transcription through the existing Gemini multimodal service', request:true, response:true, events:false, owner:'N02', context:['audio'], tools:['gemini'] },
  { id:'ai.analyze', version:'1.1', description:'Image analysis through the existing Gemini multimodal pipeline', request:true, response:true, events:false, owner:'N02', context:['image'], tools:['gemini'] },
  { id:'cognitive-processing', version:'1.1', description:'Cognitive processing through the existing N02 cognitive pipeline', request:true, response:true, events:false, owner:'N02', context:['request','conversation'], tools:['gemini'] },
  { id:'system.orchestrate', version:'1.1', description:'Distributed task orchestration using local N02 capabilities and Mesh delegation', request:true, response:true, events:false, owner:'N02', context:['task','planning','mesh'] },
  { id:'persona.switch', version:'1.1', description:'Selects an N02 persona within an isolated session context', request:true, response:true, events:false, owner:'N02', context:['persona','session'] },
  { id:'agent.delegate', version:'1.0', description:'Activates one of the existing N02 agent definitions for a task', request:true, response:true, events:false, owner:'N02', context:['agent','task'] },
  { id:'asasf.execute', version:'1.0', description:'Executes an ASASF workflow as a sequence of existing N02 capabilities', request:true, response:true, events:true, owner:'N02', context:['workflow','remediation'] },
];
