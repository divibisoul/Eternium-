# SOUL — Unified Engineering Coordination Contract

This repository is N02, an independent AI nucleus cooperating through the single Soul Mesh.

Rules: GitHub is source of truth; preserve and adapt working code; audit before and after changes; do not stop structural work merely because runtime commissioning is unavailable; never create a second Mesh; each nucleus is an independent AI with agents, capabilities, tools, ingress, egress, discovery, delegation and response; authentication is separate from capability authorization; use the common identity/correlation/timestamp/nonce/HMAC contract where supported; do not duplicate existing modules; research viable alternatives before accepting a limitation.

Engineering pair order: N06↔N05 → N05↔N04 → N04↔N03 → N03↔N02 → N02↔N01. Runtime Mesh routing is not restricted by this order; the order defines engineering dependencies.

Two adjacent connection fronts may be developed simultaneously when changes do not conflict. A shared nucleus must remain compatible with both sides. Each front must leave a GitHub handoff containing source, target, connection, commit, changed files, findings, corrections, affected capabilities/agents/tools, dependencies, remaining work, compatibility status, next consumer and commissioning status.

Completion requires more than files or compilation: AI responsibility, agents, tools, capabilities, Mesh ingress/egress, discovery, delegation, correlation, authorization and failure handling must be structurally compatible. Runtime commissioning is tracked separately.

Optimize pairs multiplicatively: combine specialized agents/tools, reuse intermediate results, minimize latency and duplication, support parallel work and least privilege, and strengthen the three-nucleus chain when two adjacent pairs share a nucleus.

## CUMULATIVE MASTER DIRECTIVE

All previous engineering directives remain active. This section adds the master SOUL execution layer; it does not replace or invalidate the repository-specific contract above.

### Audit and failure loop
GitHub is the definitive implementation state. Before every mutation inspect current HEAD, relevant commits/branches, code, documentation, agents, capabilities, functions, tools, providers, input/output paths, Mesh, discovery, delegation, execution, tests, CI, dependencies, security and performance. Classify findings as correct, incomplete, fragile, disconnected, duplicated, mock, declared-but-unimplemented, implemented-but-unregistered, implemented-but-unexposed, implemented-but-unused, absent, or evolution opportunity. Every actionable finding becomes work:
DETECT → DIAGNOSE → RESEARCH → CORRECT → COMPLETE → CONNECT → OPTIMIZE → VALIDATE → DOCUMENT → RE-AUDIT.
Do not stop solely because an error is severe. Try technically appropriate alternatives and stop only on a demonstrated real blocker or proven-inappropriate change.

### Nucleus identity
N02 remains an independent AI with explicit identity, agents, capabilities, tools, providers, context, memory, execution, input, output, discovery, delegation, response and observability. It must know what it can execute, what it cannot execute, and how to obtain peer assistance.

### Mesh and topology
The Soul Mesh is the canonical interoperability layer, not merely transport. It must support discovery, capability discovery, routing, delegation, execution, response, correlation and composition. Each of the six nuclei must be prepared for five bidirectional peers, giving 15 unordered peer pairs and 30 directed logical links. Hybrid transports may use HTTP, realtime/WebSocket, events/Pub/Sub, loopback or internal adapters when justified; no duplicate Mesh may be created.

### Native fusion
Functions, agents, tools, providers and capabilities are first-class fusion assets. Transport-only connectivity is insufficient. When a capability is delegated, its real native executable path must be reachable, authorization-aware, observable and correlated. Existing functionality must be adapted before replacement.

### Synergy and emergence
For every pair evaluate agents × agents, tools × tools, capabilities × capabilities, context × context, execution × execution and AI × AI. Identify complementary chains, safe parallelism, duplicated responsibilities and evidence-based emergent capabilities. A new capability requires a real useful composition, explicit owner(s), agents, tools, input, processing, output, dependencies, execution mode, contract, registration, tests and documentation.

### Dynamic federation and routing
Support temporary task teams such as Planner, Researcher, Analyzer, Executor, Validator and Synthesizer, assigning each role to the best available nucleus/agent. Delegation flow is limitation detection → discovery → peer selection → delegation → correlated result → continued local execution. Route using specialization, capability fit, load, latency, availability, priority, cost, dependencies and reliability.

### Distributed Super GPU
Treat SOUL Super GPU / SOUL SuperCompute as a logical distributed parallel-processing fabric, not a physical GPU. Canonical pipeline:
TASK → DECOMPOSITION → SCHEDULER → CAPABILITY ROUTER → PARALLEL EXECUTION → RESULT AGGREGATION → VALIDATION → FINAL RESULT.
Use both inter-nucleus and intra-nucleus parallelism when dependencies permit. Reuse N02's native worker/execution resources and future pair capabilities instead of creating artificial duplicate workers.

### Cache, resilience and observability
Where safe, cache by capability, payload, context, model, tool, version and source nucleus. Mesh paths should support timeouts, retries/backoff, circuit breaking, correlation/tracing, validation, rate limiting, size limits, authentication, worker recovery and fallback as appropriate. The system must answer who is available, who can perform a capability, route chosen, agents/tools used, elapsed time, failures and fallbacks.

### Architectural memory and delivery evidence
Maintain durable cross-front handoffs with WHAT_CHANGED, WHAT_WAS_FOUND, WHAT_REMAINS and WHAT_NEXT_AGENT_SHOULD_DO, plus commit, branch, dependencies, elapsed time, verification evidence and commissioning state. Use health/coverage graphs as delivery decision aids, never as test substitutes. Evidence priority is live E2E > integration test > unit/build/typecheck/race validation > contract/schema > static inspection.

### Final N07 rule
N07 remains the last commissioning/fusion stage. Do not consume N07 implementation as proof of earlier readiness. First stabilize N06↔N05, N05↔N04, N04↔N03, N03↔N02 and N02↔N01; then perform the final N01↔N06↔N07 fusion, carrying forward stabilized ingress/egress, discovery, delegation, authorization, correlation, recovery, functions, tools, agents and capabilities.
