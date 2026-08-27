# Aeternum N02 — Linguistic / Audio / Research Core

N02 is an independent AI nucleus built around Gemini 2.5 Flash. It remains independently deployable while becoming a bidirectional member of the six-nucleus Soul Mesh.

## Mesh identity

- Protocol: `soul-mesh/1`
- Local nucleus: `N02`
- Peers: `N01`, `N03`, `N04`, `N05`, `N06`
- 5 IN channels: `POST /mesh/in/N01`, `/mesh/in/N03`, `/mesh/in/N04`, `/mesh/in/N05`, `/mesh/in/N06`
- 5 OUT channels: `N02_OUT_N01` … `N02_OUT_N06`, resolved from discovery
- Transport: HTTP today; the protocol/transport boundary is kept technology-neutral for future WebSocket/Android adapters.

Vite's `configureServer` hook is used for development HTTP ingress. This is a real HTTP server-side middleware, not a browser-only fake route. Production APK deployment will replace this host adapter with a native Android service.

## Executable capabilities

| Capability | Function |
|---|---|
| `mesh.echo` | diagnostic echo |
| `mesh.health` | health response |
| `mesh.describe` | identity and capability discovery |
| `ai.reason` | Gemini reasoning |
| `ai.search` | Gemini reasoning with Google Search grounding |
| `ai.transcribe` | audio → Portuguese text |
| `ai.analyze` | image analysis |
| `system.orchestrate` | decomposes a task into verifiable steps |
| `persona.switch` | selects the active N02 persona |

The legacy names `ai.generate`, `ai.multimodal` and `cognitive-processing` remain registered as compatibility aliases.

## Authentication

Each incoming channel may require `Authorization: Bearer <peer-token>`. Development tokens are supplied server-side through `SOUL_MESH_N01_TOKEN`, `SOUL_MESH_N03_TOKEN`, etc. Outbound tokens are read from the same environment and, after registration with N01, the N01 token is persisted in the browser IndexedDB store `soul-mesh-n02`.

Never commit secrets. The browser build must not expose production peer tokens; the Android implementation should use secure storage/Keystore.

## N01 registration

At boot N02 attempts `POST <SOUL_MESH_N01_URL>/soul-mesh/register` with its machine-readable manifest and endpoint. If N01 is unavailable, the app remains independently usable and retries can be initiated by the host lifecycle.

Required development variables:

- `GEMINI_API_KEY` — preferred Gemini key
- `API_KEY` — legacy fallback
- `SOUL_MESH_N01_URL` — N01 base URL
- `SOUL_MESH_N02_URL` — N02 endpoint/base URL
- `SOUL_MESH_N01_TOKEN` — development token when N01 requires it
- `SOUL_MESH_N03_URL`, `SOUL_MESH_N04_URL`, `SOUL_MESH_N05_URL`, `SOUL_MESH_N06_URL` — peer URLs when those nuclei are available
- corresponding `SOUL_MESH_Nxx_TOKEN` variables for authenticated outbound calls

Optional local model:

- `N02_AI_PROVIDER=ollama`
- `OLLAMA_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=gemma3:4b`

Ollama is a fallback provider only; `ai.search` requires Gemini Google Search grounding and therefore should remain on Gemini when web research is requested.

## Diagnostics

Run:

```bash
npm run mesh:diagnose
```

This starts the Vite host so the N02 Mesh diagnostics can run in the browser context where IndexedDB exists. The diagnostic path checks the persisted peer registry, outbound `mesh.health`/`mesh.echo`, and authenticated ingress. Real PASS results for a remote peer require that peer to be online; unavailable peers are reported rather than simulated as connected.

## Architecture

```text
N01 ───────┐
N03 ───────┤
N04 ───────┤→ N02 Mesh Ingress → SoulMeshCapabilityExecutor → N02 AI services
N05 ───────┤             ↑
N06 ───────┘             │
                        N02 Router → discovery → HTTP OUT → peers
```

N02 preserves its own Gemini/persona/audio capabilities. The Mesh exposes those capabilities to N01 and the other nuclei without turning N02 into a passive UI component.

## FULL COGNITION

A `fullCognition` request is recognized only when the authenticated message source is N01. It is treated as a request for expanded reasoning, **not as permission to disable provider safety controls**. Other peers cannot elevate this mode by setting the flag.

## Current status

- 5 IN logical channels: installed
- 5 HTTP IN development endpoints: installed
- 5 OUT channel definitions: installed
- discovery persistence: installed
- N01 boot registration: installed
- per-peer Bearer validation: installed
- executable capabilities: installed
- Gemini key priority: `GEMINI_API_KEY`, fallback `API_KEY`
- optional Ollama provider: installed
- N02-only scope: preserved
- real N02↔N01/N03/N04/N05/N06 end-to-end communication: **pending until those peer endpoints are online**

No other nucleus is modified by this N02 branch.
