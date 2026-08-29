# Handoff — N01 ↔ N02

**Status:** active pair integration
**Protocol:** soul-mesh/1
**Contract:** 1.1.0

## Current objective

Turn transport interoperability into complementary AI/agent/tool execution in both directions.

## N01 contribution

N01 is the transport/orchestration reference and must expose its communication mechanisms without taking ownership of N02 capabilities.

## N02 contribution

N02 owns its agents and capabilities. Its Mesh endpoint already validates the canonical envelope and dispatches registered capabilities through the N02 agent runtime.

## Required pair behavior

1. N01 discovers N02 capabilities and agents.
2. N01 requests an N02-owned capability.
3. N02 executes it through its own agent/tool/runtime.
4. N02 returns a correlated result with provenance.
5. N01 composes that result with an N01-owned capability/tool where appropriate.
6. The same flow works N02 → N01.
7. No capability is silently duplicated merely to make the pair appear connected.

## Parallel-front rule

Other SOUL fronts may modify either nucleus at any time. Before changing this pair, read the latest commits and files in both repositories. This document is a coordination signal, not a substitute for source inspection.

## External research applied

GitHub Actions supports repository-triggered workflows, reusable workflows, workflow outputs and concurrency controls. These mechanisms can provide deterministic CI/handoff automation, while repository commits remain the durable cross-front communication channel. citeturn0search0turn0search7turn0search8

## Next task

Implement and verify the pair's capability/agent/tool composition layer without replacing the existing N02 runtime or N01 transport architecture.
