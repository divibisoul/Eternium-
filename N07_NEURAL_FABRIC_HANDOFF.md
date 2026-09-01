# N07 Neural Fabric Handoff

N07 is the canonical orchestration/neural service. N02 retains its native responsibilities and consumes shared neural services through Soul Mesh.

Contract: `soul-mesh/1`, `1.1.0`; operations `neural.forward@1.0.0`, `neural.learn@1.0.0`.

Preserve correlationId, bounded numeric payloads, nonce/HMAC, deadline and explicit errors. Read current N07 `main` before changes; concurrent fronts may change the same bridge.

WHAT_CHANGED: shared neural-fabric bridge synchronized with N07.
WHAT_REMAINS: exact-head CI and live bidirectional commissioning.
WHAT_NEXT_AGENT_SHOULD_DO: validate N02 bridge against N07 canonical payload and response contracts; never duplicate N07 neural runtime.
