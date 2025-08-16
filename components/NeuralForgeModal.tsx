import React from 'react';
import { BeakerIcon, CheckIcon, MagnifyingGlassIcon, DnaIcon, CodeBracketIcon, ShieldCheckIcon } from './icons.tsx';
import { ActiveOperation } from '../types.ts';

interface NeuralForgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: ActiveOperation | undefined;
}

const NeuralForgeModal: React.FC<NeuralForgeModalProps> = ({ isOpen, onClose, operation }) => {
    const steps = [
        { text: "Analisando especificações (Visão -> Controle Motor)...", icon: MagnifyingGlassIcon },
        { text: "Mapeando arquitetura para Coluna Cortical bio-plausível...", icon: DnaIcon },
        { text: "Gerando código otimizado para hardware Neuromórfico (Loihi 2)...", icon: CodeBracketIcon },
        { text: "Validando biocompatibilidade e restrições de energia...", icon: ShieldCheckIcon },
    ];
    const currentStep = operation ? operation.progress : -1;
    const isComplete = operation?.status === 'DONE';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-amber-500/50 rounded-lg p-6 max-w-lg w-full">
                <div className="flex items-center space-x-3 mb-4">
                    <BeakerIcon className="w-8 h-8 text-amber-300" />
                    <h3 className="text-xl font-bold text-amber-300">NeuralForge: Geração de Rede</h3>
                </div>
                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.text} className={`flex items-center space-x-3 transition-opacity duration-300 ${currentStep >= index ? 'opacity-100' : 'opacity-40'}`}>
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                   {currentStep > index || isComplete ? (
                                        <CheckIcon className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <div className={`w-5 h-5 flex items-center justify-center ${currentStep === index ? 'animate-pulse' : ''}`}>
                                            <Icon className="w-5 h-5 text-amber-400" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-gray-300">{step.text}</span>
                            </div>
                        );
                    })}
                </div>
                 {isComplete && (
                     <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-center flex items-center justify-center space-x-2">
                        <CheckIcon className="w-5 h-5 text-green-300" />
                        <p className="font-bold text-green-300">Rede neural 'Visão-Motor-v1' gerada com sucesso.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NeuralForgeModal;
