
import React, { useState, useEffect } from 'react';

const DCRSMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, cognitive: 0, bandwidth: 0 });
    const [memoryObserved, setMemoryObserved] = useState(false);
    const [bandwidthObserved, setBandwidthObserved] = useState(false);

    useEffect(() => {
        const update = () => {
            const perf = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } };
            const memory = perf.memory;
            setMetrics(prev => ({
                ...prev,
                memory: memory && memory.totalJSHeapSize > 0 ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0,
                bandwidth: typeof (navigator as Navigator & { connection?: { downlink?: number } }).connection?.downlink === 'number'
                    ? (navigator as Navigator & { connection?: { downlink?: number } }).connection!.downlink! 
                    : 0,
            }));
            setMemoryObserved(Boolean(memory && memory.totalJSHeapSize > 0));
            setBandwidthObserved(typeof (navigator as Navigator & { connection?: { downlink?: number } }).connection?.downlink === 'number');
        };
        update();
        const interval = setInterval(update, 2000);
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
                <MetricBar label="CPU (não mensurável no navegador)" value={0} color="text-green-400" />
                <MetricBar label="Memória" value={memoryObserved ? metrics.memory : 0} color="text-purple-400" />
                <MetricBar label="Ciclos Cognitivos (não mensurado)" value={0} color="text-yellow-400" />
                <MetricBar label="Downlink observado" value={bandwidthObserved ? metrics.bandwidth : 0} color="text-cyan-400" />
            </div>
        </div>
    );
};

export default DCRSMonitor;
