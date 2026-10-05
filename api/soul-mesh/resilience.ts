export type MeshCircuitState = 'closed' | 'open' | 'half-open';

export type MeshPeerMetrics = {
  requests: number;
  successes: number;
  failures: number;
  retries: number;
  circuitOpens: number;
  lastLatencyMs?: number;
  totalLatencyMs: number;
  recoveryCount: number;
  totalRecoveryMs: number;
  consecutiveFailures: number;
};

export type MeshResilienceConfig = {
  failureThreshold?: number;
  openMs?: number;
  maxRetries?: number;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
};

type PeerState = {
  state: MeshCircuitState;
  openedAt: number;
  halfOpenProbe: boolean;
  metrics: MeshPeerMetrics;
};

const DEFAULTS: Required<MeshResilienceConfig> = {
  failureThreshold: 3,
  openMs: 30_000,
  maxRetries: 2,
  baseBackoffMs: 250,
  maxBackoffMs: 5_000,
};

export function isIdempotentMeshCapability(capability: string): boolean {
  const value = capability.trim();
  return value === 'mesh.ping' ||
    value === 'mesh.health' ||
    value === 'mesh.describe' ||
    value === 'mesh.handshake' ||
    value.endsWith('.describe') ||
    value.endsWith('.health') ||
    value.endsWith('.capabilities');
}

function secureRandomUnit(): number {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject?.getRandomValues) {
    const values = new Uint32Array(1);
    cryptoObject.getRandomValues(values);
    return values[0] / 0x1_0000_0000;
  }
  return 0.5;
}

export function backoffDelayMs(attempt: number, config: MeshResilienceConfig = {}): number {
  const cfg = { ...DEFAULTS, ...config };
  const exponent = Math.max(0, Math.min(8, Math.floor(attempt)));
  return Math.min(cfg.maxBackoffMs, cfg.baseBackoffMs * (2 ** exponent));
}

export function jitteredBackoffDelayMs(
  attempt: number,
  config: MeshResilienceConfig = {},
  randomUnit = secureRandomUnit(),
): number {
  const base = backoffDelayMs(attempt, config);
  const safeRandom = Math.min(1, Math.max(0, Number(randomUnit)));
  return base + Math.floor(base * 0.2 * safeRandom);
}

export function classifyMeshFailure(error: unknown): 'network' | 'timeout' | 'correlation' | 'protocol' | 'remote' | 'unknown' {
  const message = error instanceof Error ? error.message : String(error);
  if (/abort|timeout/i.test(message)) return 'timeout';
  if (/correlation/i.test(message)) return 'correlation';
  if (/contract|hmac|nonce|replay|unauthorized|invalid/i.test(message)) return 'protocol';
  if (/remote|http/i.test(message)) return 'remote';
  if (/fetch|network|socket|connect/i.test(message)) return 'network';
  return 'unknown';
}

export class MeshResilienceController {
  private readonly cfg: Required<MeshResilienceConfig>;
  private readonly peers = new Map<string, PeerState>();

  constructor(config: MeshResilienceConfig = {}) {
    this.cfg = { ...DEFAULTS, ...config };
  }

  private state(target: string): PeerState {
    const existing = this.peers.get(target);
    if (existing) return existing;
    const created: PeerState = {
      state: 'closed',
      openedAt: 0,
      halfOpenProbe: false,
      metrics: {
        requests: 0,
        successes: 0,
        failures: 0,
        retries: 0,
        circuitOpens: 0,
        totalLatencyMs: 0,
        recoveryCount: 0,
        totalRecoveryMs: 0,
        consecutiveFailures: 0,
      },
    };
    this.peers.set(target, created);
    return created;
  }

  canRequest(target: string): boolean {
    const peer = this.state(target);
    if (peer.state === 'closed') return true;
    if (peer.state === 'open') {
      if (Date.now() - peer.openedAt < this.cfg.openMs) return false;
      if (peer.halfOpenProbe) return false;
      peer.state = 'half-open';
      peer.halfOpenProbe = true;
      return true;
    }
    return !peer.halfOpenProbe;
  }

  begin(target: string): void {
    const peer = this.state(target);
    peer.metrics.requests += 1;
  }

  success(target: string, latencyMs: number): void {
    const peer = this.state(target);
    const wasHalfOpen = peer.state === 'half-open';
    peer.metrics.successes += 1;
    peer.metrics.totalLatencyMs += Math.max(0, latencyMs);
    peer.metrics.lastLatencyMs = Math.max(0, latencyMs);
    if (wasHalfOpen && peer.openedAt > 0) {
      peer.metrics.recoveryCount += 1;
      peer.metrics.totalRecoveryMs += Math.max(0, Date.now() - peer.openedAt);
    }
    peer.metrics.consecutiveFailures = 0;
    peer.state = 'closed';
    peer.openedAt = 0;
    peer.halfOpenProbe = false;
  }

  failure(target: string): void {
    const peer = this.state(target);
    peer.metrics.failures += 1;
    peer.metrics.consecutiveFailures += 1;
    if (peer.state === 'half-open' || peer.metrics.consecutiveFailures >= this.cfg.failureThreshold) {
      peer.state = 'open';
      peer.openedAt = Date.now();
      peer.halfOpenProbe = false;
      peer.metrics.circuitOpens += 1;
    }
  }

  retry(target: string): void {
    this.state(target).metrics.retries += 1;
  }

  snapshot(): Record<string, { state: MeshCircuitState; metrics: MeshPeerMetrics }> {
    return Object.fromEntries(
      [...this.peers.entries()].map(([target, value]) => [
        target,
        { state: value.state, metrics: { ...value.metrics } },
      ]),
    );
  }

  prometheus(): string {
    const lines = [
      '# HELP n02_mesh_requests_total Total outbound Mesh requests.',
      '# TYPE n02_mesh_requests_total counter',
      '# HELP n02_mesh_failures_total Total outbound Mesh failures.',
      '# TYPE n02_mesh_failures_total counter',
      '# HELP n02_mesh_retries_total Total outbound Mesh retries.',
      '# TYPE n02_mesh_retries_total counter',
      '# HELP n02_mesh_latency_ms_total Sum of request latency in milliseconds.',
      '# TYPE n02_mesh_latency_ms_total counter',
      '# HELP n02_mesh_recovery_ms_total Sum of circuit recovery times in milliseconds.',
      '# TYPE n02_mesh_recovery_ms_total counter',
      '# HELP n02_mesh_circuit_opens_total Number of circuit openings.',
      '# TYPE n02_mesh_circuit_opens_total counter',
    ];
    for (const [target, peer] of Object.entries(this.snapshot())) {
      const label = target.replaceAll('"', '');
      const state = peer.state === 'closed' ? 0 : peer.state === 'open' ? 1 : 2;
      lines.push(
        `n02_mesh_requests_total{target="${label}"} ${peer.metrics.requests}`,
        `n02_mesh_failures_total{target="${label}"} ${peer.metrics.failures}`,
        `n02_mesh_retries_total{target="${label}"} ${peer.metrics.retries}`,
        `n02_mesh_latency_ms_total{target="${label}"} ${peer.metrics.totalLatencyMs}`,
        `n02_mesh_recovery_ms_total{target="${label}"} ${peer.metrics.totalRecoveryMs}`,
        `n02_mesh_circuit_opens_total{target="${label}"} ${peer.metrics.circuitOpens}`,
        `n02_mesh_circuit_state{target="${label}"} ${state}`,
      );
    }
    return lines.join('\n');
  }
}
