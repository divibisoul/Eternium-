import React from 'react';
import { ArrowsPathIcon, ShieldCheckIcon, ClockIcon, CpuChipIcon } from './icons.tsx';

export interface DIASObservedMetrics {
    latency: number;
    cpu: number;
    ethicalScore: number;
}

interface DIASPerformanceMonitorProps {
    metrics?: DIASObservedMetrics | null;
    strategy?: string | null;
}

const MetricDisplay: React.FC<{ label: string; value: string; icon: React.ReactNode; }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center text-sm">
        <div className="flex items-center text-gray-300">
            {icon}
            <span className="ml-2">{label}</span>
        </div>
        <span className="font-mono-code font-bold text-white">{value}</span>
    </div>
);

const DIASPerformanceMonitor: React.FC<DIASPerformanceMonitorProps> = ({ metrics, strategy }) => (
    <div className="bg-gray-800/80 p-4 rounded-lg border border-orange-500/30 mb-4 animate-fade-in">
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
        <div className="flex items-center mb-3">
            <ArrowsPathIcon className="w-8 h-8 text-orange-400 mr-3"/>
            <div>
                <h4 className="text-md font-bold text-orange-300">DIAS Adaptation Monitor (Δ)</h4>
                <p className="text-xs text-gray-400">Análise de Performance e Feedback</p>
            </div>
        </div>
        {!metrics && <p className="text-xs text-gray-500 mb-3">Telemetria DIAS real não está conectada neste frontend.</p>}
        <div className="space-y-3">
            <MetricDisplay label="Latência Média" value={metrics ? `${metrics.latency.toFixed(0)}ms` : 'N/D'} icon={<ClockIcon className="w-4 h-4"/>} />
            <MetricDisplay label="Carga de CPU" value={metrics ? `${metrics.cpu.toFixed(1)}%` : 'N/D'} icon={<CpuChipIcon className="w-4 h-4"/>} />
            <MetricDisplay label="Score Ético" value={metrics ? `${metrics.ethicalScore.toFixed(2)}%` : 'N/D'} icon={<ShieldCheckIcon className="w-4 h-4"/>} />
            <div className="pt-2 border-t border-gray-700/50">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Estratégia Atual:</span>
                    <span className="font-semibold text-muted-foreground">{strategy ?? 'N/D'}</span>
                </div>
            </div>
        </div>
    </div>
);

export default DIASPerformanceMonitor;