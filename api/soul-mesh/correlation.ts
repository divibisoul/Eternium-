
let correlationSequence = 0;

function createFallbackCorrelationId(): string {
  correlationSequence += 1;
  return `mesh-${Date.now()}-${correlationSequence}`;
}
export type MeshCorrelation = { correlationId: string; parentCorrelationId?: string; source: string; target: string; startedAt: number };

export function createMeshCorrelation(source: string, target: string, parentCorrelationId?: string): MeshCorrelation {
  return { correlationId: globalThis.crypto?.randomUUID?.() ?? createFallbackCorrelationId(), parentCorrelationId, source, target, startedAt: Date.now() };
}
