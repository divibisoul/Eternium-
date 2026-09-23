
import { useState, useCallback, useEffect } from 'react';
import { AuditLogEntry, AuditEventType } from '../types.ts';

const MAX_LOG_ENTRIES = 50;

export const useAuditSystem = () => {
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [hasCriticalErrors, setHasCriticalErrors] = useState(false);

    const logEvent = useCallback((type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => {
        const newEntry: AuditLogEntry = {
            id: `${Date.now()}-${Math.random()}`,
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
        logEvent(
            AuditEventType.SYSTEM_RESTORED,
            'Erro local marcado como limpo pelo operador. Nenhuma remediação externa é declarada sem evidência do executor SARA.',
            'warn',
        );
    }, [logEvent]);

     useEffect(() => {
        logEvent(AuditEventType.SYSTEM_INIT, 'Sistema Aeternum inicializado. Protocolos de auditoria ativos.', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return { auditLog, logEvent, hasCriticalErrors, clearCriticalErrors };
};
