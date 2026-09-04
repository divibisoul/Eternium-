# Directiva de Engenharia Operacional — Soul

Esta diretriz é permanente para qualquer manutenção deste núcleo.

1. O estado real do código prevalece sobre documentação, intenção ou declaração anterior.
2. Toda área incompleta, inconsistente, quebrada, desconectada, insegura ou inativa deve ser corrigida no código assim que identificada.
3. Falha de ferramenta, dependência, compilação, teste ou integração não encerra a tarefa. Investigar a causa, pesquisar alternativas técnicas legítimas, aplicar a melhor correção e validar novamente.
4. Nunca substituir implementação real por retorno estático, função vazia, placeholder, sucesso fabricado ou capacidade não suportada pelo ambiente.
5. Cada alteração deve ser relida no GitHub após escrita e submetida aos testes disponíveis.
6. O tempo faz parte do critério de prontidão: considerar timeout, deadline, cancelamento, drenagem, retry e tempo de recuperação como requisitos funcionais.
7. Gráficos/telemetria de latência, falhas, utilização e estado devem ser usados para verificar se o sistema realmente está operando de forma estável antes de declarar conclusão.
8. Compatibilidade entre núcleos deve ser verificada pelos contratos e por tráfego real de teste, não apenas pela existência de arquivos.
9. Em conflito entre recursos, escolher a solução que maximize segurança, coerência, observabilidade, desempenho e capacidade de recuperação sem inventar capacidades.
10. Nunca declarar uma tarefa concluída sem evidência verificável do estado final.

## Regra de Ouro — Engenharia de Resiliência Generativa

A Regra de Ouro é um loop permanente de aprendizado:

`falha → evidência forense → contenção → causa-raiz → correção → teste de não-regressão → telemetria → caos controlado → automação segura → nova validação`

### Camada Reativa

- conter a falha com o menor blast radius possível;
- usar timeout, circuit breaker, retry com backoff exponencial e jitter quando apropriado;
- preservar idempotência e correlação para permitir repetição segura;
- manter evidência forense estruturada sem expor segredos;
- usar fallback somente quando o contrato permitir degradação graciosa.

### Camada Corretiva

- aplicar FMEA e 5 Porquês técnicos;
- corrigir a lógica e não somente o sintoma;
- transformar exceções descobertas em estados/fluxos explícitos;
- validar entradas e saídas de forma total e rejeitar estados impossíveis;
- atualizar contratos e testes quando a causa-raiz exigir mudança de comportamento.

### Camada Generativa

- transformar cada falha relevante em SLI/telemetria específica;
- preservar assinatura de erro, contagem, taxa e tempo de recuperação;
- incorporar o cenário de falha à suíte de não-regressão;
- executar chaos/fault injection em staging ou ambientes controlados;
- criar runbooks e remediação automatizada somente após validação;
- qualquer automação de produção deve passar por shadow traffic/activation gate e controle explícito de blast radius.

### Critério de severidade

- S1: observabilidade, contenção e bloqueio seguro primeiro;
- S2: recuperação automática controlada e escalonamento;
- S3: correção automatizada pode ser aplicada após validação;
- S4: otimização pode ser automatizada, desde que mensurável e reversível.

Uma falha somente é considerada internalizada quando existe **correção + teste + observável + mecanismo de recuperação**. Documentação isolada nunca fecha o ciclo.
