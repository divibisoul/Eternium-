export type MeshCorrelation = { correlationId: string; parentCorrelationId?: string; source: string; target: string; startedAt: number };

export function createMeshCorrelation(source: string, target: string, parentCorrelationId?: string): MeshCorrelation {
  return { correlationId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`, parentCorrelationId, source, target, startedAt: Date.now() };
}
