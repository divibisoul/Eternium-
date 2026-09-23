import React from 'react';
import { ClockIcon } from './icons.tsx';

/**
 * Temporal status is an observation surface, not an automatic claim of coherence.
 * A connected temporal runtime can provide a concrete status through the prop.
 */
export interface TemporalConsciousnessMonitorProps {
    status?: string | null;
}

export const TemporalConsciousnessMonitor: React.FC<TemporalConsciousnessMonitorProps> = ({ status = null }) => {
    const observedStatus = status ?? 'Não observado';

    return (
        <div className="flex items-center space-x-1.5" title="Estado temporal observado">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs">
                Tempo: <span className="font-semibold text-gray-400">{observedStatus}</span>
            </span>
        </div>
    );
};
