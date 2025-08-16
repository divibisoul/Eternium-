import React, { useState, useEffect } from 'react';
import { 
    ShieldCheckIcon,
    BrainChipIcon,
    CpuChipIcon,
    ScaleIcon,
    SparklesIcon,
    CheckIcon,
    ArrowsPathIcon
} from './icons.tsx';

interface EnforcementPipelineModalProps {
    isOpen: boolean;
    prompt: string;
    onClose: () => void;
    onComplete: (processedPrompt: string) => void;
}

const steps = [
    { name: "Verificação de Integridade dos Módulos", icon: ShieldCheckIcon, duration: 1200 },
    { name: "Pré-processamento Neural (BNCv2, ASC)", icon: BrainChipIcon, duration: 1500 },
    { name: "Aplicação da Cognição Central (ECA, DCRS, SCRE)", icon: CpuChipIcon, duration: 1800 },
    { name: "Verificação de Governança e Segurança", icon: ScaleIcon, duration: 1300 },
    { name: "Aprimoramento Multimodal (ACAI, MPVS)", icon: SparklesIcon, duration: 1000 },
];

const StepIndicator: React.FC<{
    icon: React.FC<{ className?: string }>;
    text: string;
    isCurrent: boolean;
    isDone: boolean;
}> = ({ icon: Icon, text, isCurrent, isDone }) => {
    const baseClasses = 'flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300';
    const activeClasses = 'bg-cyan-900/50 border-cyan-500 shadow-lg shadow-cyan-500/10';
    const doneClasses = 'bg-green-900/30 border-green-700 opacity-70';
    const inactiveClasses = 'bg-gray-800 border-gray-700 opacity-50';

    const getClasses = () => {
        if (isDone) return doneClasses;
        if (isCurrent) return activeClasses;
        return inactiveClasses;
    };

    return (
        <div className={`${baseClasses} ${getClasses()}`}>
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center`}>
                {isDone ? <CheckIcon className="w-6 h-6 text-green-300" /> : <Icon className={`w-6 h-6 ${isCurrent ? 'text-cyan-300' : 'text-gray-500'}`} />}
            </div>
            <span className={`font-medium ${isDone ? 'text-green-300' : isCurrent ? 'text-white' : 'text-gray-500'}`}>{text}</span>
            {isCurrent && <ArrowsPathIcon className="w-5 h-5 text-cyan-400 animate-spin ml-auto" />}
        </div>
    );
};


const EnforcementPipelineModal: React.FC<EnforcementPipelineModalProps> = ({ isOpen, prompt, onClose, onComplete }) => {
    const [phase, setPhase] = useState(-1);

    useEffect(() => {
        if (!isOpen) {
            setPhase(-1);
            return;
        }

        let currentPhase = 0;
        const processNextPhase = () => {
            if (currentPhase < steps.length) {
                setPhase(currentPhase);
                setTimeout(() => {
                    currentPhase++;
                    processNextPhase();
                }, steps[currentPhase].duration);
            } else {
                setPhase(currentPhase); // Mark all as done
                setTimeout(() => {
                    onClose();
                    onComplete(prompt);
                }, 1000);
            }
        };
        
        const timer = setTimeout(processNextPhase, 100);
        return () => clearTimeout(timer);
    }, [isOpen, onClose, onComplete, prompt]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
             <div className="w-full max-w-lg text-white text-center">
                 <div className="flex justify-center items-center space-x-3 mb-4">
                    <ShieldCheckIcon className="w-10 h-10 text-cyan-300"/>
                    <h2 className="text-3xl font-bold text-cyan-300">Pipeline de Execução</h2>
                </div>
                <p className="text-gray-400 mb-6">Processando diretiva através de camadas de execução obrigatórias...</p>
                 <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-6 w-full space-y-3">
                    {steps.map((step, index) => (
                        <StepIndicator
                            key={index}
                            icon={step.icon}
                            text={step.name}
                            isCurrent={phase === index}
                            isDone={phase > index}
                        />
                    ))}
                 </div>
                 <div className="mt-4 p-2 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500">Diretiva sendo processada:</p>
                    <p className="text-sm text-gray-300 italic truncate">"{prompt}"</p>
                 </div>
            </div>
        </div>
    );
};

export default EnforcementPipelineModal;