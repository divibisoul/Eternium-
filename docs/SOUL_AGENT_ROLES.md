# N02 — agentes e responsabilidades locais

O registro executável permanece `src/soul-mesh/SoulMeshAgentRegistry.ts`; este documento somente explicita a divisão interna já produzida por `N02CapabilityRuntime.ts`.

| Agente | Responsabilidade | Capabilities atribuídas pelo runtime |
|---|---|---|
| N02.perception-agent | Processar entradas multimodais/perceptivas e as capacidades MPVS/ACAI. | `ai.multimodal`, `mpvs`, `acai` |
| N02.cognition-agent | Executar processamento cognitivo, BNCv2, CSAE e DCRS. | `cognitive-processing`, `neural.bnc_v2`, `cognitive.csae`, `resource.dcrs` |
| N02.code-audit-agent | Executar a capacidade de código/auditoria Einstein. | `einstein_code` |
| N02.neural-modeling-agent | Executar modelagem neural/ferramenta Neural Forge. | `neural_forge` |
| N02.scientific-discovery-agent | Executar descoberta científica ASC. | `asc` |
| N02.inference-agent | Executar geração e as capabilities N02 que não pertencem aos agentes especializados acima. | `ai.generate` e demais capabilities executáveis não especializadas |

**Autoridade:** o código de `N02CapabilityRuntime.ts` é a fonte executável. Não duplicar esses agentes no N07.

**Não pertence ao N02:** Clareira como capability proprietária, orquestração/fusão N07, ferramentas/documentos N04 ou memória/regeneração transversal SARA.
