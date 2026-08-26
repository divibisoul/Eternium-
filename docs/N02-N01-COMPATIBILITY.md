# N02 ↔ N01 Compatibility

N02 is an independent AI nucleus. N01 is the reference communication fabric. This contract adapts N02 to that fabric without moving ownership of N02 capabilities.

## N02-owned capabilities
- cognitive-processing
- ai.generate
- ai.multimodal

Mesh health/describe are transport diagnostics/discovery and are not evidence of AI-to-AI execution.

## N02 runtime
`n02CapabilityRuntime` is the execution bridge. Existing N02 tools should register their real handlers in this runtime; the Mesh endpoint invokes those handlers rather than duplicating them.

## Required interoperability
N02 must accept N01-originated capability requests using the common `soul-mesh/1` envelope and return a correlated structured response/error. It must preserve N02 as the execution authority.

## N01 capabilities consumable by N02
N02 may consume N01-owned Android capabilities through the N01 fabric, subject to the same request/context/authorization contract:
- android.device_info
- android.battery
- android.memory
- android.network
- android.events

## Context and tools
Capability metadata must distinguish declared from executable capabilities. Tool metadata may be discovered without transferring credentials. Context must be explicit, scoped and serialized by contract; no implicit private-session export is permitted.

## Connection model
`DISCOVERABLE -> NEGOTIATED -> EXECUTABLE -> VERIFIED -> FUSED`.
A real capability transaction is required for VERIFIED; ping/health are only diagnostics.
