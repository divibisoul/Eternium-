# SOUL — N01–N06 Independent AI Directive

Each N01–N06 is an independent AI nucleus with its own agents and capabilities. Soul Mesh is the cooperation layer, not a parallel API layer.

Every nucleus must support the same cooperation primitives: identity, capability discovery, inbound Mesh requests, outbound delegation, correlated responses, and failure reporting.

A nucleus may execute its own capability or delegate work to another nucleus when the Capability Graph indicates that another node is better suited. Communication remains bidirectional and capability-driven.

This directive is additive to existing architecture. Existing providers, transports, protocols, bridges and runtimes are preserved and adapted rather than replaced.

## N02 reference implementation

N02 already has a Mesh protocol with source, target, capability, payload and correlationId, plus a capability executor wired to the real AI provider bridge. This is the reference pattern to propagate carefully to N01–N06. No parallel API architecture is introduced.
