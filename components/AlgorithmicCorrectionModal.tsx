
import React, { useState, useEffect } from 'react';
import { 
    BoltIcon,
    BrainChipIcon,
    MagnifyingGlassIcon,
    BeakerIcon,
    OrchestratorIcon,
    CpuChipIcon,
    GalaxyIcon,
    ArrowsPathIcon,
    ScaleIcon,
} from './icons.tsx';
import { ActiveOperation } from '../types.ts';

interface AlgorithmicCorrectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: ActiveOperation | undefined;
}

const ModuleNode: React.FC<{
    name: string;
    status: string;
    icon: React.FC<{ className?: string }>;
    isActive: boolean;
    isDone: boolean;
}> = ({ name, status, icon: Icon, isActive, isDone }) => {
    const activeClass = isActive ? 'border-amber-400 bg-amber-900/50 shadow-lg shadow-amber-500/20' : 'border-gray-700 bg-gray-800/80';
    const doneClass = isDone ? 'border-green-500 bg-green-900/30' : activeClass;
    
    return (
        <div className={`p-3 rounded-lg border text-center transition-all duration-500 w-36 ${doneClass}`}>
            <Icon className={`w-8 h-8 mx-auto mb-2 transition-colors duration-500 ${isDone ? 'text-green-400' : isActive ? 'text-amber-300' : 'text-gray-500'}`} />
            <p className={`font-bold text-sm transition-colors duration-500 ${isDone ? 'text-green-300' : isActive ? 'text-amber-300' : 'text-gray-400'}`}>{name}</p>
            <p className={`text-xs transition-colors duration-500 ${isDone ? 'text-green-400' : isActive ? 'text-amber-400' : 'text-gray-500'}`}>{status}</p>
        </div>
    );
};

const AnimatedMetric: React.FC<{ start: number; end: number; duration: number; suffix?: string; prefix?: string;}> = ({ start, end, duration, suffix = '', prefix = '' }) => {
    const [current, setCurrent] = useState(start);

    useEffect(() => {
        let startTime: number;
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const value = start + progress * (end - start);
            setCurrent(value);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        const handle = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(handle);
    }, [start, end, duration]);

    return <span className="font-mono-code">{prefix}{current.toFixed(0)}{suffix}</span>;
};

const AlgorithmicCorrectionModal: React.FC<AlgorithmicCorrectionModalProps> = ({ isOpen, onClose, operation }) => {
    const phase = operation ? Math.floor(operation.progress / (operation.totalSteps / 5)) : 0;
    const isComplete = operation?.status === 'DONE';
    
    useEffect(() => {
        if (isComplete) {
            setTimeout(onClose, 5000);
        }
    }, [isComplete, onClose]);

    const getModuleStatus = (phaseNumber: number) => {
        if (phase < phaseNumber) return "Inativo";
        if (phase === phaseNumber) return "Analisando...";
        if (phase > phaseNumber) return "Concluído";
        return "Inativo";
    };

    const moduleStatuses = {
        core: { name: 'Algoritmo Central', icon: BrainChipIcon, status: phase === 4 ? "Integrando..." : phase > 4 ? "Otimizado" : "Operacional" },
        asc: { name: 'ASC', icon: MagnifyingGlassIcon, status: getModuleStatus(0) },
        csae: { name: 'CSAE', icon: OrchestratorIcon, status: getModuleStatus(1) },
        scre: { name: 'S.C.R.E', icon: CpuChipIcon, status: getModuleStatus(1) },
        neuralForge: { name: 'NeuralForge', icon: BeakerIcon, status: getModuleStatus(2) },
        ecas: { name: 'E.C.A.S', icon: GalaxyIcon, status: getModuleStatus(3) },
    };

    const getModuleState = (moduleName: keyof typeof moduleStatuses) => ({
        isActive: moduleStatuses[moduleName].status === "Analisando..." || moduleStatuses[moduleName].status === "Integrando...",
        isDone: moduleStatuses[moduleName].status === "Concluído" || (moduleName === 'core' && isComplete)
    });

    if (!isOpen) return null;

    const renderContent = () => {
        if (!isComplete) {
            return (
                <div className="relative w-[500px] h-[400px]">
                    {/* Central Node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <ModuleNode name={moduleStatuses.core.name} status={moduleStatuses.core.status} icon={moduleStatuses.core.icon} {...getModuleState('core')} />
                    </div>
                    {/* Surrounding Nodes */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2"><ModuleNode {...moduleStatuses.asc} {...getModuleState('asc')} /></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2"><ModuleNode {...moduleStatuses.ecas} {...getModuleState('ecas')} /></div>
                    <div className="absolute top-1/3 -translate-y-1/2 left-0"><ModuleNode {...moduleStatuses.csae} {...getModuleState('csae')} /></div>
                    <div className="absolute top-2/3 -translate-y-1/2 left-0"><ModuleNode {...moduleStatuses.scre} {...getModuleState('scre')} /></div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-0"><ModuleNode {...moduleStatuses.neuralForge} {...getModuleState('neuralForge')} /></div>
                </div>
            )
        }
        
        return (
            <div className="text-center w-full max-w-lg">
                <h3 className="text-xl font-bold text-green-300 mb-4">Auto-Correção Concluída</h3>
                 <div className="grid grid-cols-2 gap-4 text-left p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ArrowsPathIcon className="w-5 h-5 text-green-400"/>
                        <div>
                            <p className="text-gray-300 text-sm">Eficiência Algorítmica</p>
                            <p className="text-white font-bold"><AnimatedMetric start={0} end={32} duration={1500} prefix="+" suffix="%"/> </p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <ScaleIcon className="w-5 h-5 text-green-400"/>
                        <div>
                            <p className="text-gray-300 text-sm">Adaptabilidade</p>
                            <p className="text-white font-bold"><AnimatedMetric start={0} end={18} duration={1500} prefix="+" suffix="%"/> </p>
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <ArrowsPathIcon className="w-5 h-5 text-green-400"/>
                        <div>
                            <p className="text-gray-300 text-sm">Redução de Latência</p>
                            <p className="text-white font-bold"><AnimatedMetric start={0} end={41} duration={1500} prefix="-" suffix="ms"/> </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                        <GalaxyIcon className="w-5 h-5 text-green-400"/>
                        <div>
                            <p className="text-gray-300 text-sm">Propriedade Emergente</p>
                            <p className="text-white font-bold">Heurística de predição de recursos sintetizada</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="w-full max-w-3xl text-white text-center">
                <div className="flex justify-center items-center space-x-3 mb-2">
                    <BoltIcon className="w-8 h-8 text-amber-300" />
                    <h2 className="text-3xl font-bold text-amber-300">Ciclo de Auto-Correção Algorítmica</h2>
                </div>
                <p className="text-sm text-gray-400 border border-t-0 border-x-0 border-b-cyan-800 pb-3 mb-3">Diretriz ERU Ativa: Otimização de performance e adaptabilidade do núcleo.</p>
                <div className="flex items-center justify-center min-h-[420px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AlgorithmicCorrectionModal;
