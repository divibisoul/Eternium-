import React from 'react';

interface DCRSObservations {
    cpu: number | null;
    memory: number | null;
    cognitive: number | null;
    bandwidth: number | null;
}

interface DCRSMonitorProps {
    observations?: Partial<DCRSObservations>;
}

const MetricBar: React.FC<{ label: string; value: number | null; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="text-gray-300">{label}</span>
            <span className={`font-mono-code font-bold ${color}`}>{value === null ? 'N/O' : value.toFixed(1) + '%'}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            {value !== null && (
                <div className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
            )}
        </div>
    </div>
);

const DCRSMonitor: React.FC<DCRSMonitorProps> = ({ observations = {} }) => {
    const metrics: DCRSObservations = {
        cpu: observations.cpu ?? null,
        memory: observations.memory ?? null,
        cognitive: observations.cognitive ?? null,
        bandwidth: observations.bandwidth ?? null,
    };

    return (
        <div className="bg-gray-800/80 p-3 rounded-lg border border-blue-500/30 mb-4">
            <h4 className="text-sm font-bold text-blue-300 mb-2">D.C.R.S. Monitor</h4>
            <div className="space-y-2">
                <MetricBar label="CPU" value={metrics.cpu} color="text-green-400" />
                <MetricBar label="Memória" value={metrics.memory} color="text-purple-400" />
                <MetricBar label="Ciclos Cognitivos" value={metrics.cognitive} color="text-yellow-400" />
                <MetricBar label="Largura de Banda" value={metrics.bandwidth} color="text-cyan-400" />
            </div>
        </div>
    );
};

export default DCRSMonitor;
