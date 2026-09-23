import { useEffect } from 'react';
import { AuditEventType } from '../types.ts';

/**
 * N02 application boot projection.
 * The previous implementation used delayed Promises as a synthetic boot.
 * Boot completion must come from a real runtime/mesh authority; this hook
 * therefore records only that the UI mounted and does not claim readiness.
 */
export const useSystemOrchestrator = (
    logEvent: (type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => void
) => {
    useEffect(() => {
        logEvent(
            AuditEventType.SYSTEM_INIT,
            'Interface N02 montada; estado operacional do núcleo aguarda evidência de runtime real.',
            'warn',
        );
    }, [logEvent]);
};
