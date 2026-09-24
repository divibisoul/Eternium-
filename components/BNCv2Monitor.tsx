import React from 'react';
import { QuantumConnectomeIcon, BrainChipIcon } from './icons.tsx';

interface BNCv2Metrics {
    density: number;
    plasticity: number;
    modulation: number;
}

interface BNCv2MonitorProps {
    metrics?: BNCv2Metrics | null;
}

const MetricDisplay: React.FC<{ label: string; value: number | null; unit: string; color: string; }> = ({ label, value, unit, color }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-gray-300">{label}</span>
            <span className={`text-lg font-bold font-mono-code ${color}`}>
                {value === null ? 'N/D' : value.toFixed(2)}
                <span className="text-xs ml-1">{value === null ? '' : unit}</span>
            </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div
                className={`h-2 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`}
                style={{ width: value === null ? '0%' : `${Math.max(0, Math.min(100, value))}%` }}
            />
        </div>
    </div>
);

export const BNCv2Monitor: React.FC<BNCv2MonitorProps> = ({ metrics }) => (
    <div className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30 mb-4 animate-fade-in">
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
        <div className="flex items-center mb-3">
            <QuantumConnectomeIcon className="w-8 h-8 text-purple-400 mr-3"/>
            <BrainChipIcon className="w-6 h-6 text-purple-300 mr-2"/>
            <div>
                <h4 className="text-md font-bold text-purple-300">Monitor BNCv2</h4>
                <p className="text-xs text-gray-400">Estado Operacional do Núcleo Biomórfico</p>
            </div>
        </div>
        {!metrics && <p className="text-xs text-gray-500 mb-3">Métricas BNCv2 reais não estão expostas neste frontend.</p>}
        <div className="space-y-4">
            <MetricDisplay label="Densidade Sináptica" value={metrics?.density ?? null} unit="%" color="text-cyan-400" />
            <MetricDisplay label="Atividade de Plasticidade" value={metrics?.plasticity ?? null} unit="Hz" color="text-yellow-400" />
            <MetricDisplay label="Modulação Dopaminérgica" value={metrics?.modulation ?? null} unit="%" color="text-green-400" />
        </div>
    </div>
);