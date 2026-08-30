import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { CAPABILITIES, NUCLEUS_ID, PROTOCOL, isValidEnvelope } from './protocol.mjs';

const port = Number(process.env.MESH_PORT || 8082);
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const registry = {
  nucleusId: NUCLEUS_ID,
  protocol: PROTOCOL,
  status: 'online',
  capabilities: CAPABILITIES,
  transports: ['HTTP'],
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

async function execute(envelope) {
  if (envelope.capability === 'audio.transcribe') {
    if (!ai) throw new Error('AI provider not configured');
    const { audioBase64, mimeType } = envelope.payload || {};
    if (!audioBase64 || !mimeType) throw new Error('audioBase64 and mimeType are required');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { data: audioBase64, mimeType } }, { text: 'Transcreva o áudio para português do Brasil. Responda apenas com a transcrição.' }] },
    });
    return { text: response.text.trim() };
  }

  if (envelope.capability.startsWith('inference.')) {
    if (!ai) throw new Error('AI provider not configured');
    const text = envelope.payload?.text || '';
    if (!text) throw new Error('payload.text is required');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text }] }],
    });
    return { text: response.text };
  }

  throw new Error(`capability not executable: ${envelope.capability}`);
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
      if (!isValidEnvelope(envelope)) return json(res, 400, { protocol: PROTOCOL, error: 'invalid Soul Mesh envelope' });
      if (envelope.target !== NUCLEUS_ID && envelope.target !== '*') return json(res, 404, { error: 'target nucleus not N02' });
      if (!CAPABILITIES.includes(envelope.capability)) return json(res, 404, { error: 'capability unavailable', capability: envelope.capability });
      const result = await execute(envelope);
      return json(res, 200, { protocol: PROTOCOL, type: 'TASK_RESULT', correlationId: envelope.correlationId, source: NUCLEUS_ID, target: envelope.source, capability: envelope.capability, payload: result });
    }
    return json(res, 404, { error: 'route not found' });
  } catch (error) {
    return json(res, 500, { protocol: PROTOCOL, type: 'ERROR', correlationId: randomUUID(), source: NUCLEUS_ID, error: error instanceof Error ? error.message : 'unknown error' });
  }
});

server.listen(port, () => console.log(`SOUL Mesh N02 listening on http://localhost:${port}`));
