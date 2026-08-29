import { SoulMeshCapabilityExecutor } from './SoulMeshCapabilityExecutor';
import { createN02AIProviderBridge } from './N02AIProviderBridge';
import { getN02MeshManifest } from './N02MeshManifest';
import type { SoulMeshMessage } from './SoulMeshProtocol';

/** N02 runtime: Mesh handlers are wired to the existing AI provider/service, not mocked. */
export const n02CapabilityRuntime = new SoulMeshCapabilityExecutor();

const handlers = createN02AIProviderBridge();
for (const [capability, handler] of Object.entries(handlers)) {
  if (!n02CapabilityRuntime.registry.has(capability)) {
    throw new Error(`N02_CAPABILITY_NOT_DECLARED:${capability}`);
  }
  n02CapabilityRuntime.register(capability, handler);
}

n02CapabilityRuntime.register('mesh.describe', () => {
  const manifest = getN02MeshManifest();
  return {
    ...manifest,
    status: 'ready',
    peers: ['N01', 'N03', 'N04', 'N05', 'N06'],
    transports: ['http'],
    channels: {
      in: ['N01.IN.N02', 'N03.IN.N02', 'N04.IN.N02', 'N05.IN.N02', 'N06.IN.N02'],
      out: ['N02.OUT.N01', 'N02.OUT.N03', 'N02.OUT.N04', 'N02.OUT.N05', 'N02.OUT.N06'],
    },
  };
});

n02CapabilityRuntime.register('mesh.ping', (message: SoulMeshMessage) => ({
  nucleus: 'N02',
  status: 'ready',
  echo: message.correlationId,
  timestamp: Date.now(),
}));

/** Runtime introspection used by Mesh discovery and diagnostics. */
export function getN02RuntimeStatus() {
  const executableCapabilities = n02CapabilityRuntime.listExecutable();
  return {
    nucleus: 'N02' as const,
    declaredCapabilities: n02CapabilityRuntime.registry.getAll().map(c => c.id).sort(),
    executableCapabilities,
    aiBridgeConnected: executableCapabilities.includes('ai.generate'),
    meshDiscoveryReady: executableCapabilities.includes('mesh.describe'),
    meshLivenessReady: executableCapabilities.includes('mesh.ping'),
  };
}
