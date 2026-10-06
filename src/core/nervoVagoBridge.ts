import { createHmac } from 'node:crypto';
import type { VagusSignal } from './VagusBus';

type JsonRecord = Record<string, unknown>;

function env(name: string): string {
  const value = (globalThis as any).process?.env?.[name];
  return typeof value === 'string' ? value.trim() : '';
}

function canonicalMessage(signal: VagusSignal<unknown>, nonce: string): JsonRecord {
  return {
    protocol: 'soul-mesh/1',
    contractVersion: '1.1.0',
    id: signal.id,
    correlationId: signal.correlationId,
    source: 'N02',
    target: 'N07',
    kind: 'request',
    capability: 'nervo.vago.publish@1.0.0',
    payload: {
      vagus_version: '1.0',
      message_id: signal.id,
      correlation_id: signal.correlationId,
      source: signal.source,
      target: signal.target,
      priority: 80,
      ttl: 5000,
      type: signal.kind,
      payload: signal.payload,
    },
    timestamp: signal.timestamp,
    meta: { transport: 'HTTP', runtime: 'Eternium-N02' },
    nonce,
  };
}

export function createNervoVagoForwarder(): ((signal: VagusSignal<unknown>) => Promise<void>) | undefined {
  const url = env('SOUL_MESH_N07_URL');
  const secret = env('SOUL_MESH_SECRET') || env('SOUL_MESH_HMAC_SECRET');
  if (!url || secret.length < 16) return undefined;

  return async signal => {
    const nonce = globalThis.crypto.randomUUID();
    const body = canonicalMessage(signal, nonce);
    const hmac = createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    const response = await fetch(url + '/api/soul-mesh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-soul-mesh-nonce': nonce,
        'x-soul-mesh-hmac': hmac,
        'x-soul-correlation-id': signal.correlationId,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('N02_NERVOVAGO_HTTP_' + response.status);
    }
    const result = await response.json() as JsonRecord;
    if (result.correlationId !== signal.correlationId) {
      throw new Error('N02_NERVOVAGO_CORRELATION_MISMATCH');
    }
  };
}
