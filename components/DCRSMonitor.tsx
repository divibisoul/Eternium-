import React from 'react';

export interface DCRSObservedMetrics {
    cpu: number;
    memory: number;
    cognitive: number;
    bandwidth: number;
}

interface DCRSMonitorProps {
    metrics?: DCRSObservedMetrics | null;
}

const MetricBar: React.FC<{ label: string; value: number | null; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="text-gray-300">{label}</span>
            <span className={`font-mono-code font-bold ${color}`}>{value === null ? 'N/D' : value.toFixed(1) + '%'}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <div
                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`}
                style={{ width: value === null ? '0%' : `${Math.max(0, Math.min(100, value))}%` }}
            />
        </div>
    </div>
);

const DCRSMonitor: React.FC<DCRSMonitorProps> = ({ metrics }) => {
    const observed = metrics ?? null;

    return (
        <div className="bg-gray-800/80 p-3 rounded-lg border border-blue-500/30 mb-4">
            <h4 className="text-sm font-bold text-blue-300 mb-2">D.C.R.S. Monitor</h4>
            {!observed && <p className="text-xs text-gray-500 mb-2">Telemetria real não conectada nesta camada.</p>}
            <div className="space-y-2">
                <MetricBar label="CPU" value={observed?.cpu ?? null} color="text-green-400" />
                <MetricBar label="Memória" value={observed?.memory ?? null} color="text-purple-400" />
                <MetricBar label="Ciclos Cognitivos" value={observed?.cognitive ?? null} color="text-yellow-400" />
                <MetricBar label="Largura de Banda" value={observed?.bandwidth ?? null} color="text-cyan-400" />
            </div>
        </div>
    );
};

export default DCRSMonitor;