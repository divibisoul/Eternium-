import React from 'react';

type MetricValue = number | null;

const MetricBar: React.FC<{ label: string; value: MetricValue; color: string }> = ({ label, value, color }) => {
    const measured = typeof value === 'number' && Number.isFinite(value);
    return (
        <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="text-gray-300">{label}</span>
                <span className={`font-mono-code font-bold ${color}`}>{measured ? `${value.toFixed(1)}%` : 'N/D'}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                {measured && (
                    <div
                        className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                    />
                )}
            </div>
        </div>
    );
};

const DCRSMonitor: React.FC = () => {
    // No runtime telemetry source is connected to this presentation component.
    // Zero/random values would falsely imply DCRS measurements.
    const metrics = { cpu: null, memory: null, cognitive: null, bandwidth: null };

    return (
        <div className="bg-gray-800/80 p-3 rounded-lg border border-blue-500/30 mb-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-blue-300">D.C.R.S. Monitor</h4>
                <span className="text-[10px] font-mono-code text-gray-500">TELEMETRIA: N/D</span>
            </div>
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
