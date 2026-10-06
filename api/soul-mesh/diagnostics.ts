import { pingAll, listPeerCapabilities } from './peer-client';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader?.('allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const token = process.env.SOUL_MESH_TOKEN;
  if (token && req.headers?.authorization !== `Bearer ${token}`) return res.status(401).json({ error: 'UNAUTHORIZED' });

  try {
    const ping = await pingAll(5000);
    const capabilities = await Promise.all(ping.map(async item => {
      if (item.status !== 'CONNECTED') return { target: item.target, status: 'UNREACHABLE' as const };
      try {
        const response = await listPeerCapabilities(item.target, 5000);
        return { target: item.target, status: 'CAPABILITIES_OK' as const, response: response.payload };
      } catch (error) {
        return { target: item.target, status: 'CAPABILITIES_FAILED' as const, error: String(error) };
      }
    }));
    res.setHeader?.('cache-control', 'no-store');
    return res.status(200).json({
      nucleus: 'N02',
      checkedAt: Date.now(),
      peers: ping,
      capabilityDiscovery: capabilities,
      summary: {
        reachable: ping.filter(x => x.status === 'CONNECTED').length,
        total: ping.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'MESH_DIAGNOSTICS_FAILED', message: String(error) });
  }
}
