# N02 — Engenharia de Resiliência Generativa

Este documento é a especificação operacional da Regra de Ouro para o N02. Ele é cumulativo: não substitui contratos de Mesh, agentes, Gemini ou ferramentas existentes.

## Pipeline obrigatório

```text
Falha
  -> classificação por assinatura
  -> contenção imediata
  -> evidência forense (mensagem + stack)
  -> análise de causa raiz
  -> correção no componente proprietário
  -> teste de não-regressão
  -> SLI/Prometheus
  -> alerta preditivo
  -> runbook de remediação
  -> validação em shadow traffic
  -> promoção somente após evidência
```

## FMEA operacional

| Modo de falha | Efeito | Severidade | Detecção | Contenção | Correção | Geração |
|---|---|---:|---|---|---|---|
| Timeout peer | latência/indisponibilidade | S2 | erro + SLI | circuit breaker | retry apenas idempotente | alerta + runbook |
| Peer 5xx/429 | capacidade degradada | S2 | status HTTP | backoff | fallback explícito | alerta de saturação |
| JSON inválido | contrato quebrado | S2 | parser | circuito | corrigir contrato/peer | teste de regressão |
| correlation mismatch | resposta não confiável | S1 | validador | rejeição | contrato canônico | alerta de integridade |
| identity mismatch | risco de roteamento indevido | S1 | validador | rejeição | identidade/endpoint | alerta crítico |
| replay/nonce | possível reenvio | S1 | segurança do envelope | rejeição | janela/nonce | alerta crítico |
| peer não configurado | perda de capacidade | S3 | validação local | degradação graciosa | configuração | alerta de readiness |
| falha de capability | funcionalidade indisponível | S3 | runtime | resposta explícita de erro | handler/contrato | teste + métrica |

## 5 Porquês — ausência de resiliência

1. Por que uma falha repetida podia continuar sendo enviada ao mesmo peer? Porque o cliente não mantinha estado de saúde por peer.
2. Por que não havia estado? Porque timeout e erro eram tratados somente dentro da chamada.
3. Por que isso era insuficiente? Porque a falha não se transformava em sinal persistente do sistema.
4. Por que não havia sinal persistente? Porque não existia uma camada transversal de resiliência no Mesh.
5. Por que isso é estrutural? Porque transporte, observabilidade e recuperação estavam separados sem um contrato operacional comum.

**Causa raiz:** ausência de uma política única que transformasse erro de transporte em estado operacional, telemetria, teste e remediação.

## Invariantes

- Operações não idempotentes não recebem retry automático.
- Um circuito aberto impede chamadas adicionais ao peer até a janela de recuperação.
- Toda falha retém assinatura, mensagem e stack quando disponíveis.
- Falha nunca gera sucesso sintético.
- `correlationId`, identidade do peer e contrato são verificados antes de aceitar uma resposta.
- Remediação automática não altera produção sem evidência de shadow traffic.

## Critério de encerramento

A camada só pode ser marcada como pronta quando:

1. os testes de resiliência passam;
2. o typecheck e o build passam;
3. os SLIs estão expostos;
4. os alertas estão versionados;
5. o runbook existe;
6. a interoperabilidade N01↔N02 estiver comprovada com o contrato canônico vigente;
7. as demais frentes não tiverem uma implementação concorrente mais recente.
