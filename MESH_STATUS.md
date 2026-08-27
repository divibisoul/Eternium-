# N02 Mesh Status

Branch: `upgrade/n02-mesh-foundation-v1`

## Current state

| Item | Status | Evidence / note |
|---|---|---|
| N02 identity | 🟢 | Protocol `soul-mesh/1`, nucleus N02 |
| 5 IN channels | 🟢 | N01/N03/N04/N05/N06 ingress paths |
| 5 OUT channels | 🟢 | Peer fabric + HTTP request transport |
| Capability registry | 🟢 | Declared/executable separation |
| Gemini integration | 🟢 | Existing `@google/genai` pipeline preserved |
| Browser Gemini key exposure | 🟢 | Client no longer receives Gemini key; Vite server proxy owns the key |
| Supabase dependency | 🟢 | Legacy adapter retained but deprecated and delegated to HTTP |
| TypeScript configuration | 🟢 | TS extension imports and JSX configuration hardened |
| Peer authentication | 🟢 | Mandatory by default; `MESH_AUTH_DISABLED=true` is explicit dev escape hatch |
| Session personas | 🟢 | Persona context keyed by conversation/session/correlation ID |
| Agents | 🟢 | Existing four agent definitions are exposed through `agent.delegate` |
| ASASF | 🟡 | Existing UI/state machinery is present; Mesh exposes workflow execution over existing N02 capabilities. Native autonomous remediation remains a future runtime expansion |
| System orchestrator | 🟢 | Runtime decomposes tasks and executes locally or delegates to peer capabilities |
| `useAGI` routing | 🟢 | `ai.reason` routes to the orchestrator when explicitly requested |
| Diagnostics | 🟢 | Peer timing, event confirmation and invalid-token probes |
| N01 registration | 🟢 | N02 boot registration retained |
| N01↔N02 real E2E | 🟡 | Script is implemented; PASS requires both live endpoints and valid tokens at execution time |
| APK native transport | 🟡 | HTTP development adapter is retained; native Keystore/service integration remains APK work |

## Acceptance gate

N02 is **not declared closed** until CI is green and `npm run test:integration` reports four PASS results against live N01/N02 endpoints.

No N01, N03, N04, N05 or N06 source files are intentionally modified by this N02 branch.
