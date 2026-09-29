import { useEffect } from 'react';
import { AuditEventType } from '../types.ts';

const BOOT_TIMEOUT = 10000;

type RuntimeStatus = {
  nucleus: 'N02';
  declaredCapabilities: string[];
  executableCapabilities: string[];
  agents: Array<{ id: string; capabilities: string[] }>;
  executionCoverage: { declared: number; executable: number; ratio: number };
};

/**
 * Boot orchestration is evidence-driven. It probes the actual N02 server runtime
 * instead of completing local timers and calling that "online".
 */
export const useSystemOrchestrator = (
  logEvent: (type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => void,
) => {
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BOOT_TIMEOUT);

    const probeRuntime = async () => {
      try {
        const response = await fetch('/api/n02-runtime-status', {
          method: 'GET',
          headers: { accept: 'application/json' },
          signal: controller.signal,
          cache: 'no-store',
        });

        const body = await response.json() as Partial<RuntimeStatus> & { error?: string };
        if (!response.ok) throw new Error(body.error || 'N02_RUNTIME_STATUS_HTTP_' + response.status);

        const executable = Array.isArray(body.executableCapabilities) ? body.executableCapabilities.length : -1;
        const declared = Array.isArray(body.declaredCapabilities) ? body.declaredCapabilities.length : -1;
        const agents = Array.isArray(body.agents) ? body.agents.length : -1;

        if (
          body.nucleus !== 'N02' ||
          executable < 0 ||
          declared < 0 ||
          agents < 0 ||
          !body.executionCoverage ||
          typeof body.executionCoverage.ratio !== 'number' ||
          !Number.isFinite(body.executionCoverage.ratio)
        ) {
          throw new Error('N02_RUNTIME_STATUS_INVALID');
        }

        logEvent(
          AuditEventType.SYSTEM_INIT,
          'N02 runtime verificado por endpoint real: ' +
            executable + '/' + declared + ' capacidades executáveis; agentes=' + agents +
            '; cobertura=' + body.executionCoverage.ratio.toFixed(3) + '.',
          'info',
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const level = message.includes('AbortError') ? 'warn' : 'warn';
        logEvent(
          AuditEventType.SYSTEM_INIT,
          'N02 runtime não mensurado neste cliente: ' + message + '. Nenhum estado online foi inferido.',
          level,
        );
      } finally {
        clearTimeout(timer);
      }
    };

    void probeRuntime();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [logEvent]);
};
