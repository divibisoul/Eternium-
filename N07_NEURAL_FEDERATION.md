# N02 → N07 Neural Federation

N02 exposes its neural workloads through `src/soul-neural/N07NeuralBridge.ts`. The bridge sends `neural.forward@1.0.0` and `neural.learn@1.0.0` through Soul Mesh contract `1.1.0`, using HMAC-SHA256, correlation, nonce, timeout and finite-value validation.

N02 retains ownership of its native capabilities while N07 provides the shared neural processing path. This change is additive and designed to coexist with concurrent fronts.
