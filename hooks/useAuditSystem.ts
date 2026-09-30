
import { useState, useCallback, useEffect } from 'react';

import { AuditLogEntry, AuditEventType } from '../types.ts';

let auditSequence = 0;

function createAuditId(): string {
    const sequence = ++auditSequence;
    const bytes = new Uint32Array(2);
    if (globalThis.crypto?.getRandomValues) {
        globalThis.crypto.getRandomValues(bytes);
        return `${Date.now()}-${bytes[0].toString(16)}-${bytes[1].toString(16)}-${sequence}`;
    }
    return `${Date.now()}-${sequence}`;
}

const MAX_LOG_ENTRIES = 50;

export const useAuditSystem = () => {
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [hasCriticalErrors, setHasCriticalErrors] = useState(false);

    const logEvent = useCallback((type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => {
        const newEntry: AuditLogEntry = {
            id: createAuditId(),
            timestamp: Date.now(),
            type,
            message,
            level
        };

        if (level === 'error') {
            setHasCriticalErrors(true);
        }

        setAuditLog(prevLog => [newEntry, ...prevLog].slice(0, MAX_LOG_ENTRIES));
    }, []);

    const clearCriticalErrors = useCallback(() => {
        setHasCriticalErrors(false);
        logEvent(AuditEventType.SYSTEM_INIT, 'Falha crítica apenas reconhecida/limpa manualmente; nenhuma remediação técnica foi declarada sem evidência.', 'warn');
    }, [logEvent]);

     useEffect(() => {
        logEvent(AuditEventType.SYSTEM_INIT, 'Sistema Aeternum inicializado. Protocolos de auditoria ativos.', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return { auditLog, logEvent, hasCriticalErrors, clearCriticalErrors };
};
