# Aeternum N02 — Linguistic / Audio / Research Core

N02 is an independent AI nucleus and a bidirectional member of the six-nucleus Soul Mesh. This branch changes N02 only.

## Mesh

- Protocol: `soul-mesh/1`
- Local nucleus: `N02`
- Peers: `N01`, `N03`, `N04`, `N05`, `N06`
- IN: `POST /mesh/in/N01`, `/N03`, `/N04`, `/N05`, `/N06`
- OUT: `N02_OUT_N01` … `N02_OUT_N06`
- Development transport: HTTP/Vite; native Android transport remains an APK-stage adapter.

## Capabilities

| Capability | Runtime behavior |
|---|---|
| `mesh.echo` | correlated diagnostic echo |
| `mesh.health` | health probe |
| `mesh.describe` | identity + declared/executable capability discovery |
| `ai.reason` | existing Gemini cognitive pipeline; `useAGI:true` routes to N02 orchestrator |
| `ai.search` | Gemini with Google Search grounding |
| `ai.transcribe` | existing Gemini audio transcription |
| `ai.analyze` | existing Gemini multimodal image path |
| `system.orchestrate` | decomposes a task into executable steps; runs local capabilities or delegates through Mesh |
| `persona.switch` | session-scoped persona selection using conversation/session/correlation ID |
| `agent.delegate` | activates the four existing agent definitions: `null_sentinel`, `oracle`, `architect`, `weaver` |
| `asasf.execute` | executes an explicitly supplied ASASF workflow through existing executable N02 capabilities |

Compatibility aliases remain: `ai.generate`, `ai.multimodal`, `cognitive-processing`.

## Authentication

Authentication is **mandatory by default**. Every N02 ingress peer must have its corresponding `SOUL_MESH_<PEER>_TOKEN` configured and send `Authorization: Bearer <token>`. Missing or invalid tokens return `401`.

For isolated development only, `MESH_AUTH_DISABLED=true` disables the requirement. Never use that setting for production.

Peer tokens and the Gemini key are not injected into the browser bundle. Gemini calls from the browser go through the Vite server-side cognitive proxy. APK deployment must use Android secure storage/Keystore for secrets.

## N01 registration

At boot N02 calls `POST <SOUL_MESH_N01_URL>/soul-mesh/register` with the N02 manifest. A successful registration is persisted in the `soul-mesh-n02` IndexedDB peer store. N02 remains independently usable if N01 is unavailable.

Development variables:

- `GEMINI_API_KEY` (preferred) or `API_KEY` — server-side Gemini credential
- `SOUL_MESH_N01_URL`, `SOUL_MESH_N02_URL`, and other peer URLs
- `SOUL_MESH_N01_TOKEN` … `SOUL_MESH_N06_TOKEN` — server-side peer credentials
- `MESH_AUTH_DISABLED=true` — explicit development-only authentication escape hatch
- `N02_AI_PROVIDER=ollama`, `OLLAMA_URL`, `OLLAMA_MODEL` — optional local provider

## Diagnostics

```bash
npm run mesh:diagnose
npm run mesh:diagnose -- --verbose
```

The diagnostic reports registered peers, per-peer health latency, event confirmation and invalid-token probes. A remote `PASS` is not simulated: the target endpoint must actually respond.

## N01 ↔ N02 integration test

With both endpoints online and valid credentials configured:

```bash
npm run test:integration
```

The test exercises:

1. N01 → N02 `ai.reason`
2. N02 → N01 `mesh.echo`
3. N01 → N02 `persona.switch`
4. N01 → N02 `system.orchestrate`

Every response is checked for HTTP success, source/target correctness and matching `correlationId`.

## Architecture

```text
N01/N03/N04/N05/N06
        │
        ▼
 N02 authenticated ingress
        │
        ▼
 Capability Executor
        │
   ┌────┼───────────────┐
   ▼    ▼               ▼
  AI   Agents        ASASF workflow
   │    │               │
   └────┴──────┬────────┘
                ▼
       System Orchestrator
          │          │
          ▼          ▼
       local N02   remote peer
```

## Scope and verified status

The N02 repository contains real UI definitions for Agents and ASASF and an existing React `useSystemOrchestrator` hook, but that hook contains simulated boot timers and is not a remote execution API. The Mesh activation therefore uses the real agent definitions and existing N02 executable capabilities without pretending the UI hook is a distributed runtime.

See `MESH_STATUS.md` for the authoritative acceptance ledger. N02 is not considered closed until CI is green and the four live N01↔N02 integration tests pass.
