
import React, { useState, useEffect } from 'react';

const DCRSMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, cognitive: 0, bandwidth: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics({
                cpu: 40 + Math.random() * 25,
                memory: 55 + Math.random() * 20,
                cognitive: 30 + Math.random() * 50,
                bandwidth: 70 + Math.random() * 25,
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const MetricBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
        <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
                <span className="text-gray-300">{label}</span>
                <span className={`font-mono-code font-bold ${color}`}>{value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );

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
