# N02 — AI / Mesh status
**Snapshot:** 2026-10-25 · **Inspected main SHA:** `1fec2ee2682fa962afb746d0cdc8fbcf398abf35`

## Native intelligence evidence
- `src/soul-mesh/N02AIProviderBridge.ts` connects the existing Gemini service, cognitive pipeline and domain-specific handlers.
- `src/soul-mesh/N02CapabilityRuntime.ts` wires handler implementations into a capability executor and checks that registered handlers have declared capabilities.
- The optional Ollama bridge makes a real provider request only when `OLLAMA_BASE_URL` and an `OLLAMA_MODEL` are configured.

## State
- **STRUCTURAL EVIDENCE:** model-backed inference and specialized capability handlers exist in source.
- **RUNTIME:** live provider invocation and end-to-end request/response have not been observed in this audit.
- **CI:** no check runs were returned for this exact main SHA; do not report PASS.
- **MESH:** current response shape, correlation and auth compatibility must be tested against each target nucleus.

## Next actions
1. Test bridge registration against the canonical capability registry, including unknown/missing capability rejection.
2. Verify Gemini path and optional Ollama path separately; missing Ollama configuration should block only that provider path.
3. Test one real N02 capability through Mesh and verify owner, result schema, HMAC and correlation ID.
4. Capture exact-head CI evidence before changing the release state.

A provider URL is an implementation detail of that provider adapter, not a requirement that every nucleus expose a hard-coded public URL.

**No code, main branch, or PR was changed by this status record.**
