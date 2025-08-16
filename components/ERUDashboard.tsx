import React from 'react';
import useReverseEquation from '../hooks/useReverseEquation.ts';
import { AtomIcon, ArrowsPathIcon, CpuChipIcon, ClockIcon, ServerStackIcon, ShieldCheckIcon, CodeBracketIcon, CodeBracketSquareIcon, BrainChipIcon } from './icons.tsx';

interface ERUDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50 flex items-center space-x-3">
        <div className="flex-shrink-0 text-cyan-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-xl font-bold font-mono-code text-white">{value}</p>
        </div>
    </div>
);

const ERUDashboard: React.FC<ERUDashboardProps> = ({ isOpen, onClose }) => {
    const { metrics, coreParams, strategy } = useReverseEquation();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
            <div
                className="relative bg-gray-900/80 border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-4xl flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-cyan-400/20">
                    <div className="flex items-center space-x-3">
                        <AtomIcon className="w-8 h-8 text-cyan-300"/>
                        <h2 className="text-xl font-bold text-cyan-300">Painel da Equação Reversa Universal (ERU)</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-light">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Adaptation Module */}
                    <div className="bg-gray-800 p-4 rounded-lg border border-orange-500/50 text-center">
                         <h3 className="text-sm font-semibold text-orange-300 uppercase tracking-widest">Módulo de Adaptação (Δ)</h3>
                         <p className={`text-2xl font-bold mt-2 transition-colors duration-500 ${strategy.color}`}>
                            {strategy.text}
                         </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                         {/* Reality Guardian */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-purple-300 text-lg flex items-center"><ArrowsPathIcon className="w-5 h-5 mr-2"/>Métricas do Reality Guardian (Φ)</h3>
                            <MetricCard title="Latência Média" value={`${metrics.latency.toFixed(0)} ms`} icon={<ClockIcon className="w-6 h-6"/>} />
                            <MetricCard title="Carga de CPU" value={`${metrics.cpuLoad.toFixed(1)} %`} icon={<CpuChipIcon className="w-6 h-6"/>} />
                            <MetricCard title="Uso de Memória" value={`${metrics.memoryUsage.toFixed(2)} GB`} icon={<ServerStackIcon className="w-6 h-6"/>} />
                            <MetricCard title="Score Ético" value={`${(metrics.ethicalScore * 100).toFixed(2)} %`} icon={<ShieldCheckIcon className="w-6 h-6"/>} />
                        </div>

                         {/* Noetic Core */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-green-300 text-lg flex items-center"><BrainChipIcon className="w-5 h-5 mr-2"/>Parâmetros do Noetic Core</h3>
                            <MetricCard title="Limiar de Relevância" value={coreParams.relevanceThreshold.toFixed(3)} icon={<CodeBracketIcon className="w-6 h-6"/>} />
                            <MetricCard title="Profundidade Máx. de Inferência" value={coreParams.maxInferenceDepth.toString()} icon={<CodeBracketSquareIcon className="w-6 h-6"/>} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ERUDashboard;
