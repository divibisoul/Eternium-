# N02 ↔ N01 Compatibility

N02 is an independent AI nucleus. N01 is the reference communication fabric. This contract adapts N02 to that fabric without moving ownership of N02 capabilities.

## N02-owned capabilities
- cognitive-processing
- ai.generate
- ai.multimodal

Mesh health/describe are transport diagnostics/discovery and are not evidence of AI-to-AI execution.

## N02 runtime
`n02CapabilityRuntime` is the execution bridge. Existing N02 tools should register their real handlers in this runtime; the Mesh endpoint invokes those handlers rather than duplicating them.

## Required interoperability
N02 must accept N01-originated capability requests using the common `soul-mesh/1` envelope and return a correlated structured response/error. It must preserve N02 as the execution authority.

## N01 capabilities consumable by N02
N02 may consume N01-owned Android capabilities through the N01 fabric, subject to the same request/context/authorization contract:
- android.device_info
- android.battery
- android.memory
- android.network
- android.events

## Context and tools
Capability metadata must distinguish declared from executable capabilities. Tool metadata may be discovered without transferring credentials. Context must be explicit, scoped and serialized by contract; no implicit private-session export is permitted.

## Connection model
`DISCOVERABLE -> NEGOTIATED -> EXECUTABLE -> VERIFIED -> FUSED`.
A real capability transaction is required for VERIFIED; ping/health are only diagnostics.


## Verified runtime binding and bidirectional process-pair test

The standalone Node listener is the active HTTP entrypoint for this PR. It binds both `POST /api/soul-mesh` and the compatibility ingress `POST /mesh/in` to the existing `api/soul-mesh.ts` handler, which calls `n02CapabilityRuntime`. `GET /mesh/discovery` reports the runtime's actual executable capability list; the former unbound-listener response is not used as an execution substitute.

The N02-owned diagnostic capability `mesh.peer.ping` proves that N02 can originate a request from its own server process to N01 through the existing peer client, with HMAC-authenticated correlated responses. CI starts the real N01 and N02 server processes separately, uses an ephemeral shared secret, validates the N01→N02 request and N02→N01 callback, and shuts both processes down. This is a local process-pair E2E, not a claim that a public production deployment is reachable.

## URL scope must not be mixed

- N01 runtime variable `SOUL_MESH_N02_URL`: N02 base URL without `/api/soul-mesh`; the N01 gateway appends the route.
- N02 server/runtime variable `SOUL_MESH_N01_URL`: full N01 endpoint, including `/api/soul-mesh`; the N02 peer client posts to the configured URL unchanged.
- N02 GitHub Actions variable `vars.SOUL_MESH_N01_URL`: N01 base URL without `/api/soul-mesh`, because the public commissioning script appends the route itself.
- The shared runtime secret is named `SOUL_MESH_SECRET` on N01 and `SOUL_MESH_HMAC_SECRET` on N02/Actions. Values must match exactly and must never be committed.

Public production E2E remains unverified until a real public N01 endpoint and matching runtime secret configuration exist; a skipped public deployment gate is not a pass.
