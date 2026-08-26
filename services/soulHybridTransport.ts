import type { SoulMeshMessage, SoulMeshTransportKind } from './soulMeshProtocol';

export interface SoulHybridSendOptions {
  endpoint: string;
  token?: string;
  transport?: Exclude<SoulMeshTransportKind, 'IN_PROCESS' | 'WEBVIEW_BRIDGE' | 'REALTIME'>;
}

/** N06 outbound bridge. Endpoint is deployment configuration; no AI provider is embedded. */
export async function sendSoulMeshMessage(
  message: SoulMeshMessage,
  options: SoulHybridSendOptions,
): Promise<SoulMeshMessage> {
  if (!options.endpoint) throw new Error('SOUL_MESH_ENDPOINT_NOT_CONFIGURED');
  if (message.source !== 'N06') throw new Error('N06_TRANSPORT_SOURCE_MISMATCH');
  if (message.target === 'N06') throw new Error('N06_TRANSPORT_SELF_ROUTE');

  const response = await fetch(options.endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
    body: JSON.stringify({ ...message, transport: options.transport ?? 'HTTP' }),
  });

  if (!response.ok) throw new Error(`SOUL_MESH_HTTP_${response.status}`);
  return (await response.json()) as SoulMeshMessage;
}
