import { executeSoulTask, type EterniumCapability } from '../services/soulMeshAdapter';

type MeshMessage = {
  protocol: string; id: string; correlationId: string; source: string; target: 'N06'; kind: string;
  capability: string; payload: unknown; timestamp: string | number; channelId?: string; transport?: string; proof?: string;
};

const allowed: ReadonlySet<string> = new Set([
  'reasoning', 'planning', 'agent-execution', 'multimodal-analysis', 'synthesis', 'governance',
]);

function authorized(req: Request) {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const expected = runtime.process?.env?.SOUL_MESH_TOKEN;
  if (!expected) return true;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), { status: 405, headers: { 'content-type': 'application/json' } });
  if (!authorized(req)) return new Response(JSON.stringify({ error: 'UNAUTHORIZED' }), { status: 401, headers: { 'content-type': 'application/json' } });
  try {
    const message = (await req.json()) as MeshMessage;
    if (message.protocol !== 'soul-mesh/1' || message.target !== 'N06' || message.source === 'N06' || !message.id || !message.correlationId || !message.capability) {
      return new Response(JSON.stringify({ error: 'INVALID_MESH_MESSAGE' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
    if (message.channelId && message.channelId !== `N06.IN.${message.source}` && message.channelId !== `N06.OUT.${message.source}`) {
      return new Response(JSON.stringify({ error: 'INVALID_CHANNEL_ID' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
    if (message.kind !== 'request') return new Response(JSON.stringify({ ...message, proof: 'CONNECTED' }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (message.capability === 'mesh.health') return new Response(JSON.stringify({ ...message, kind: 'response', proof: 'EXECUTED', payload: { nucleus: 'N06', status: 'ready', transport: 'hybrid' } }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (message.capability === 'mesh.capabilities') return new Response(JSON.stringify({ ...message, kind: 'response', proof: 'EXECUTED', payload: { nucleus: 'N06', capabilities: [...allowed] } }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (!allowed.has(message.capability)) return new Response(JSON.stringify({ ...message, kind: 'error', proof: 'CONNECTED', payload: { code: 'CAPABILITY_NOT_FOUND' } }), { status: 422, headers: { 'content-type': 'application/json' } });
    const result = await executeSoulTask({ capability: message.capability as EterniumCapability, input: message.payload });
    if (!result.success) return new Response(JSON.stringify({ ...message, kind: 'error', proof: 'EXECUTED', payload: result.error }), { status: 422, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ ...message, kind: 'response', proof: 'EXECUTED', payload: result.output }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'INVALID_MESH_MESSAGE' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}
