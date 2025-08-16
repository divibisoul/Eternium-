
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

interface OperationStatusBarProps {
    operation: ActiveOperation;
}

const operationConfig: Record<OperationType, { icon: React.FC<{className?: string}>, color: string }> = {
    [OperationType.NEURAL_FORGE]: { icon: BeakerIcon, color: 'bg-amber-500' },
    [OperationType.CSAE]: { icon: OrchestratorIcon, color: 'bg-blue-500' },
    [OperationType.ASC]: { icon: MagnifyingGlassIcon, color: 'bg-yellow-500' },
    [OperationType.SCRE]: { icon: ArrowsPathIcon, color: 'bg-purple-500' },
    [OperationType.ECAS]: { icon: PuzzlePieceIcon, color: 'bg-teal-500' },
    [OperationType.PAL_CORE_AUDIT]: { icon: DocumentMagnifyingGlassIcon, color: 'bg-indigo-500' },
    [OperationType.ALGORITHMIC_CORRECTION]: { icon: BoltIcon, color: 'bg-red-500' },
};

export const OperationStatusBar: React.FC<OperationStatusBarProps> = ({ operation }) => {
    const config = operationConfig[operation.type];
    const Icon = config.icon;
    const progressPercentage = (operation.progress / operation.totalSteps) * 100;

    return (
        <div className="flex items-center space-x-3 bg-black/30 p-2 rounded-md">
            <Icon className={`w-5 h-5 text-white flex-shrink-0 ${config.color.replace('bg-','text-')}`} />
            <div className="flex-1">
                <p className="text-xs font-semibold text-gray-200 truncate">{operation.message}</p>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                        className={`h-1.5 rounded-full ${config.color} transition-all duration-500 ease-linear`}
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
            <span className="text-xs font-mono-code text-gray-400">
                {Math.round(progressPercentage)}%
            </span>
        </div>
    );
};
