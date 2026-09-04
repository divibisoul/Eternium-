import { createServer } from 'node:http';

process.env.NODE_ENV = 'test';
const port = 18765;
let hits = 0;
const server = createServer((_req, res) => {
  hits += 1;
  res.statusCode = 503;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ protocol:'soul-mesh/1', contractVersion:'1.1.0', id:`error-${hits}`, correlationId:'chaos', source:'N01', target:'N02', kind:'error', capability:'mesh.ping', payload:{ code:'CHAOS_503' }, timestamp:Date.now() }));
});

await new Promise<void>(resolve => server.listen(port, '127.0.0.1', resolve));
process.env.SOUL_MESH_N01_URL = `http://127.0.0.1:${port}`;
const { requestPeerCapability, peerFailureSnapshot, resetPeerFailureMetrics } = await import('../api/soul-mesh/peer-client.ts');
resetPeerFailureMetrics();

try {
  await requestPeerCapability('N01', 'mesh.ping', { chaos:true }, 250, 1);
} catch {}
try {
  await requestPeerCapability('N01', 'mesh.ping', { chaos:true }, 250, 1);
} catch {}
let circuitOpened = false;
try {
  await requestPeerCapability('N01', 'mesh.ping', { chaos:true }, 250, 1);
} catch (error) {
  circuitOpened = error instanceof Error && error.message === 'SOUL_MESH_CIRCUIT_OPEN:N01';
}

const snapshot = peerFailureSnapshot();
server.close();
if (!circuitOpened) throw new Error('chaos check failed: circuit breaker did not open');
if (hits !== 3) throw new Error(`chaos check failed: expected 3 network hits before breaker, got ${hits}`);
if (snapshot.retryableFailures < 2 || snapshot.circuitOpens < 1) throw new Error(`chaos telemetry incomplete: ${JSON.stringify(snapshot)}`);
console.log(JSON.stringify({ ok:true, hits, snapshot }));
