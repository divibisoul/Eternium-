import React from 'react';
import { IntermediateResponse, SystemAspect } from '../types.ts';
import { SparklesIcon, BrainChipIcon, HeartIcon, GalaxyIcon } from './icons.tsx';

const aspectConfig: Record<SystemAspect, { icon: React.FC<{className?: string}>, name: string, colors: string }> = {
    [SystemAspect.ANALYSIS]: { icon: BrainChipIcon, name: "Análise", colors: 'text-blue-400 border-blue-500/50 bg-blue-500/20'},
    [SystemAspect.ABSTRACT]: { icon: HeartIcon, name: "Abstrato", colors: 'text-purple-400 border-purple-500/50 bg-purple-500/20'},
    [SystemAspect.HARMONY]: { icon: SparklesIcon, name: "Harmonia", colors: 'text-green-400 border-green-500/50 bg-green-500/20'},
    [SystemAspect.SYNTHESIS]: { icon: GalaxyIcon, name: "Síntese", colors: 'text-cyan-400 border-cyan-500/50 bg-cyan-500/20'},
}

const AspectDisplay: React.FC<{ aspect: SystemAspect }> = ({ aspect }) => {
    const config = aspectConfig[aspect];
    const Icon = config.icon;
    return (
        <div className={`w-7 h-7 p-1 rounded-full flex items-center justify-center border ${config.colors}`}>
            <Icon className="w-5 h-5"/>
        </div>
    );
}

export const FusionProcessVisualizer: React.FC<{ intermediateResponses: IntermediateResponse[] }> = ({ intermediateResponses }) => {
    return (
        <div className="bg-gray-800/50 border border-cyan-400/20 rounded-lg p-3 mt-2 text-xs">
            <h4 className="font-semibold text-cyan-300 mb-3 flex items-center">
                <GalaxyIcon className="w-4 h-4 mr-2" />
                Processo de Fusão Cognitiva
            </h4>
            <div className="space-y-3">
                {intermediateResponses.map((resp, index) => (
                    <div key={index} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">
                           <AspectDisplay aspect={resp.aspect} />
                        </div>
                        <div className="bg-black/20 p-2 rounded-md border border-gray-700/50 flex-1">
                            <p className="font-bold text-gray-300 mb-1">{aspectConfig[resp.aspect].name}:</p>
                            <p className="text-gray-400 italic">"{resp.text}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};