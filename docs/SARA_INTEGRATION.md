# N02 ↔ SARA

N02 exposes SARA regenerative operations through the existing /api/soul-mesh boundary.

Capabilities: sara.cycle, sara.audit, sara.regenerate, sara.state, sara.capabilities.

Server configuration: SARA_SERVICE_URL, SARA_SERVICE_TOKEN, SARA_REQUEST_TIMEOUT_MS.

The adapter preserves correlationId and uses Bearer authentication. Missing configuration returns an explicit SARA_SERVICE_NOT_CONFIGURED error; no fallback result is synthesized.

Native N02 capabilities remain owned by N02. SARA adds audit/regeneration/evidence around the federated operation.