import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { CAPABILITIES, NUCLEUS_ID, SOUL_MESH_VERSION, isValidEnvelope, getCapability } from './protocol.mjs';
import { signEnvelope, verifyEnvelope } from './security.mjs';

const port = Number(process.env.MESH_PORT || 8082);
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const meshSecret = process.env.SOUL_MESH_SECRET;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const seenNonces = new Set();

const registry = {
  nucleusId: NUCLEUS_ID,
  protocol: `soul-mesh/${SOUL_MESH_VERSION === '1.0' ? '1' : SOUL_MESH_VERSION}`,
  version: SOUL_MESH_VERSION,
  status: 'online',
  capabilities: CAPABILITIES,
  transports: ['HTTP'],
  bidirectional: true,
};

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const readBody = req => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 1_000_000) req.destroy(new Error('payload too large'));
  });
  req.on('end', () => {
    try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('invalid JSON')); }
  });
  req.on('error', reject);
});

function resultEnvelope(request, type, payload) {
  const envelope = {
    version: SOUL_MESH_VERSION,
    messageId: randomUUID(),
    source: NUCLEUS_ID,
    target: request.source,
    timestamp: Date.now(),
    nonce: randomUUID(),
    correlationId: request.correlationId,
    type,
    ...(request.ttl === undefined ? {} : { ttl: Math.max(0, request.ttl - 1) }),
    payload,
  };
  return meshSecret ? { ...envelope, hmac: signEnvelope(envelope, meshSecret) } : envelope;
}

async function execute(envelope) {
  const capability = getCapability(envelope);
  if (capability === 'audio.transcribe') {
    if (!ai) throw new Error('AI provider not configured');
    const { audioBase64, mimeType } = envelope.payload || {};
    if (!audioBase64 || !mimeType) throw new Error('audioBase64 and mimeType are required');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { data: audioBase64, mimeType } }, { text: 'Transcreva o áudio para português do Brasil. Responda apenas com a transcrição.' }] },
    });
    return { text: response.text.trim() };
  }
  if (capability?.startsWith('inference.')) {
    if (!ai) throw new Error('AI provider not configured');
    const text = envelope.payload?.text || '';
    if (!text) throw new Error('payload.text is required');
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: [{ role: 'user', parts: [{ text }] }] });
    return { text: response.text };
  }
  throw new Error(`capability not executable: ${capability || 'unknown'}`);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/mesh/health') return json(res, 200, { ...registry, uptime: process.uptime() });
    if (req.method === 'GET' && req.url === '/mesh/discovery') return json(res, 200, registry);
    if (req.method === 'POST' && req.url === '/mesh/register') {
      const body = await readBody(req);
      if (body.nucleusId && body.nucleusId !== NUCLEUS_ID) return json(res, 400, { error: 'N02 identity mismatch' });
      return json(res, 200, registry);
    }
    if (req.method === 'POST' && req.url === '/mesh/in') {
      const envelope = await readBody(req);
      if (!isValidEnvelope(envelope)) return json(res, 400, { protocol: 'soul-mesh/1', error: 'invalid Soul Mesh envelope' });
      if (envelope.target !== NUCLEUS_ID && envelope.target !== 'BROADCAST') return json(res, 404, { error: 'target nucleus not N02' });
      if (meshSecret) verifyEnvelope(envelope, meshSecret, { seenNonces });
      else if (envelope.hmac) return json(res, 401, { error: 'SOUL_MESH_SECRET is not configured' });
      const capability = getCapability(envelope);
      if (!capability || !CAPABILITIES.includes(capability)) return json(res, 404, resultEnvelope(envelope, 'ERROR', { error: 'capability unavailable', capability }));
      const result = await execute(envelope);
      return json(res, 200, resultEnvelope(envelope, 'TASK_RESULT', { capability, result }));
    }
    return json(res, 404, { error: 'route not found' });
  } catch (error) {
    const body = { version: SOUL_MESH_VERSION, messageId: randomUUID(), source: NUCLEUS_ID, target: 'BROADCAST', timestamp: Date.now(), nonce: randomUUID(), correlationId: randomUUID(), type: 'ERROR', payload: { error: error instanceof Error ? error.message : 'unknown error' } };
    return json(res, 500, meshSecret ? { ...body, hmac: signEnvelope(body, meshSecret) } : body);
  }
});

server.listen(port, () => console.log(`SOUL Mesh N02 listening on http://localhost:${port}`));
