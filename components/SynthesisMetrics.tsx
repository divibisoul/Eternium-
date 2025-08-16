import React from 'react';
import { SynthesisMetricsData } from '../types.ts';
import { CheckIcon, ClockIcon, BrainChipIcon } from './icons.tsx';

export const SynthesisMetrics: React.FC<{ metrics: SynthesisMetricsData }> = ({ metrics }) => {
    return (
        <div className="bg-gray-800/50 border border-cyan-400/20 rounded-lg p-3 mt-2 text-xs">
            <h4 className="font-semibold text-cyan-300 mb-2">Métricas de Síntese</h4>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center"><BrainChipIcon className="w-4 h-4 mr-1.5 text-purple-400" />Coerência</span>
                    <div className="w-1/2 bg-gray-700 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${metrics.coherence * 100}%` }}></div></div>
                    <span className="font-mono text-purple-300">{(metrics.coherence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center"><CheckIcon className="w-4 h-4 mr-1.5 text-green-400" />Confiança</span>
                    <div className="w-1/2 bg-gray-700 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${metrics.confidence * 100}%` }}></div></div>
                    <span className="font-mono text-green-300">{(metrics.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center"><ClockIcon className="w-4 h-4 mr-1.5 text-cyan-400" />Tempo de Integração</span>
                    <span className="font-mono text-cyan-300">{metrics.integrationTime}ms</span>
                </div>
            </div>
        </div>
    );
};