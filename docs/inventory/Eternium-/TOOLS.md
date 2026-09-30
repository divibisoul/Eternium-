# FASE 0 — N02 TOOLS / CAPABILITIES

## B1 IDENTIDADE
Primário: conversação, geração e processamento cognitivo.
Secundários: áudio/interação, visão, NeuralForge/ASC, Mesh e boundary SARA.
Papel octacore: processador autônomo de conversa/cognição + expansor quando ligado a percepção, tools, contexto e orquestração.

## B2 PROCESSADORES
| Nome | Path | Responsabilidade | Estado |
|---|---|---|---|
| N02CapabilityRuntime | src/soul-mesh/N02CapabilityRuntime.ts | registry + execução | ativo |
| N02AgentRegistry | src/soul-mesh/N02AgentRegistry.ts | agents/capabilities | ativo |
| Gemini provider | serviços @google/genai | geração/entendimento | ativo quando credencial |
| NeuralForge | capability neural_forge | modelagem neural | PENDING executor específico |
| ASC | capability asc | descoberta científica | PENDING executor específico |
| Ollama | ai.generate.ollama | inferência local | BLOCKED_ENV sem endpoint |
| ClareiraBridge | src/soul-mesh/ClareiraBridge.ts | encaminhamento Clareira → N01 | ativo quando N01 |

## B3 ENDPOINTS
| Método | Path | Estado |
|---|---|---|
| POST | /api/soul-mesh | LIVE quando deployment e auth válidos |
| request | mesh.handshake / mesh.ping / mesh.describe | EXECUTABLE |
| request | Clareira/SARA | BLOCKED_ENV conforme dependência |

## B4 FUNÇÕES
| Módulo | Função | Assinatura resumida | Consumidores |
|---|---|---|---|
| runtime | executeN02Agent | (message) => Promise<unknown> | API Mesh |
| runtime | listExecutable | () => string[] | discovery |
| runtime | has | (capability) => boolean | dispatcher |
| ClareiraBridge | forwardClareiraToN01 | (packet) => Promise<unknown> | Mesh |
| ClareiraBridge | clareiraMetrics | () => metrics | observabilidade |

## B5/B6 EVENTOS
Soul Mesh request/response/event é a fronteira primária. Lista fechada de eventos internos do app não foi enumerada: PENDING.

## B7 EXTERNOS
Google Gemini/@google/genai, Supabase, Ollama opcional, infraestrutura Vercel/serverless.

## B8 INTER-NÚCLEO
N01/N03/N04/N05/N06/N07 por Soul Mesh 1.1.0. SARA por HTTP autenticado. Clareira termina no N01.

## B9 ADORMECIDAS
| Ferramenta | Precisa de | Estado |
|---|---|---|
| Gemini | API key/config | BLOCKED_ENV |
| Ollama | endpoint local | BLOCKED_ENV |
| NeuralForge | executor real | PENDING |
| ASC | executor/provider real | PENDING |
| SARA.* | SARA URL/token | BLOCKED_ENV |
| Octacore | registration/fronteira real | PENDING |

## B10 EXECUTÁVEIS
mesh handshake/ping/describe e capacidades que aparecem em listExecutable(); Clareira forward quando N01 está configurado.

## B11 EXPANSÃO
| Ao conectar | Ganha | Perde | Neutro |
|---|---|---|---|
| N03 | percepção/áudio → conversa | nenhuma autoridade | Mesh |
| N04 | tools/docs → resposta | nenhuma | conversation |
| N05 | dispatch/inference | nenhuma | provider |
| N06 | sessão/contexto | nenhuma | identidade |
| N01 | runtime/Clareira | nenhuma | cognition |
| N07 | orchestration | nenhuma | processing |
| SARA | audit/regeneration | nenhuma | provider |

Inventário recursivo completo de exports/eventos permanece PENDING onde o conector não oferece árvore integral.
