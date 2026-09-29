import React from 'react';
import { QuantumConnectomeIcon } from './icons.tsx';

type MetricValue = number | null;

const MetricDisplay: React.FC<{ label: string; value: MetricValue; unit: string; color: string; }> = ({ label, value, unit, color }) => {
    const measured = typeof value === 'number' && Number.isFinite(value);
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-gray-300">{label}</span>
                <span className={`text-lg font-bold font-mono-code ${color}`}>
                    {measured ? value.toFixed(2) : 'N/D'}
                    {measured && <span className="text-xs ml-1">{unit}</span>}
                </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
                {measured && (
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ease-in-out ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
                    />
                )}
            </div>
        </div>
    );
};

export const BNCv2Monitor: React.FC = () => {
    // BNCv2 runtime exists, but this UI has no live measurement subscription.
    // Keep the monitor visible while refusing fabricated telemetry.
    const metrics = { density: null, plasticity: null, modulation: null };

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
                    <p className="text-xs text-gray-400">Estado Operacional do Núcleo Biomórfico · Telemetria N/D</p>
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
