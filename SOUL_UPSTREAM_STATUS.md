# N02 — Public upstream integration status
**Snapshot:** 2026-10-25 · **Inspected N02 main:** `1fec2ee2682fa962afb746d0cdc8fbcf398abf35`  
**Audit branch:** `audit/ai-nucleus-status-2026-10-25`

## Additional similarity-selected sources
N02's `.gitmodules` pins 13 entries under `external/upstream/*`. Three overlap the canonical N07 upstream registry (CrewAI, Microsoft Agent Framework and SuperAGI); ten add distinct upstream projects.

| Public source | Pinned SHA | N02 triage assignment | State / gate |
|---|---|---|---|
| [BRAIN](https://github.com/shivamtyagi18/BRAIN) | `8d4201f72373156165ebc646c5064991fd3ad94a` | multimodal cortex → N03 | TRIAGED; no tested adapter |
| [GENesis-AGI](https://github.com/WingedGuardian/GENesis-AGI) | `a85f630a09c6cd38be1b5f8379ce309be41d0b72` | autonomous embodiment → N07 | TRIAGED; autonomy must retain SOUL policy/budget gates |
| [nanobot](https://github.com/HKUDS/nanobot) | `d3d70f20655bce5d3c7a017bfbe803efe09a2438` | biomolecular designer → N06 | TRIAGED; domain handler and safety proof missing |
| [Syntra Kernel](https://github.com/gd2bk1ng/syntra_kernel) | `755d8ceb0e81c3015329bfc0b01b01e606b44d7a` | reality synthesis → N07 | TRIAGED; Rust/runtime bridge unverified |
| [CrewAI](https://github.com/crewAIInc/crewAI) | `fbcf2de39d3f8252500b74a0751b92c5774c751b` | SCRE / Einstein quantum | Different pin from N07; version compatibility gate |
| [PraisonAI](https://github.com/MervinPraison/PraisonAI) | `bb470c786b63a6a8d5e5f3abcfc6080f1a8832f1` | EUS → N06 | TRIAGED; no isolated runtime proof |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | `e8c97320ac8691d4de92af49f98459f9ef9ddb08` | UCI → N04 | TRIAGED; very high upstream churn, require isolation/API contract |
| [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) | `f1fb145c4d80191aa86b3480d12112d828233763` | strategic defense → N07 | Different pin from N07; reconcile before sharing runtime assumptions |
| [SuperAGI](https://github.com/TransformerOptimus/SuperAGI) | `c3c1982e7bd6a11cfed53c5a193ea502f924b1b6` | MLFG / skill acquisition → N06 | Source pinned; real handler transaction not proven |
| [HASHIRU](https://github.com/HASHIRU-AI/HASHIRU) | `de2b514572dbad8625d974e5ff26587ab805502b` | strategic planning → N07 | `BLOCKED_LICENSE`; GitHub license metadata missing; security review required before runtime |
| [Codette Reasoning](https://github.com/Raiff1982/Codette-Reasoning) | `1608092a2862ce8070210db37e57f04ac8717965` | ethical governance / Einstein reasoning → SARA | `BLOCKED_LICENSE` for commercial packaging: CSAL 1.0 is non-commercial, not MIT |
| [Chyren-Selin](https://github.com/Mega-Therion/chyren-selin) | `dd5a633831e3779077736836c474a2dc75737a10` | existential safety / COT-AHRD → SARA/N07 | `BLOCKED_REF_RESOLUTION`; GitHub API redirects; do not change the pin until canonical URL is verified |
| [Xun](https://github.com/MenxLi/xun) | `129065cb94748d6a9e8cbe6b51d8f46d8bbeae80` | UCI / emergent cognition → N04 | `BLOCKED_LICENSE`; license metadata missing, verify terms before bundling |

## N02's other seven submodules
The `integrations/soul-upstream/*` entries share upstream projects with the canonical SOUL catalog: AgentScope, Browser Use, LangGraph, MetaGPT, OpenHands, smolagents and Superpowers. They are additional references, not seven more distinct frameworks.

## Code and wiring evidence

- `src/soul-mesh/N02AIProviderBridge.ts` connects existing Gemini service, cognitive pipeline and domain handlers. `N02CapabilityRuntime.ts` attaches those handlers to the canonical executor.
- `docs/N02-EXTERNAL-OPEN-SOURCE-REGISTRY.json` preserves source pins and function mappings; `docs/N02-OSS-TRIAGE-ROUTING.json` contains 21 mappings, all marked `TRIAGED`.
- `src/soul-mesh/N02OssTriage.test.ts` tests the presence of mappings and valid owner IDs, not execution of these repositories. Therefore no public upstream in this extra set is promoted to a runtime capability based on this catalog.
- CrewAI and Microsoft Agent Framework use pins that differ from N07. Keep both existing source references until compatibility tests select a consistent adapter contract.
- Do not automatically add the 10 new sources to N07's 16-provider registry. The current N07 validator requires registry, adapters and ownership IDs to match exactly; each added source needs an explicit adapter, owner, security gate and tests first.

**Gate:** these 13 N02 entries are `TRIAGED / SOURCE_PINNED`, not `CONNECTED` or `RUNTIME_VERIFIED`.
