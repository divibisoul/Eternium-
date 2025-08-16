
import React from 'react';
import { DeployedCapability, ActiveOperation, AgiCoreModule, Capability } from '../types.ts';
import { CapabilityCard } from './CapabilityCard.tsx';
import { OperationProgressCard } from './OperationProgressCard.tsx';
import { AgiCoreModuleStatusCard } from './AgiCoreModuleStatusCard.tsx';
import { capabilities } from '../data/capabilities.ts';
import { BrainChipIcon, PlayIcon, BoltIcon, ChevronDoubleRightIcon } from './icons.tsx';

interface ArchitecturePanelProps {
    isOpen: boolean;
    onToggle: () => void;
    deployedCapabilities: DeployedCapability[];
    onInitiateEvolutionCycle: () => void;
    activeOperations: ActiveOperation[];
    isOmniMode: boolean;
    agiCoreModules: AgiCoreModule[];
}

const SectionHeader: React.FC<{ title: string, children?: React.ReactNode }> = ({ title, children }) => (
    <div className="flex justify-between items-center mb-2 px-3 py-1.5 bg-gray-800 rounded-md">
        <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);


export const ArchitecturePanel: React.FC<ArchitecturePanelProps> = ({ 
    isOpen, 
    onToggle,
    deployedCapabilities,
    onInitiateEvolutionCycle,
    activeOperations,
    isOmniMode,
    agiCoreModules,
}) => {
    
    const capabilitiesMap = new Map<string, Capability>(capabilities.map(c => [c.id, c]));

    return (
        <aside className={`fixed top-0 left-0 h-full w-80 bg-gray-900/80 backdrop-blur-lg border-r border-cyan-400/20 flex flex-col z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Toggle Tab */}
            <button 
                onClick={onToggle}
                className="absolute top-1/2 -right-6 w-6 h-20 bg-gray-800/80 backdrop-blur-md border-y border-r border-cyan-400/20 rounded-r-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-900/50 hover:text-white transition-all"
                title={isOpen ? "Ocultar Painel" : "Mostrar Painel de Arquitetura"}
            >
                <ChevronDoubleRightIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <header className="flex items-center p-4 border-b border-cyan-400/20 flex-shrink-0">
                <BrainChipIcon className="w-6 h-6 mr-3 text-cyan-400"/>
                <h2 className="text-lg font-bold text-white">Painel de Arquitetura</h2>
            </header>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                
                <section>
                    <SectionHeader title="Status do Núcleo da AGI" />
                    <div className="space-y-2">
                       {agiCoreModules.map(module => (
                           <AgiCoreModuleStatusCard key={module.id} module={module} />
                       ))}
                    </div>
                </section>

                {activeOperations.length > 0 && (
                    <section>
                        <SectionHeader title="Operações Autônomas" />
                        <div className="space-y-2">
                            {activeOperations.map(op => (
                                <OperationProgressCard key={op.id} operation={op} />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <SectionHeader title="Capacidades Implantadas">
                        <button 
                            onClick={onInitiateEvolutionCycle}
                            className="flex items-center text-xs font-bold px-2 py-1 rounded-full transition-colors bg-purple-600/50 hover:bg-purple-600 text-white"
                            title="Iniciar ciclo de descoberta e implantação de novas capacidades"
                        >
                            <PlayIcon className="w-3 h-3 mr-1.5" />
                            Evoluir
                        </button>
                    </SectionHeader>
                    <div className="space-y-2">
                       {deployedCapabilities.map(deployed => {
                           const capInfo = capabilitiesMap.get(deployed.id);
                           if (!capInfo || capInfo.isHidden) return null;
                           return <CapabilityCard key={deployed.id} capability={capInfo} deployedInfo={deployed} />
                       })}
                    </div>
                </section>
            </div>
            
            {isOmniMode && (
                <footer className="p-3 border-t border-cyan-400/20 flex-shrink-0 bg-purple-900/30">
                    <div className="flex items-center justify-center text-purple-300 animate-pulse">
                        <BoltIcon className="w-5 h-5 mr-2" />
                        <span className="font-bold text-sm">OMNIMODE ATIVO: Overclock 240%</span>
                    </div>
                </footer>
            )}

        </aside>
    );
};
