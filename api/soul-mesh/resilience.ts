export type MeshFailureKind =
  | 'timeout' | 'network' | 'invalid_json' | 'correlation' | 'identity'
  | 'remote' | 'configuration' | 'validation' | 'circuit_open' | 'unknown';
export type MeshCircuitState = 'closed' | 'open' | 'half-open';

export interface MeshForensicRecord {
  at: number; target: string; capability: string; kind: MeshFailureKind; message: string;
  stack?: string; attempt: number; retryable: boolean; circuit: MeshCircuitState;
}
export interface MeshResilienceConfig {
  failureThreshold?: number; resetTimeoutMs?: number; maxRetries?: number;
  baseBackoffMs?: number; maxBackoffMs?: number; forensicLimit?: number;
}
export interface MeshPeerMetrics {
  requests: number; successes: number; failures: number; retries: number; circuitOpens: number;
  fallbacks: number; consecutiveFailures: number; failuresByKind: Partial<Record<MeshFailureKind, number>>;
  lastFailureAt?: number; lastFailureKind?: MeshFailureKind; lastFailureMessage?: string;
}
export interface MeshResilienceSnapshot {
  peers: Record<string, { state: MeshCircuitState; metrics: MeshPeerMetrics; forensic: MeshForensicRecord[] }>;
  generatedAt: number;
}
interface PeerState {
  state: MeshCircuitState; openedAt: number; halfOpenProbe: boolean;
  metrics: MeshPeerMetrics; forensic: MeshForensicRecord[];
}

const DEFAULTS: Required<MeshResilienceConfig> = {
  failureThreshold: 3, resetTimeoutMs: 15000, maxRetries: 2,
  baseBackoffMs: 100, maxBackoffMs: 1500, forensicLimit: 200,
};
function envNumber(name: string): number | undefined {
  const value = Number((globalThis as any).process?.env?.[name]);
  return Number.isFinite(value) ? value : undefined;
}
function envConfig(): MeshResilienceConfig {
  return {
    failureThreshold: envNumber('N02_MESH_FAILURE_THRESHOLD'), resetTimeoutMs: envNumber('N02_MESH_RESET_TIMEOUT_MS'),
    maxRetries: envNumber('N02_MESH_MAX_RETRIES'), baseBackoffMs: envNumber('N02_MESH_BASE_BACKOFF_MS'),
    maxBackoffMs: envNumber('N02_MESH_MAX_BACKOFF_MS'),
  };
}
function positiveInt(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && Number(value) > 0 ? Math.floor(Number(value)) : fallback;
}
function bounded(value: number | undefined, fallback: number, max: number): number {
  if (!Number.isFinite(value) || Number(value) < 0) return fallback;
  return Math.min(Math.floor(Number(value)), max);
}
function configOf(input?: MeshResilienceConfig): Required<MeshResilienceConfig> {
  return {
    failureThreshold: positiveInt(input?.failureThreshold, DEFAULTS.failureThreshold),
    resetTimeoutMs: positiveInt(input?.resetTimeoutMs, DEFAULTS.resetTimeoutMs),
    maxRetries: bounded(input?.maxRetries, DEFAULTS.maxRetries, 8),
    baseBackoffMs: bounded(input?.baseBackoffMs, DEFAULTS.baseBackoffMs, 10000),
    maxBackoffMs: positiveInt(input?.maxBackoffMs, DEFAULTS.maxBackoffMs),
    forensicLimit: positiveInt(input?.forensicLimit, DEFAULTS.forensicLimit),
  };
}
export function isIdempotentCapability(capability: string): boolean {
  return new Set(['mesh.ping', 'mesh.health', 'mesh.describe', 'capability.list']).has(capability.trim());
}
export function classifyMeshError(error: unknown): MeshFailureKind {
  const message = error instanceof Error ? error.message : String(error);
  if (/abort|timeout|deadline/i.test(message)) return 'timeout';
  if (/PEER_URL_NOT_CONFIGURED|CAPABILITY_REQUIRED|SELF_TARGET/i.test(message)) return 'configuration';
  if (/JSON/i.test(message)) return 'invalid_json';
  if (/CORRELATION/i.test(message)) return 'correlation';
  if (/IDENTITY/i.test(message)) return 'identity';
  if (/REMOTE_ERROR|HTTP_\d+/i.test(message)) return 'remote';
  if (/retry|network|fetch|ECONN|ENOTFOUND|EAI_AGAIN/i.test(message)) return 'network';
  if (/CIRCUIT/i.test(message)) return 'circuit_open';
  if (/INVALID|REQUIRED/i.test(message)) return 'validation';
  return 'unknown';
}
export function isRetryableMeshError(error: unknown): boolean {
  return ['timeout', 'network', 'remote', 'invalid_json'].includes(classifyMeshError(error));
}
export function backoffDelayMs(attempt: number, cfg?: MeshResilienceConfig): number {
  const resolved = configOf(cfg);
  return Math.min(resolved.maxBackoffMs, resolved.baseBackoffMs * (2 ** Math.max(0, Math.floor(attempt))));
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MeshResilienceController {
  private readonly cfg: Required<MeshResilienceConfig>;
  private readonly peers = new Map<string, PeerState>();
  constructor(config?: MeshResilienceConfig) { this.cfg = configOf({ ...envConfig(), ...config }); }
  private state(target: string): PeerState {
    let value = this.peers.get(target);
    if (!value) {
      value = { state: 'closed', openedAt: 0, halfOpenProbe: false, metrics: {
        requests: 0, successes: 0, failures: 0, retries: 0, circuitOpens: 0, fallbacks: 0,
        consecutiveFailures: 0, failuresByKind: {},
      }, forensic: [] };
      this.peers.set(target, value);
    }
    return value;
  }
  begin(target: string): void {
    const peer = this.state(target);
    if (!this.canRequest(target)) throw new Error(`SOUL_MESH_CIRCUIT_OPEN:${target}`);
    if (peer.state === 'half-open') peer.halfOpenProbe = true;
  }
  requestStarted(target: string): void { this.state(target).metrics.requests += 1; }
  canRequest(target: string): boolean {
    const peer = this.state(target);
    if (peer.state === 'closed') return true;
    if (peer.state === 'half-open') return !peer.halfOpenProbe;
    if (Date.now() - peer.openedAt < this.cfg.resetTimeoutMs) return false;
    peer.state = 'half-open'; peer.halfOpenProbe = false; return true;
  }
  success(target: string): void {
    const peer = this.state(target); peer.metrics.successes += 1; peer.metrics.consecutiveFailures = 0;
    peer.state = 'closed'; peer.openedAt = 0; peer.halfOpenProbe = false;
  }
  failure(target: string, capability: string, error: unknown, attempt: number, retryable: boolean): void {
    const peer = this.state(target); const kind = classifyMeshError(error);
    peer.metrics.failures += 1; peer.metrics.consecutiveFailures += 1;
    peer.metrics.failuresByKind[kind] = (peer.metrics.failuresByKind[kind] ?? 0) + 1;
    peer.metrics.lastFailureAt = Date.now(); peer.metrics.lastFailureKind = kind;
    peer.metrics.lastFailureMessage = error instanceof Error ? error.message : String(error);
    if (peer.metrics.consecutiveFailures >= this.cfg.failureThreshold || peer.state === 'half-open') {
      peer.state = 'open'; peer.openedAt = Date.now(); peer.halfOpenProbe = false; peer.metrics.circuitOpens += 1;
    }
    peer.forensic.push({ at: Date.now(), target, capability, kind,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined, attempt, retryable, circuit: peer.state });
    if (peer.forensic.length > this.cfg.forensicLimit) peer.forensic.splice(0, peer.forensic.length - this.cfg.forensicLimit);
  }
  retry(target: string): void { this.state(target).metrics.retries += 1; }
  fallback(target: string): void { this.state(target).metrics.fallbacks += 1; }
  async execute<T>(target: string, capability: string, operation: (attempt: number) => Promise<T>, options: { idempotent?: boolean; fallback?: () => Promise<T> } = {}): Promise<T> {
    const idempotent = options.idempotent ?? isIdempotentCapability(capability);
    const retriesAllowed = idempotent ? this.cfg.maxRetries : 0;
    this.requestStarted(target);
    for (let attempt = 0; attempt <= retriesAllowed; attempt += 1) {
      try {
        this.begin(target);
        const result = await operation(attempt); this.success(target); return result;
      } catch (error) {
        const retryable = idempotent && isRetryableMeshError(error) && attempt < retriesAllowed;
        this.failure(target, capability, error, attempt, retryable);
        if (!retryable) break; this.retry(target); await sleep(backoffDelayMs(attempt, this.cfg));
      }
    }
    if (options.fallback) { this.fallback(target); return options.fallback(); }
    throw new Error(`SOUL_MESH_RESILIENCE_EXHAUSTED:${target}:${capability}`);
  }
  snapshot(): MeshResilienceSnapshot {
    const peers: MeshResilienceSnapshot['peers'] = {};
    for (const [target, peer] of this.peers) peers[target] = {
      state: peer.state,
      metrics: { ...peer.metrics, failuresByKind: { ...peer.metrics.failuresByKind } },
      forensic: peer.forensic.map(record => ({ ...record })),
    };
    return { peers, generatedAt: Date.now() };
  }
  prometheus(): string {
    const lines = [
      '# HELP n02_mesh_requests_total Total logical outbound Mesh requests.', '# TYPE n02_mesh_requests_total counter',
      '# HELP n02_mesh_failures_total Total outbound Mesh failures.', '# TYPE n02_mesh_failures_total counter',
      '# HELP n02_mesh_failures_by_kind_total Total outbound Mesh failures by signature.', '# TYPE n02_mesh_failures_by_kind_total counter',
      '# HELP n02_mesh_retries_total Total Mesh retries.', '# TYPE n02_mesh_retries_total counter',
      '# HELP n02_mesh_circuit_state Circuit state: 0=closed, 1=open, 2=half-open.', '# TYPE n02_mesh_circuit_state gauge',
    ];
    for (const [target, peer] of this.peers) {
      const label = target.replace(/[^A-Za-z0-9_-]/g, '_'); const state = peer.state === 'closed' ? 0 : peer.state === 'open' ? 1 : 2;
      lines.push(`n02_mesh_requests_total{target="${label}"} ${peer.metrics.requests}`);
      lines.push(`n02_mesh_failures_total{target="${label}"} ${peer.metrics.failures}`);
      lines.push(`n02_mesh_retries_total{target="${label}"} ${peer.metrics.retries}`);
      lines.push(`n02_mesh_circuit_state{target="${label}"} ${state}`);
      for (const [kind, count] of Object.entries(peer.metrics.failuresByKind)) lines.push(`n02_mesh_failures_by_kind_total{target="${label}",kind="${kind}"} ${count}`);
    }
    return `${lines.join('\n')}\n`;
  }
}
export const meshResilience = new MeshResilienceController();
