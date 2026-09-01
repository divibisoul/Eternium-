# SOUL Antibody Protocol

This document is cumulative architectural policy for autonomous repair.

## Rule

Every discovered defect becomes an active repair candidate. A finding must be classified, investigated, repaired when technically safe, validated, and recorded before the work advances.

```text
DETECT
  ↓
CLASSIFY
  ↓
LOCATE EXISTING IMPLEMENTATION
  ↓
SOLUTION A
  ↓
VALIDATE
  ↓ if failed
SOLUTION B / ALTERNATIVE
  ↓
VALIDATE
  ↓
INTEGRATE
  ↓
TEST
  ↓
DOCUMENT
  ↓
SEARCH FOR NEW SYNERGY
```

## Non-negotiable behavior

- Do not merely report a missing, broken, disconnected, incomplete, duplicated, mocked, or unregistered capability.
- Preserve working behavior and prefer additive adapters over destructive rewrites.
- Never claim a test passed without evidence.
- If the first repair fails, investigate an alternative instead of stopping.
- Re-audit the affected boundary after each repair because a correction can expose a second-order defect.
- Every repair must be evaluated for N1×N2, N3×N4, N5×N6 and higher-level composition opportunities.

## Current N02 finding

The initial N02 Mesh envelope differed from N01's canonical `SoulMeshEnvelope`: N01 requires version `1.0`, message identity, nonce, correlation ID, typed messages and HMAC; the initial N02 adapter used a smaller legacy envelope. This was treated as a defect, not as a documentation-only gap.

The N02 branch was therefore repaired by aligning its protocol model to the canonical envelope and adding HMAC-SHA256 verification, clock-skew validation and nonce replay protection while retaining the existing Gemini execution path.

## Coordination state

- Nucleus: N02
- Connection: N01 ↔ N02
- Status: STRUCTURALLY REPAIRED; RUNTIME E2E PENDING
- Branch: `feature/n02-mesh-autonomous-adapter`
- Next: validate the exact N01/N02 signed-envelope exchange, then implement grounded capability/agent/tool composition.
