import { describe, expect, it } from 'vitest';
import { requestN07SuperGPU } from './N02SuperGPUMesh';

describe('N02 SuperGPU Mesh client', () => {
  it('rejects invalid values before transport', async () => {
    await expect(requestN07SuperGPU([Number.NaN])).rejects.toThrow('SUPERGPU_VALUES_INVALID');
  });

  it('rejects empty operation before transport', async () => {
    await expect(requestN07SuperGPU([1], '  ')).rejects.toThrow('SUPERGPU_OPERATION_REQUIRED');
  });
});
