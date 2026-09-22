# N02 ↔ SARA

N02 expõe as operações regenerativas do SARA através do limite `/api/soul-mesh`.

Capacidades: `sara.health`, `sara.cycle`, `sara.audit`, `sara.regenerate`, `sara.state`, `sara.capabilities`, `sara.trace`.

Configuração server-side: `SARA_SERVICE_URL`, `SARA_SERVICE_TOKEN`, `SARA_REQUEST_TIMEOUT_MS`.

`/health` é tratado separadamente por ser público; as operações `/v1/*` exigem Bearer. A correlação é preservada. Configuração ausente produz erro explícito `SARA_SERVICE_NOT_CONFIGURED`; nenhum resultado sintético é criado.

As capacidades nativas do N02 continuam pertencendo ao N02. SARA acrescenta auditoria, regeneração, estado, descoberta e evidência ao fluxo federado.

### Clareira frontier
Este núcleo pode consultar, de forma somente leitura, a operação SARA `sara.clareira.audit` (`GET /v1/clareira/audit`). O resultado é evidência derivada do fluxo ERU → MMD → RGO → Tríade → Clareira; não concede autoridade para mutar outro núcleo.

