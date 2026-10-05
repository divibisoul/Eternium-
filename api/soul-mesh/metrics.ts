import { getMeshResiliencePrometheus } from './peer-client.ts';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader?.('allow', 'GET');
    return res.status(405).send?.('METHOD_NOT_ALLOWED');
  }
  res.setHeader?.('content-type', 'text/plain; version=0.0.4; charset=utf-8');
  res.setHeader?.('cache-control', 'no-store');
  return res.status(200).send(getMeshResiliencePrometheus());
}
