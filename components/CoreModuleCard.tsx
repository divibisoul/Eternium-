
import React, { useState } from 'react';
import { CoreModule, CoreModuleStatus } from '../types.ts';
import { ShieldCheckIcon, PlayIcon } from './icons.tsx';

const statusConfig: Record<CoreModuleStatus, { color: string; text: string }> = {
    [CoreModuleStatus.Online]: { color: 'bg-green-500', text: 'Online' },
    [CoreModuleStatus.Otimizando]: { color: 'bg-blue-500', text: 'Otimizando' },
    [CoreModuleStatus.Erro]: { color: 'bg-red-500', text: 'Falha Crítica' },
};

export const CoreModuleCard: React.FC<{ module: CoreModule }> = ({ module }) => {
    const [status] = useState<CoreModuleStatus>(CoreModuleStatus.Online);
    
    return (
         <div className={`bg-gray-800/60 p-3 rounded-lg border transition-all duration-300 ${module.isFused ? 'border-gray-600 opacity-60' : 'border-gray-700'}`}>
            <div className="flex items-start space-x-3">
                <module.icon className="w-7 h-7 text-cyan-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                    <h5 className="font-bold text-white">{module.name}</h5>
                    <p className="text-xs text-gray-400 leading-tight">{module.description}</p>
                </div>
            </div>
             <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
                 {module.hasNativeASASF ? (
                    <div className="flex items-center space-x-1.5 text-xs text-green-400" title="Este módulo possui auto-auditoria ASASF nativa.">
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        <span>ASASF Nativo</span>
                    </div>
                 ) : <div />}

                {module.onAction && module.actionLabel ? (
                     <button
                        onClick={module.onAction}
                        className="flex items-center text-xs font-bold px-3 py-1 rounded-full transition-colors bg-cyan-600/50 hover:bg-cyan-600 text-white"
                    >
                        <PlayIcon className="w-3 h-3 mr-1.5" />
                        {module.actionLabel}
                    </button>
                ) : (
                    <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                        {module.isFused 
                            ? <span className="text-gray-500 font-semibold">Fundido</span>
                            : <>
                                <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}></span>
                                <span>{statusConfig[status].text}</span>
                              </>
                        }
                    </div>
                )}
            </div>
        </div>
    );
};
