
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
    const [metrics, setMetrics] = useState({
        density: 75 + Math.random() * 10,
        plasticity: 40 + Math.random() * 15,
        modulation: 60 + Math.random() * 20,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                density: Math.max(70, Math.min(98, prev.density + (Math.random() - 0.5) * 2)),
                plasticity: Math.max(20, Math.min(95, prev.plasticity + (Math.random() - 0.45) * 5)),
                modulation: Math.max(50, Math.min(99, prev.modulation + (Math.random() - 0.5) * 3)),
            }));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

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
                    <p className="text-xs text-gray-400">Estado Operacional do Núcleo Biomórfico</p>
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
