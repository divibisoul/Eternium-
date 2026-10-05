# N02 — Resilience Dashboard

Fonte: branch forense baseada no HEAD real do PR #1 (`upgrade/n02-hybrid-soul-mesh-v2`).

## SLIs

| SLI | Fonte | Alerta | Resposta |
|---|---|---:|---|
| peer failure rate | `meshResilience.snapshot()` | >5%/5min | isolar peer |
| retry rate | `metrics.retries / requests` | >10%/5min | revisar latência/disponibilidade |
| circuit opens | `metrics.circuitOpens` | >=1/5min | interromper cascata e investigar |
| fallback rate | `metrics.fallbacks` | >5%/5min | revisar provedor/fallback |
| last latency | `lastLatencyMs` | acima do SLO do peer | revisar capacidade |
| recovery time | `totalRecoveryMs / recoveryCount` | >30s | escalonar incidente |
| contract failures | `failuresByKind` correlation/identity/validation | qualquer S1 | bloquear retry cego |

## Estados

`closed → open → half-open → closed`

Falhas de contrato permanecem não-retryable. Operações não idempotentes não recebem retry automático.

## Chaos

O cenário `scripts/test-mesh-resilience.ts` injeta falha de rede, prova retry limitado, abertura do circuito, recuperação e emissão dos SLIs Prometheus.

## Segurança

`scripts/test-mesh-security.ts` prova replay detection, clock skew e adulteração de payload, capability, kind e type sem assinatura válida.

## Blast radius

A ação automática é limitada ao peer/capability afetado. Promoção para `main` exige CI, Security e validação de integração.
