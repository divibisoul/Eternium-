
import React from 'react';
import { ActiveOperation, OperationType } from '../types.ts';
import { 
    BeakerIcon,
    OrchestratorIcon,
    MagnifyingGlassIcon,
    ArrowsPathIcon,
    PuzzlePieceIcon,
    DocumentMagnifyingGlassIcon,
    BoltIcon
} from './icons.tsx';

interface OperationProgressCardProps {
    operation: ActiveOperation;
}

const operationConfig: Record<OperationType, { icon: React.FC<{className?: string}>, color: string }> = {
    [OperationType.NEURAL_FORGE]: { icon: BeakerIcon, color: 'bg-amber-500 border-amber-500/50 text-amber-300' },
    [OperationType.CSAE]: { icon: OrchestratorIcon, color: 'bg-blue-500 border-blue-500/50 text-blue-300' },
    [OperationType.ASC]: { icon: MagnifyingGlassIcon, color: 'bg-yellow-500 border-yellow-500/50 text-yellow-300' },
    [OperationType.SCRE]: { icon: ArrowsPathIcon, color: 'bg-purple-500 border-purple-500/50 text-purple-300' },
    [OperationType.ECAS]: { icon: PuzzlePieceIcon, color: 'bg-teal-500 border-teal-500/50 text-teal-300' },
    [OperationType.PAL_CORE_AUDIT]: { icon: DocumentMagnifyingGlassIcon, color: 'bg-indigo-500 border-indigo-500/50 text-indigo-300' },
    [OperationType.ALGORITHMIC_CORRECTION]: { icon: BoltIcon, color: 'bg-red-500 border-red-500/50 text-red-300' },
};

export const OperationProgressCard: React.FC<OperationProgressCardProps> = ({ operation }) => {
    const config = operationConfig[operation.type];
    const Icon = config.icon;
    const progressPercentage = operation.status === 'WAITING_RUNTIME'
        ? 0
        : operation.totalSteps > 0
            ? (operation.progress / operation.totalSteps) * 100
            : 0;

    return (
        <div className={`bg-gray-800/60 p-3 rounded-lg border ${config.color.split(' ')[1]}`}>
            <div className="flex items-center space-x-3">
                <Icon className={`w-6 h-6 flex-shrink-0 ${config.color.split(' ')[2]}`} />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-200 truncate">{operation.message}</p>
                    {operation.status === 'WAITING_RUNTIME' && (
                        <p className="text-[11px] text-amber-300 mt-0.5">Aguardando executor real</p>
                    )}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1.5 relative overflow-hidden">
                        <div 
                            className={`absolute top-0 left-0 h-full rounded-full ${config.color.split(' ')[0]} transition-all duration-500 ease-linear`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                         <div 
                            className={`absolute top-0 left-0 h-full w-full opacity-30 ${config.color.split(' ')[0]} animate-pulse`}
                            style={{ animationDuration: '2s' }}
                        ></div>
                    </div>
                </div>
                <span className="text-sm font-mono-code text-gray-400">
                    {operation.status === 'WAITING_RUNTIME' ? 'N/O' : Math.round(progressPercentage) + '%'}
                </span>
            </div>
        </div>
    );
};
