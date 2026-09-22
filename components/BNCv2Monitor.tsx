
import React, { useState, useEffect } from 'react';
import { QuantumConnectomeIcon, BrainChipIcon } from './icons.tsx';

const MetricDisplay: React.FC<{ label: string; value: number; unit: string; color: string; }> = ({ label, value, unit, color }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm text-gray-300">{label}</span>
            <span className={`text-lg font-bold font-mono-code ${color}`}>{value.toFixed(2)}<span className="text-xs ml-1">{unit}</span></span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(value, 100)}%` }}></div>
        </div>
    </div>
);

export const BNCv2Monitor: React.FC = () => {
    const [metrics] = useState({ density: 0, plasticity: 0, modulation: 0 });


    return (
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
                <div>
                    <h4 className="text-md font-bold text-purple-300">Monitor BNCv2</h4>
                    <p className="text-xs text-gray-400">Métricas dependentes de backend biomórfico — não mensuradas nesta camada.</p>
                </div>
            </div>
            <div className="space-y-4">
                <MetricDisplay label="Densidade Sináptica" value={metrics.density} unit="%" color="text-cyan-400" />
                <MetricDisplay label="Atividade de Plasticidade" value={metrics.plasticity} unit="Hz" color="text-yellow-400" />
                <MetricDisplay label="Modulação Dopaminérgica" value={metrics.modulation} unit="%" color="text-green-400" />
            </div>
        </div>
    );
};
