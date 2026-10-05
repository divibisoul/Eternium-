# N02 Baseline — Structural Recovery

Branch: `upgrade/n02-capability-foundation-v1`
Baseline source: `main`

## Confirmed runtime

- N02 is a Vite + React application, not a Next.js application.
- `package.json` contains React 19, Vite 6 and `@google/genai`.
- The repository already contains a substantial Soul Mesh implementation under `api/`, `lib/soul-mesh/` and `src/soul-mesh/`.
- The existing N02 AI bridge delegates to `services/geminiService.ts`.
- The Gemini service directly constructs `GoogleGenAI` from `process.env.API_KEY` and uses `gemini-2.5-flash`.

## Existing Mesh assets

- `api/soul-mesh.ts` exposes a POST mesh handler with peer validation, payload-size protection and an optional bearer token.
- `api/soul-mesh/discovery.ts` contains static peer discovery and an N01 registration helper.
- `api/soul-mesh/peer-client.ts` implements N02 outbound requests, retries, timeouts, peer description and ping operations.
- `src/soul-mesh/SoulMeshProtocol.ts` already defines `SoulMeshMessage`, `SoulMeshTransport` and message validation.
- `src/soul-mesh/N01N02HybridLink.ts` already provides an N02-side bidirectional N01 link.
- `src/soul-mesh/SoulMeshCapabilities.ts` already declares N02 capabilities.
- `src/soul-mesh/N02CapabilityRuntime.ts` already binds declared capabilities to the existing AI provider bridge.

## Recovery findings

1. Capability discovery already has a foundation; the new `/api/capabilities` endpoint exposes the existing declarations instead of inventing a second capability registry.
2. The repository contains multiple Mesh protocol representations. `src/soul-mesh/endpoint.ts` currently uses a legacy shape whose `timestamp` is typed as `string`, while `SoulMeshProtocol.ts` and `api/soul-mesh.ts` use numeric timestamps. This is a compatibility defect to resolve during the Envelope/HMAC phase, not by deleting either implementation now.
3. N02's current AI path is Gemini-coupled through `services/geminiService.ts`. The provider abstraction will therefore be introduced only after capability discovery and Mesh compatibility are verified.
4. The root `geminiService.ts` is an empty file; the active implementation is `services/geminiService.ts`.
5. Existing CI currently typechecks `src/soul-mesh/endpoint.ts` only and builds the Vite application. The new capability endpoint must be included in verification as the N02 foundation evolves.

## Phase-0 invariant

No existing Mesh or AI implementation is deleted. New capability discovery is additive and reports runtime executability from the existing N02 capability registry.
