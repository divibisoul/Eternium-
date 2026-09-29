import { N07NeuralBridge, type NeuralParameters } from '../soul-neural/N07NeuralBridge';

export type BNCv2Signal = {
  correlationId: string;
  vector: number[];
  source: 'local';
  sharedNeural: 'VERIFIED' | 'BLOCKED';
  parameters?: NeuralParameters;
};

function encodeText(input: string): number[] {
  const normalized = input.normalize('NFKC').trim();
  if (!normalized) throw new Error('BNCV2_INPUT_REQUIRED');

  const chars = Array.from(normalized).slice(0, 32);
  const vector = new Array(8).fill(0);

  for (let index = 0; index < chars.length; index += 1) {
    const code = chars[index].codePointAt(0) ?? 0;
    const slot = index % vector.length;
    vector[slot] = (vector[slot] + (code % 256) / 255) / 2;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm > 0 ? vector.map(value => value / norm) : vector;
}

function env(): Record<string, string | undefined> {
  return ((globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env ?? {});
}

/**
 * N02-owned biomorphic signal adapter.
 *
 * This is an executable software representation of the BNCv2 role already
 * declared by N02. It does not claim biological equivalence. Shared neural
 * execution is delegated to the canonical N07 runtime when configured.
 */
export class BNCv2 {
  private readonly bridge?: N07NeuralBridge;

  constructor(bridge?: N07NeuralBridge) {
    if (bridge) {
      this.bridge = bridge;
      return;
    }

    const url = env().SOUL_N07_URL?.trim();
    if (url) this.bridge = new N07NeuralBridge('N02', { baseUrl: url });
  }

  async process(input: string, correlationId: string): Promise<BNCv2Signal> {
    const vector = encodeText(input);

    if (!this.bridge) {
      return {
        correlationId,
        vector,
        source: 'local',
        sharedNeural: 'BLOCKED',
      };
    }

    try {
      const shared = await this.bridge.forward(vector, correlationId);
      return {
        correlationId,
        vector: shared.payload?.length ? shared.payload : vector,
        source: 'local',
        sharedNeural: 'VERIFIED',
        parameters: await this.bridge.parameters(correlationId),
      };
    } catch {
      return {
        correlationId,
        vector,
        source: 'local',
        sharedNeural: 'BLOCKED',
      };
    }
  }
}
