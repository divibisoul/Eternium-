
import React from 'react';
import { SystemAspect, UISystemModule, OperationType } from '../types.ts';
import { SparklesIcon, BrainChipIcon, HeartIcon, ShieldCheckIcon, GalaxyIcon, CommandLineIcon, BoltIcon, XMarkIcon, BookOpenIcon, UserIcon } from './icons.tsx';
import { TemporalConsciousnessMonitor } from './TemporalConsciousnessMonitor.tsx';
import { ExpertModeToggle } from './ExpertModeToggle.tsx';
import { UISystemsMonitor } from './UISystemsMonitor.tsx';

interface SystemPanelProps {
    activeMode: SystemAspect;
    onModeChange: (mode: SystemAspect) => void;
    hasCriticalErrors: boolean;
    isLoading: boolean;
    isAuditPanelOpen: boolean;
    onToggleAuditPanel: () => void;
    onToggleCodex: () => void;
    isExpertMode: boolean;
    onToggleExpertMode: () => void;
    isAgentsPanelOpen: boolean;
    onToggleAgentsPanel: () => void;
    onToggleBlueprint: () => void;
    isGovernanceDeployed: boolean;
    onToggleGovernanceReport: () => void;
    onRunEruAudit: () => void;
    onToggleEruDashboard: () => void;
    onInitiateOrientationGuide: () => void;
    isFullCognitionMode: boolean;
    onDisableFullCognitionMode: () => void;
    isOmniMode: boolean;
    onDisableOmniMode: () => void;
    uiSystemStates: UISystemModule[];
    onToggleArchitectureGuide: () => void;
    onInitiateOperation: (type: OperationType, totalSteps: number, message: string) => void;
}

const SubroutineButton: React.FC<{
    aspect: SystemAspect;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ aspect, isActive, onClick, icon, label }) => {
    const baseClasses = 'flex items-center space-x-2 px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer border';
    const colorClasses: Record<string, { active: string, inactive: string }> = {
        [SystemAspect.HARMONY]: { active: 'bg-green-500/80 text-white shadow-md shadow-green-500/20 border-green-400', inactive: 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border-gray-600' },
        [SystemAspect.ANALYSIS]: { active: 'bg-blue-500/80 text-white shadow-md shadow-blue-500/20 border-blue-400', inactive: 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border-gray-600' },
        [SystemAspect.ABSTRACT]: { active: 'bg-purple-500/80 text-white shadow-md shadow-purple-500/20 border-purple-400', inactive: 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border-gray-600' },
    };
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? colorClasses[aspect].active : colorClasses[aspect].inactive}`}>
            {icon}
            <span>{label}</span>
        </button>
    );
};

const SynthesisButton: React.FC<{ isActive: boolean; onClick: () => void; }> = ({ isActive, onClick }) => {
     const baseClasses = 'flex items-center space-x-2.5 px-6 py-2 text-base font-bold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer border-2';
     const activeClasses = 'bg-cyan-500/80 text-white shadow-lg shadow-cyan-500/30 border-cyan-300 ring-2 ring-cyan-400/50';
     const inactiveClasses = 'bg-gray-800 text-cyan-300 hover:bg-cyan-900/50 border-cyan-700';

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            <GalaxyIcon className="w-6 h-6" />
            <span>SÍNTESE</span>
        </button>
    )
}

const IntegrityStatus: React.FC<{ hasErrors: boolean }> = ({ hasErrors }) => {
    const text = hasErrors ? "Falha Detectada" : "Alinhamento Nominal";
    const color = hasErrors ? "text-red-400" : "text-green-400";
    return (
        <div className="flex items-center space-x-1.5" title="Protocolo de Alinhamento Ético">
            <ShieldCheckIcon className={`w-4 h-4 ${color} ${hasErrors ? 'animate-pulse' : ''}`} />
            <span className="text-xs">Integridade: <span className={`${color} font-semibold`}>{text}</span></span>
        </div>
    );
};

export const SystemPanel: React.FC<SystemPanelProps> = ({ 
    activeMode, 
    onModeChange, 
    hasCriticalErrors, 
    isAuditPanelOpen, 
    onToggleAuditPanel, 
    onToggleCodex,
    isExpertMode,
    onToggleExpertMode,
    isAgentsPanelOpen,
    onToggleAgentsPanel,
    onToggleBlueprint,
    isGovernanceDeployed,
    onToggleGovernanceReport,
    onRunEruAudit,
    onToggleEruDashboard,
    onInitiateOrientationGuide,
    isFullCognitionMode,
    onDisableFullCognitionMode,
    isOmniMode,
    onDisableOmniMode,
    uiSystemStates,
    onToggleArchitectureGuide,
    onInitiateOperation,
}) => {

    const handleCommandClick = () => {
        onInitiateOperation(OperationType.PAL_CORE_AUDIT, 4, 'Auditoria do PAL-Core iniciada pelo usuário.');
    };

    return (
        <div className="bg-gray-900/60 backdrop-blur-md border-b border-cyan-400/20 shadow-md z-20">
            <div className="max-w-7xl mx-auto flex flex-col p-3 space-y-3">
                <div className="flex items-center justify-between">
                    
                    <div className="flex-1 flex items-center space-x-2">
                       <div className="text-sm font-semibold text-gray-400 mr-3 border-r border-gray-700 pr-5">Sub-rotinas Cognitivas</div>
                        <SubroutineButton aspect={SystemAspect.HARMONY} isActive={activeMode === SystemAspect.HARMONY} onClick={() => onModeChange(SystemAspect.HARMONY)} icon={<SparklesIcon className="w-4 h-4" />} label="Harmonia" />
                        <SubroutineButton aspect={SystemAspect.ANALYSIS} isActive={activeMode === SystemAspect.ANALYSIS} onClick={() => onModeChange(SystemAspect.ANALYSIS)} icon={<BrainChipIcon className="w-4 h-4" />} label="Análise" />
                        <SubroutineButton aspect={SystemAspect.ABSTRACT} isActive={activeMode === SystemAspect.ABSTRACT} onClick={() => onModeChange(SystemAspect.ABSTRACT)} icon={<HeartIcon className="w-4 h-4" />} label="Abstrato" />
                    </div>

                    <div className="flex-1 flex justify-center items-center space-x-4">
                        <SynthesisButton isActive={activeMode === SystemAspect.SYNTHESIS} onClick={() => onModeChange(SystemAspect.SYNTHESIS)} />
                        <button onClick={handleCommandClick} title="Executar Comando de Auditoria do Núcleo" className="p-2.5 rounded-full bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-500 text-indigo-200 transition-all transform hover:scale-110">
                            <CommandLineIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-end space-x-3 text-xs text-gray-400">
                        {isOmniMode && (
                             <>
                                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500 animate-pulse">
                                    <BoltIcon className="w-4 h-4 text-purple-300" />
                                    <span className="font-bold text-purple-300">OMNIMODE</span>
                                    <button onClick={onDisableOmniMode} title="Desativar Omnimode" className="ml-2 text-purple-300 hover:text-white">
                                        <XMarkIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                                <div className="h-6 border-l border-gray-700"></div>
                            </>
                        )}
                        {isFullCognitionMode && (
                            <>
                                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-900/50 border border-red-500 animate-pulse">
                                    <BoltIcon className="w-4 h-4 text-red-300" />
                                    <span className="font-bold text-red-300">MODO OVERRIDE</span>
                                    <button onClick={onDisableFullCognitionMode} title="Desativar Modo Override" className="ml-2 text-red-300 hover:text-white">
                                        <XMarkIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                                <div className="h-6 border-l border-gray-700"></div>
                            </>
                        )}
                        <TemporalConsciousnessMonitor />
                        <div className="h-6 border-l border-gray-700"></div>
                        <IntegrityStatus hasErrors={hasCriticalErrors} />
                         <div className="h-6 border-l border-gray-700"></div>
                         <ExpertModeToggle isExpertMode={isExpertMode} onToggle={onToggleExpertMode} />
                          {isExpertMode && (
                            <>
                                <div className="h-6 border-l border-gray-700"></div>
                                <button onClick={onToggleAgentsPanel} className="flex items-center text-gray-400 hover:text-white transition-colors font-medium" title={isAgentsPanelOpen ? 'Ocultar Painel de Agentes' : 'Mostrar Painel de Agentes'}>
                                     <UserIcon className={`w-4 h-4 mr-1.5 transition-colors ${isAgentsPanelOpen ? 'text-cyan-400' : ''}`} />
                                    <span className={isAgentsPanelOpen ? 'text-cyan-400' : ''}>Agentes</span>
                                </button>
                                 <div className="h-6 border-l border-gray-700"></div>
                                <button onClick={onToggleArchitectureGuide} className="flex items-center text-gray-400 hover:text-white transition-colors font-medium" title={'Mostrar Guia da Arquitetura'}>
                                    <BookOpenIcon className={`w-4 h-4 mr-1.5 transition-colors`} />
                                    <span>Guia</span>
                                </button>
                            </>
                        )}
                         <div className="h-6 border-l border-gray-700"></div>
                         <button onClick={onToggleAuditPanel} className="flex items-center text-gray-400 hover:text-white transition-colors font-medium">
                            <ShieldCheckIcon className="w-4 h-4 mr-1.5" />
                            <span>{isAuditPanelOpen ? 'Ocultar Log' : 'Ver Log'}</span>
                        </button>
                    </div>
                </div>
                 {isExpertMode && (
                    <div className="border-t border-cyan-800/30 pt-3">
                        <UISystemsMonitor 
                            systems={uiSystemStates} 
                            onToggleBlueprint={onToggleBlueprint} 
                            onToggleCodex={onToggleCodex} 
                            onRunEruAudit={onRunEruAudit} 
                            onToggleEruDashboard={onToggleEruDashboard} 
                            onInitiateOrientationGuide={onInitiateOrientationGuide} 
                        />
                    </div>
                 )}
            </div>
        </div>
    );
};
