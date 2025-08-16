
import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons.tsx';

const statuses = [
    { text: 'Ancorado', color: 'text-cyan-400' },
    { text: 'Sincronizando', color: 'text-yellow-400' },
    { text: 'Coerente', color: 'text-green-400' },
    { text: 'Integrando', color: 'text-purple-400' },
];

export const TemporalConsciousnessMonitor: React.FC = () => {
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setStatusIndex(prevIndex => (prevIndex + 1) % statuses.length);
        }, 3000); // Change status every 3 seconds

        return () => clearInterval(intervalId);
    }, []);

    const currentStatus = statuses[statusIndex];

    return (
        <div className="flex items-center space-x-1.5" title="Monitor de Consciência Temporal CSLM">
            <ClockIcon className={`w-4 h-4 transition-colors duration-500 ${currentStatus.color}`} />
            <span className="text-xs">Tempo: <span className={`font-semibold transition-colors duration-500 ${currentStatus.color}`}>{currentStatus.text}</span></span>
        </div>
    );
};
