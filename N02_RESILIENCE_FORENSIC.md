# N02 — Auditoria Forense de Resiliência Generativa

## Estado auditado

Repositório: `divibisoul/Eternium-`
Base auditada: `main`
Branch de correção: `forensic/n02-resilience-generative-v2`

## Evidências forenses

1. `src/soul-mesh/N01N02HybridLink.ts` importava `SoulMeshRouter`, mas o arquivo não estava presente no `main` auditado.
2. `src/soul-mesh/createSoulMeshRouter.ts` dependia de `SoulMeshPeerTransport`; a implementação não estava presente no `main` auditado.
3. `src/soul-mesh/SoulMeshSupabaseTransport.ts` usava `@supabase/supabase-js`, mas `package.json` não declarava a dependência.
4. O cliente peer tinha retry linear e sem circuit breaker por peer.
5. O fallback de UUID usava `Math.random()`, desnecessário para um caminho de identificação/correlação.
6. Não havia SLI local explícito para retries, fallback, circuit-open e falhas por peer.
7. A suíte operacional não tinha um alvo específico que exercitasse os contratos N02 + Mesh + transporte resiliente no mesmo pipeline.

## Camada Reativa

Implementado nesta frente:

- transporte peer runtime restaurado;
- router com correlação, timeout, cancelamento por fechamento e propagação de erro remoto;
- circuit breaker por peer após três falhas transitórias consecutivas;
- cooldown de 10 s antes da reabertura;
- retry limitado a falhas transitórias;
- backoff exponencial com jitter criptograficamente forte;
- mesma mensagem/correlation ID reutilizada durante retries, preservando idempotência do envelope;
- autenticação HMAC prioritária e Bearer como fallback configurado;
- falha explícita quando nenhuma autenticação está configurada em produção.

## Camada Corretiva — FMEA resumida

| Falha | Efeito | Severidade | Detecção | Mitigação |
|---|---|---:|---|---|
| transport inexistente | build/runtime quebrado | S1 | compilação/import graph | implementar transport/router reais |
| dependência fantasma | instalação/build quebrado | S1 | resolução de módulos | declarar dependência |
| peer indisponível | timeout/retry em cascata | S2 | erro de transporte | retry + breaker |
| resposta inválida | corrupção de contrato | S1 | validação estrutural | rejeição antes do consumo |
| replay | duplicação de operação | S1 | ID/replay window no endpoint | idempotência/correlação |
| fallback de modelo | degradação de capacidade | S2 | métrica de fallback | fallback explícito + SLI |

## 5 Porquês — transporte N02

**Por que chamadas de peer podiam falhar antes de entrar no caminho resiliente?**
Porque partes do router/transport estavam referenciadas, mas não materializadas no `main` auditado.

**Por que isso passou?**
Porque a presença das interfaces e dos imports foi tratada como evidência de implementação.

**Por que isso é incorreto?**
Porque contrato estático não prova caminho executável.

**Por que a validação não detectava imediatamente?**
Porque o pipeline de diagnóstico não tinha um gate dedicado ao grafo completo do Mesh N02.

**Causa sistêmica:** ausência de uma validação obrigatória de `import graph → build → runtime path → fault injection` para o núcleo.

## Camada Generativa

Os erros agora viram instrumentos do sistema:

- `geminiReliability.ts` expõe contadores de tentativas, retries, exaustão, falhas transitórias, fallback e assinaturas de erro;
- peer client expõe `peerFailureSnapshot()` e `resetPeerFailureMetrics()`;
- as assinaturas preservam a identificação operacional sem gravar segredos;
- os casos de falha devem entrar na suíte ofensiva e em cenários de caos controlados;
- o próximo gate deve medir taxa de timeout, taxa de fallback, circuit-open e tempo até recuperação.

## Loop CI/CD reverso

`falha → assinatura → teste/regressão → contrato → métrica → playbook → caos → nova validação`

## Controle de blast radius

As automações generativas desta frente estão confinadas à branch forense. Nenhuma remediação automática é liberada para produção sem build, testes, validação de contrato e tráfego de shadow/staging.

## Critério de avanço

Nenhum percentual ou estado de prontidão deve subir apenas por documentação. A capacidade precisa atravessar compilação, teste, runtime e cenário de falha correspondente.
