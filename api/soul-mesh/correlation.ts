import { randomUUID } from 'node:crypto';

export type MeshCorrelation = { correlationId: string; parentCorrelationId?: string; source: string; target: string; startedAt: number };

export function createMeshCorrelation(source: string, target: string, parentCorrelationId?: string): MeshCorrelation {
  return { correlationId: randomUUID(), parentCorrelationId, source, target, startedAt: Date.now() };
}
