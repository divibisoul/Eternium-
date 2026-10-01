# N02 — Implementação dos 21 módulos antes catalog-only

**Branch:** `feat/implement-21-catalog-capabilities-2026-10-01`  
**PR:** #36  
**Estado:** implementação estrutural concluída na branch; validação CI real já passou em SHAs intermediários.

## Resultado

Os 21 IDs que estavam preservados em `data/capabilities.ts` sem executor agora possuem:
- declaração no contrato Soul Mesh;
- handler dedicado em `src/soul-mesh/handlers/`;
- registro no `N02AIProviderBridge`;
- entrada no `SoulMeshCapabilityExecutor` por meio do runtime existente;
- cobertura estrutural na suíte `N02CatalogOnlyHandlers.test.ts`.

Nenhum dos 8 executores previamente existentes foi removido ou substituído.

## Integração

A cadeia continua:

`Soul Mesh → N02CapabilityRuntime → N02AIProviderBridge → handler → provider/algoritmo nativo`

Não foi criado um segundo executor ou um segundo registry.

## Classes

### Percepção e fusão
- `multimodal_cortex`

### Autonomia e decisão
- `autonomous_embodiment`
- `strategic_planning`
- `emergent_cognition`
- `cot_drc`

### Ciência e modelagem
- `biomolecular_designer`
- `reality_synthesis`
- `einstein_reasoning`
- `einstein_quantum`

### Adaptação e evolução
- `adaptation_module`
- `ecas`
- `mlfg`
- `cot_area`

### Engenharia e aquisição de capacidade
- `scre`
- `skill_acquisition`
- `uci`

### Governança e segurança
- `ethical_governance`
- `strategic_defense`
- `existential_safety`

### Recursos
- `cot_arhd`

## Comportamento real

Handlers model-backed usam o pipeline Gemini/cognitivo real já existente no N02.

Handlers algorítmicos usam cálculo determinístico local quando isso pode ser feito sem infraestrutura externa:
- ARHD: energia espectral/DFT e alocação limitada;
- Quantum: normalização e entropia probabilística;
- AREA: população, elitismo e mutação determinística derivada de SHA-256;
- Adaptation: atualização STDP-style determinística.

Quando a funcionalidade exigiria um atuador físico ou backend externo inexistente no N02, o handler expõe esse limite explicitamente em vez de fabricar execução.

## Proveniência

Os handlers carregam comentários de proveniência. Onde a licença foi verificada diretamente, ela está registrada; onde o nome do repositório de referência não pôde ser resolvido com segurança, isso permanece declarado como pendência.

Não há cópia literal de código upstream nos handlers desta branch.

## Evidência CI

No SHA `3a281379ce71ab0ba89fdb6e68b4456367044bfb`, o workflow **N02 broad forensic reintegration #55** terminou com SUCCESS e:
- Broad capability ledger: SUCCESS;
- RGO contract test: SUCCESS;
- OctaCore boundary test: SUCCESS;
- artifact `n02-capability-ledger` publicado.

O ledger daquela execução registrou:
- 29 capacidades no catálogo;
- 29 caminhos executáveis;
- 0 `catalog-only`;
- 0 `declared-no-handler`.

Isso prova cobertura estrutural nessa revisão específica. Não constitui prova de que todos os providers remotos, endpoints ou atuadores físicos estejam online.

## Próximo nível

A etapa seguinte é transformar os handlers em capacidades interoperáveis entre núcleos:
- N02 → N07 para planejamento/decomposição;
- N02 → N03 para multimodalidade e conhecimento;
- N02 → N06 para skills/adaptação/algoritmos;
- N02 → SARA para governança/proveniência/evolução.

Essa fase deve preservar o owner nativo de cada capability.
