# N02 — Auditoria Forense / Regra de Ouro

Base: `upgrade/n02-hybrid-soul-mesh-v2` (PR #1). Esta frente adiciona apenas endurecimento e transformação generativa sobre a implementação já existente.

## Achados e correções

- HMAC agora cobre o envelope semântico completo: protocolo, versão, id, origem, destino, kind, capability, timestamp, nonce, correlationId, type, ttl e payload.
- A suíte existente de segurança ganhou regressões para adulteração de capability, kind e type, além de replay e clock skew.
- O retry Mesh já existente foi mantido; o backoff passou a usar jitter seguro.
- Métricas de latência e tempo de recuperação do circuito foram adicionadas ao `MeshResilienceController` e Prometheus.
- Registros forenses passaram a redigir Bearer tokens e URLs antes de retenção.
- Dependência de runtime `@supabase/supabase-js` foi declarada explicitamente.
- A distinção entre capacidade declarada e capacidade executável permanece preservada pela arquitetura existente.

## Loop generativo

`falha → assinatura → contenção → causa-raiz → correção → teste → SLI → chaos → runbook → nova validação`

## FMEA / 5 Porquês

**S1 — adulteração semântica de mensagem:** o HMAC anterior não cobria capability/kind/type. A causa-raiz era uma canonicalização incompleta. A correção vincula a assinatura a todo o envelope semântico e cria teste ofensivo.

**S2 — recuperação sem sinal de qualidade:** o breaker existia, mas latência/recuperação não eram observáveis. A causa-raiz era telemetria incompleta. A correção adiciona SLIs Prometheus e métricas por peer.

**S2 — retry sincronizado:** backoff exponencial sem jitter podia sincronizar novas tentativas. A causa-raiz era ausência de dispersão temporal. A correção adiciona jitter seguro, mantendo limites e idempotência.

## Blast radius

As mudanças estão isoladas na branch forense/revisão incremental. Nenhuma automação generativa altera `main` diretamente. Operações não idempotentes permanecem sem retry automático.

## Critério de promoção

Somente promover após CI + Security + testes de resiliência/segurança verdes e validação de integração no ambiente controlado.
