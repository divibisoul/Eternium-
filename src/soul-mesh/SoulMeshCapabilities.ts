export type SoulMeshCapability = {
  id: string;
  version: string;
  description: string;
  request: boolean;
  response: boolean;
  events: boolean;
  execution: 'native' | 'cognitive-runtime';
};

const native = (id: string, description: string): SoulMeshCapability => ({ id, version: '2.0', description, request: true, response: true, events: true, execution: 'native' });
const cognitive = (id: string, description: string): SoulMeshCapability => ({ id, version: '2.0', description, request: true, response: true, events: true, execution: 'cognitive-runtime' });

export const SOUL_MESH_CAPABILITIES: SoulMeshCapability[] = [
  native('mesh.ping', 'Verifica conectividade N02↔peer e preserva correlationId.'),
  native('mesh.describe', 'Descreve identidade, peers, canais e capacidades do N02.'),
  native('capability.list', 'Lista capacidades que o N02 anuncia no Mesh.'),
  cognitive('cognitive.process', 'Executa processamento cognitivo no runtime real do N02.'),
  cognitive('gemini-inference', 'Executa inferência Gemini através do runtime do N02.'),
  cognitive('reasoning', 'Raciocínio analítico remoto através do runtime do N02.'),
  cognitive('planning', 'Planejamento remoto através do runtime do N02.'),
  cognitive('multimodal-analysis', 'Análise multimodal remota através do runtime do N02.'),
  cognitive('mpvs', 'Percepção multimodal delegada ao runtime cognitivo do N02.'),
  cognitive('multimodal_cortex', 'Processamento multimodal unificado do N02.'),
  cognitive('eus', 'Unificação epistemológica via runtime cognitivo.'),
  cognitive('ecas', 'Síntese arquitetural cognitiva via runtime.'),
  cognitive('asc', 'Pesquisa/hipótese científica assistida pelo runtime.'),
  cognitive('einstein_reasoning', 'Raciocínio científico assistido pelo runtime.'),
  cognitive('einstein_code', 'Análise de código assistida pelo runtime.'),
  cognitive('einstein_quantum', 'Raciocínio/simulação conceitual assistida pelo runtime.'),
  cognitive('neural_forge', 'Projeto neural assistido pelo runtime.'),
  cognitive('csae', 'Arquitetura cognitiva assistida pelo runtime.'),
  cognitive('dcrs', 'Planejamento de recursos assistido pelo runtime.'),
  cognitive('adaptation_module', 'Adaptação operacional assistida pelo runtime.'),
  cognitive('scre', 'Refatoração assistida pelo runtime; execução de escrita continua protegida por revisão.'),
  cognitive('mlfg', 'Meta-learning assistido pelo runtime.'),
  cognitive('cot_arhd', 'Alocação hiper-dinâmica assistida pelo runtime.'),
  cognitive('cot_drc', 'Decomposição cognitiva assistida pelo runtime.'),
  cognitive('cot_area', 'Evolução algorítmica assistida pelo runtime.'),
  cognitive('emergent_cognition', 'Síntese de cognição emergente assistida pelo runtime.'),
  cognitive('ethical_governance', 'Auditoria ética assistida pelo runtime.'),
  cognitive('biomolecular_designer', 'Raciocínio biomolecular assistido pelo runtime.'),
  cognitive('strategic_planning', 'Planejamento estratégico assistido pelo runtime.'),
  cognitive('existential_safety', 'Avaliação de segurança assistida pelo runtime.'),
  cognitive('skill_acquisition', 'Planejamento de aquisição de habilidades assistido pelo runtime.'),
  cognitive('reality_synthesis', 'Síntese conceitual de realidade assistida pelo runtime.'),
];
