export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader?.('allow', 'GET');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  res.setHeader?.('cache-control', 'no-store');
  return res.status(200).json({
    protocol: 'soul-mesh/1',
    nucleus: 'N02',
    status: 'online',
    mesh: 'ready',
    runtime: 'Eternium-Gemini',
    timestamp: Date.now(),
  });
}
