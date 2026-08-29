# SOUL N02 ↔ N01 — LIVE HANDOFF

## Shared operating rule
GitHub is the authoritative shared state for the six parallel engineering fronts. Before changing N02, inspect current N02 and the current N01 peer state. Never infer that another ChatGPT conversation has or has not completed work.

## Pair objective
N02 remains an independent AI nucleus with its own agents, tools and capabilities. N01 remains the reference communication architecture. Integration must be bidirectional and additive: each nucleus can offer its own capabilities and request complementary capabilities from the other without surrendering ownership or deleting local functionality.

## Active next task
Audit N02's real agent/tool/capability registry against N01's currently available communication and routing primitives, then implement a minimal composition/dispatch path that:
- preserves local N02 execution;
- identifies capability ownership;
- delegates only when the local nucleus needs complementary support;
- carries canonical request/response metadata and correlation;
- returns the actual capability result, not merely ping/ack;
- permits the inverse N01 → N02 path;
- documents the resulting contract for the next front.

## Mandatory handoff fields
COMMIT_SHA
BRANCH
FILES_CHANGED
CAPABILITIES_CHANGED
TOOLS_CHANGED
AGENTS_CHANGED
CONTRACT_CHANGES
DEPENDENCIES
VERIFIED_BY_GITHUB
NEXT_TASK
KNOWN_LIMITATIONS

## No false completion
Code inspection can establish structural readiness, but it must not be described as proven live E2E execution when runtime testing has not occurred.
