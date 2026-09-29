import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getN02RuntimeStatus } from '../src/soul-mesh/N02CapabilityRuntime';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  try {
    const status = getN02RuntimeStatus();
    return res.status(200).json({
      ...status,
      observedAt: Date.now(),
      source: 'N02-runtime-status-endpoint',
    });
  } catch (error) {
    return res.status(503).json({
      error: error instanceof Error ? error.message : String(error),
      source: 'N02-runtime-status-endpoint',
    });
  }
}
