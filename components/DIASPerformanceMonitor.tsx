import React from 'react';
import { ArrowsPathIcon, ShieldCheckIcon, ClockIcon, CpuChipIcon } from './icons.tsx';

interface DIASObservations {
    latency: number | null;
    cpu: number | null;
    ethicalScore: number | null;
}

interface DIASPerformanceMonitorProps {
    observations?: Partial<DIASObservations>;
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

const DIASPerformanceMonitor: React.FC<DIASPerformanceMonitorProps> = ({ observations = {}, strategy = null }) => {
    return (
        <div className="bg-gray-800/80 p-4 rounded-lg border border-orange-500/30 mb-4">
            <div className="flex items-center mb-3">
                <ArrowsPathIcon className="w-8 h-8 text-orange-400 mr-3"/>
                <div>
                    <h4 className="text-md font-bold text-orange-300">DIAS Adaptation Monitor (Δ)</h4>
                    <p className="text-xs text-gray-400">Análise de Performance e Feedback</p>
                </div>
            </div>
            <div className="space-y-3">
                <MetricDisplay label="Latência Média" value={observations.latency === undefined || observations.latency === null ? 'N/O' : observations.latency.toFixed(0) + 'ms'} icon={<ClockIcon className="w-4 h-4"/>} />
                <MetricDisplay label="Carga de CPU" value={observations.cpu === undefined || observations.cpu === null ? 'N/O' : observations.cpu.toFixed(1) + '%'} icon={<CpuChipIcon className="w-4 h-4"/>} />
                <MetricDisplay label="Score Ético" value={observations.ethicalScore === undefined || observations.ethicalScore === null ? 'N/O' : observations.ethicalScore.toFixed(2) + '%'} icon={<ShieldCheckIcon className="w-4 h-4"/>} />
                <div className="pt-2 border-t border-gray-700/50">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Estratégia Atual:</span>
                        <span className="font-semibold text-gray-400">{strategy ?? 'Aguardando observações reais'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DIASPerformanceMonitor;
