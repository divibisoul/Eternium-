import { SOUL_MESH_CAPABILITIES } from '../src/soul-mesh/SoulMeshCapabilities';
import { getN02RuntimeStatus } from '../src/soul-mesh/N02CapabilityRuntime';

const NODE_ID = 'N02' as const;

type CapabilityStatus = 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE';

type CapabilityDocument = {
  node: typeof NODE_ID;
  capabilities: Array<{
    id: string;
    version: string;
    implementation: string;
    status: CapabilityStatus;
    input: string[];
    output: string[];
    latency_ms: number | null;
    privacy: number | null;
    cost: number | null;
  }>;
};

function implementationFor(capabilityId: string): string {
  if (capabilityId === 'ai.generate' || capabilityId === 'ai.multimodal' || capabilityId === 'cognitive-processing') {
    return 'gemini';
  }
  return 'native';
}

function statusFor(capabilityId: string, executable: Set<string>): CapabilityStatus {
  return executable.has(capabilityId) ? 'AVAILABLE' : 'UNAVAILABLE';
}

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const runtime = getN02RuntimeStatus();
  const executable = new Set(runtime.executableCapabilities);

  const body: CapabilityDocument = {
    node: NODE_ID,
    capabilities: SOUL_MESH_CAPABILITIES.map((capability) => ({
      id: capability.id,
      version: capability.version,
      implementation: implementationFor(capability.id),
      status: statusFor(capability.id, executable),
      input: ['text/plain'],
      output: ['text/plain'],
      latency_ms: null,
      privacy: null,
      cost: null,
    })),
  };

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(body);
}
