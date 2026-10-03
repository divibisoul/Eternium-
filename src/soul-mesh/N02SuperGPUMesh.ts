import { requestPeerCapability } from '../../api/soul-mesh/peer-client';

export const N02_SUPERGPU_MESH_CAPABILITY = 'mesh.supergpu.execute@1.0.0' as const;

export async function requestN07SuperGPU(
  values: number[],
  operation = 'identity',
  device?: string,
  timeoutMs = 15_000,
) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('SUPERGPU_VALUES_INVALID');
  }
  if (!operation.trim()) throw new Error('SUPERGPU_OPERATION_REQUIRED');
  const metadata = {
    operation,
    ...(device?.trim() ? { device: device.trim() } : {}),
  };
  // N02's canonical peer client currently carries payload only; the N07
  // compatibility operation remains available through its existing metadata
  // envelope. The values are sent unchanged over soul-mesh/1.
  return requestPeerCapability('N07', N02_SUPERGPU_MESH_CAPABILITY, {
    values,
    metadata,
  }, timeoutMs);
}
