import React from 'react';
import { AgiCoreModule, AgiCoreModuleStatus } from '../types.ts';
import { CpuChipIcon, ServerStackIcon } from './icons.tsx';

const statusConfig: Record<AgiCoreModuleStatus, { color: string; text: string; }> = {
    [AgiCoreModuleStatus.ONLINE]: { color: 'bg-green-500', text: 'Online' },
    [AgiCoreModuleStatus.OFFLINE]: { color: 'bg-gray-500', text: 'Offline' },
    [AgiCoreModuleStatus.INITIALIZING]: { color: 'bg-blue-500', text: 'Inicializando' },
    [AgiCoreModuleStatus.ERROR]: { color: 'bg-red-500', text: 'Erro' },
    [AgiCoreModuleStatus.NOT_OBSERVED]: { color: 'bg-gray-500', text: 'Não observado' },
};

const ProgressBar: React.FC<{ value: number | null; color: string; icon: React.ReactNode }> = ({ value, color, icon }) => (
    <div className="flex items-center space-x-2 text-xs">
        <div className="text-gray-400">{icon}</div>
        <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            {value !== null && (
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
            )}
        </div>
        <span className="font-mono-code text-gray-300 w-16 text-right">
            {value === null ? 'N/O' : value.toFixed(0) + '%'}
        </span>
    </div>
);

export const AgiCoreModuleStatusCard: React.FC<{ module: AgiCoreModule }> = ({ module }) => {
    const statusInfo = statusConfig[module.status] || statusConfig[AgiCoreModuleStatus.NOT_OBSERVED];
    const cpuColor = module.cpuUsage !== null && module.cpuUsage > 80 ? 'bg-red-500' : module.cpuUsage !== null && module.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-cyan-500';
    const memColor = module.memoryUsage !== null && module.memoryUsage > 80 ? 'bg-red-500' : module.memoryUsage !== null && module.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-purple-500';

    return (
        <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start">
                <div>
                    <h5 className="font-bold text-white text-sm">{module.name}</h5>
                    <p className="text-xs text-gray-400 leading-tight">{module.description}</p>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-gray-300 flex-shrink-0 ml-2">
                    <span className={`w-2 h-2 rounded-full ${statusInfo.color} ${module.status !== AgiCoreModuleStatus.OFFLINE && module.status !== AgiCoreModuleStatus.NOT_OBSERVED ? 'animate-pulse' : ''}`}></span>
                    <span>{statusInfo.text}</span>
                </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-700/50 space-y-2">
                <ProgressBar value={module.cpuUsage} color={cpuColor} icon={<CpuChipIcon className="w-3.5 h-3.5" />} />
                <ProgressBar value={module.memoryUsage} color={memColor} icon={<ServerStackIcon className="w-3.5 h-3.5" />} />
            </div>
        </div>
    );
};
