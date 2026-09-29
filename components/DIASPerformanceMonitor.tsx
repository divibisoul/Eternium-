import React, { useState, useEffect } from 'react';
import { ArrowsPathIcon, ShieldCheckIcon, ClockIcon, CpuChipIcon } from './icons.tsx';

const MetricDisplay: React.FC<{ label: string; value: string; icon: React.ReactNode; }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center text-sm">
        <div className="flex items-center text-gray-300">
            {icon}
            <span className="ml-2">{label}</span>
        </div>
        <span className="font-mono-code font-bold text-white">{value}</span>
    </div>
);

const strategies = [
    { text: 'Otimizando para Velocidade', color: 'text-yellow-400' },
    { text: 'Adaptando para Eficiência', color: 'text-blue-400' },
    { text: 'Refinando para Qualidade', color: 'text-purple-400' },
    { text: 'Mantendo Estado Nominal', color: 'text-green-400' },
];

const DIASPerformanceMonitor: React.FC = () => {
    const [metrics] = useState({
        latency: 0,
        cpu: 0,
        ethicalScore: 0,
    });
    const [strategyIndex] = useState(3);
    const currentStrategy = { text: 'Aguardando métricas observadas', color: 'text-gray-400' };


    return (
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
            <div className="space-y-3">
                <MetricDisplay label="Latência Média" value={`${metrics.latency.toFixed(0)}ms`} icon={<ClockIcon className="w-4 h-4"/>} />
                <MetricDisplay label="Carga de CPU" value={`${metrics.cpu.toFixed(1)}%`} icon={<CpuChipIcon className="w-4 h-4"/>} />
                <MetricDisplay label="Score Ético" value={`${metrics.ethicalScore.toFixed(2)}%`} icon={<ShieldCheckIcon className="w-4 h-4"/>} />
                <div className="pt-2 border-t border-gray-700/50">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Estratégia Atual:</span>
                        <span className={`font-semibold ${currentStrategy.color}`}>{currentStrategy.text}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DIASPerformanceMonitor;
