import React from 'react';
import { Capability, DeployedCapability } from '../types.ts';

interface CapabilityCardProps {
    capability: Capability;
    deployedInfo?: DeployedCapability;
}

const statusColorMap: Record<NonNullable<DeployedCapability['status']>, string> = {
    Processando: 'text-yellow-400',
    Otimizando: 'text-blue-400',
    Monitorando: 'text-purple-400',
    Estável: 'text-green-400',
    'Não observado': 'text-gray-400'
};

export const CapabilityCard: React.FC<CapabilityCardProps> = ({ capability, deployedInfo }) => {
    const isDeployed = !!deployedInfo;
    const status = deployedInfo?.status ?? 'Não observado';
    const metric = deployedInfo?.metric;

    return (
        <div className={`bg-gray-800/60 p-3 rounded-lg border transition-all duration-300 ${isDeployed ? 'border-green-500/50' : 'border-gray-700'}`}>
            <div className="flex items-start space-x-3">
                <capability.icon className={`w-7 h-7 flex-shrink-0 mt-1 ${isDeployed ? 'text-green-400' : 'text-cyan-400'}`} />
                <div className="flex-1">
                    <h5 className={`font-bold ${isDeployed ? 'text-green-300' : 'text-white'}`}>{capability.name}</h5>
                    <p className="text-xs text-gray-400 leading-tight">{capability.description}</p>
                </div>
            </div>

            {isDeployed && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50 text-xs">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${statusColorMap[status].replace('text-', 'bg-')} ${status === 'Processando' || status === 'Otimizando' ? 'animate-pulse' : ''}`}></div>
                        <span className={statusColorMap[status]}>{status}</span>
                    </div>
                    <div className="font-mono-code text-gray-300" title={capability.metricName}>
                        {typeof metric === 'number'
                            ? metric.toFixed(1)
                            : 'N/O'} <span className="text-gray-500">{capability.metricUnit}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
