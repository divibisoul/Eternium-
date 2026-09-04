# N02 — Resilience Dashboard Contract

Este painel é um contrato operacional para transformar falhas recorrentes em sinais acionáveis. Os valores devem ser obtidos do runtime; números estáticos nunca representam saúde.

## SLIs obrigatórios

| SLI | Fórmula | Alerta | Ação |
|---|---|---:|---|
| Peer error rate | falhas peer / requests peer | > 5% por 5 min | abrir investigação + breaker |
| Retry rate | retries / requests peer | > 10% por 5 min | revisar latência/disponibilidade |
| Circuit-open events | aberturas / 5 min | >= 1 | identificar peer e bloquear cascata |
| Fallback rate | fallbacks / requests Gemini | > 5% por 5 min | verificar modelo primário |
| Timeout rate | timeouts / requests | > 2% por 5 min | ajustar capacidade/latência, não apenas timeout |
| Recovery time | tempo entre abertura e primeiro sucesso | > 30 s | escalar incidente |
| Contract rejection rate | envelopes rejeitados / envelopes | > 1% | investigar compatibilidade |

## Assinatura forense

Toda falha deve carregar, quando disponível:

- núcleo de origem e destino;
- capability;
- correlation/trace id;
- classe de erro;
- timestamp;
- tentativa número;
- estado do circuit breaker;
- latência total;
- indicação de fallback;
- nenhum segredo/token/payload privado desnecessário.

## Estados operacionais

`HEALTHY → DEGRADED → CIRCUIT_OPEN → RECOVERING → HEALTHY`

Falhas de contrato produzem `REJECTED` e não devem entrar em retry cego.

## Chaos gate

O cenário mínimo obrigatório injeta erro 503 de forma controlada e deve demonstrar:

`failure → retry → backoff → circuit-open → block cascade → telemetry`

O teste deve ser executado apenas em branch/staging e nunca enviar requests para produção real.

## Runbook de recuperação

1. Identificar peer/capability no SLI.
2. Confirmar se o circuit breaker abriu por falha transitória ou por contrato inválido.
3. Não aumentar retries para erro de autenticação, schema ou contrato.
4. Corrigir a causa-raiz no proprietário da capability.
5. Executar self-test e chaos check.
6. Validar shadow/staging.
7. Somente depois promover a correção ao `main`.

## Regra de blast radius

A remediação automática deve permanecer confinada ao peer afetado. Nenhuma automação deve alterar credenciais, contratos globais ou todos os peers por causa de uma única assinatura de falha.
