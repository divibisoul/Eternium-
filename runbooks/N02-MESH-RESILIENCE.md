# N02 Mesh — Runbook de Remediação

## Regra de segurança

Nenhuma automação de remediação com efeito externo pode ser promovida diretamente para produção. Primeiro execute em shadow/staging e confirme o SLI correspondente.

## Assinatura: `SOUL_MESH_CIRCUIT_OPEN`

1. Identificar o peer e o `correlationId` no registro forense.
2. Consultar `n02_mesh_failures_total`, `n02_mesh_retries_total` e `n02_mesh_circuit_state`.
3. Confirmar se o peer está fora do ar, saturado ou rejeitando autenticação.
4. Manter o circuito aberto durante a janela configurada; não forçar fechamento manual como primeira ação.
5. Corrigir endpoint/credencial/serviço remoto.
6. Validar em shadow traffic com `mesh.ping` e `capability.list`.
7. Só então permitir recuperação automática do circuito.

## Assinatura: `SOUL_MESH_CORRELATION_MISMATCH`

Falha crítica de integridade. Rejeitar a resposta; não tentar “corrigir” a mensagem. Preservar stack/headers necessários para investigação, verificar versão do contrato e abrir investigação do peer.

## Assinatura: `SOUL_MESH_IDENTITY_MISMATCH`

Falha crítica de roteamento. Rejeitar imediatamente. Não fazer retry automático. Validar endpoint, identidade declarada, token e contrato antes de nova tentativa.

## Assinatura: `SOUL_MESH_INVALID_REMOTE_JSON`

Verificar mudança de versão ou proxy/gateway. Como a operação pode ter sido processada no remoto antes de uma resposta inválida, retry só é permitido para capacidades explicitamente idempotentes.

## Assinatura: `SOUL_MESH_REMOTE_ERROR`

Usar o código HTTP/remoto preservado no erro para diferenciar 429/saturação de 5xx/indisponibilidade e erros funcionais 4xx. Não classificar erro funcional como indisponibilidade.

## Remediação automática permitida

A automação interna do N02 pode abrir/fechar circuitos e degradar chamadas para `FAILED`/`DEGRADED`, mas não pode alterar infraestrutura externa sem um controlador de produção explicitamente habilitado e sem evidência anterior de shadow traffic.
