# N06 Runtime Integration Ledger

Canonical runtime endpoint: `/api/soul-mesh` (`api/soul-mesh.ts`).

N06 is the cognitive/synthesis nucleus. It exposes real mesh handling and delegates supported cognitive capabilities to its task executor. It does not own an AI model; AI inference is supplied through the hybrid AI session/provider boundary.

E2E status remains deployment-dependent. Never promote source-level readiness to live connectivity.

Required proof: valid channel -> transport -> N06 runtime -> real handler/task executor -> correlated response -> capability result.

Existing capabilities must be preserved; repairs may replace broken implementations but must not silently remove capability surface.
