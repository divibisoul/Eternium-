# N02 — Incremental Resilience Review

Esta revisão é complementar ao PR #1 e parte do seu HEAD `09c0ed12ea4276a444e787bed0727e0c1865fb4a`.

## Delta desta auditoria

- canonicalização HMAC ampliada para toda a semântica do envelope;
- regressões contra tampering de capability/kind/type;
- backoff exponencial com jitter seguro;
- métricas de latência e recuperação adicionadas ao controller existente;
- redação de tokens/URLs nos registros forenses;
- dependência Supabase declarada explicitamente;
- Regra de Ouro formalizada como loop operacional;
- blast radius limitado e promoção condicionada a CI/Security.

Nenhuma implementação já existente do PR #1 foi duplicada; a revisão modifica apenas responsabilidades presentes ou acrescenta os observáveis faltantes.
