export const NUCLEUS_ID = 'N02' as const;
export const N01_REFERENCE_TRANSPORTS = ['IN_PROCESS','WEBVIEW_BRIDGE','LOOPBACK_HTTP','HTTP','REALTIME'] as const;
export type N01Transport = typeof N01_REFERENCE_TRANSPORTS[number];
export const N02_PEERS = ['N01','N03','N04','N05','N06','N07'] as const;
export const N02_IMPLEMENTED_TRANSPORTS: readonly N01Transport[] = ['IN_PROCESS','HTTP'];
export const N02_ADAPTER_TARGETS: readonly N01Transport[] = ['WEBVIEW_BRIDGE','LOOPBACK_HTTP','REALTIME'];
export interface TransportProfile { nucleus:string; implemented: readonly N01Transport[]; adapters: readonly N01Transport[]; }
export const N02_TRANSPORT_PROFILE: TransportProfile = { nucleus: NUCLEUS_ID, implemented: N02_IMPLEMENTED_TRANSPORTS, adapters: N02_ADAPTER_TARGETS };
export function negotiateTransport(local: readonly N01Transport[], remote: readonly N01Transport[]): N01Transport | null {
  return N01_REFERENCE_TRANSPORTS.find((transport) => local.includes(transport) && remote.includes(transport)) ?? null;
}
export function channelFor(source:string,target:string,direction:'IN'|'OUT'): string { return `${source}.${direction}.${target}`; }
