# Directiva de Engenharia Operacional — SOUL / N02

Estas regras são permanentes para qualquer manutenção deste núcleo.

1. O estado real do código e do GitHub prevalece sobre documentação, intenção ou afirmação anterior.
2. Antes de cada mutação, auditar `main`, PRs/branches ativos, SHAs e caminhos sobrepostos.
3. Falha de ferramenta, compilação, teste, dependência ou integração não encerra a tarefa: isolar a causa, pesquisar alternativas técnicas, corrigir e validar novamente.
4. Uma alteração só é considerada aplicada depois de relida no GitHub e confrontada com o SHA esperado.
5. Nunca usar placeholder, função vazia, sucesso fabricado ou capacidade declarada que não exista no runtime.
6. Tempo é requisito funcional: timeout, deadline, cancelamento, retry, drenagem e recuperação precisam ser mensuráveis.
7. Gráficos, SLIs e telemetria são evidência de operação; documentação isolada não eleva prontidão.
8. Não duplicar responsabilidade: primeiro reutilizar/adaptar a implementação canônica já existente.
9. Sempre que um erro for encontrado, aplicar o ciclo abaixo até existir correção verificável ou um bloqueio técnico explicitamente documentado.

## Regra de Ouro — Engenharia de Resiliência Generativa

`falha → evidência forense → contenção → causa-raiz → correção → não-regressão → SLI → chaos controlado → remediação segura → nova validação`

### Camada Reativa

- circuit breaker por peer/serviço;
- retries somente para falhas transitórias e operações idempotentes;
- backoff exponencial com jitter;
- fallback apenas quando semanticamente seguro;
- correlação e idempotência preservadas nas tentativas;
- evidência forense estruturada sem vazamento de segredos.

### Camada Corretiva

- FMEA e 5 Porquês;
- correção da causa-raiz, não apenas do sintoma;
- estados e transições explícitos;
- validação total de envelopes e capacidades;
- contrato e testes atualizados quando o comportamento muda.

### Camada Generativa

- converter assinaturas de falha em SLIs e métricas;
- registrar taxa, contagem e tempo de recuperação;
- transformar cada falha relevante em teste ofensivo de não-regressão;
- fault injection apenas em staging/branch controlada;
- runbooks e automação reversível;
- nenhuma automação generativa de produção sem shadow traffic/activation gate.

### Blast radius

Uma falha local nunca deve disparar uma mutação global sem evidência adicional. A remediação automática deve primeiro isolar o peer/capability afetado.
