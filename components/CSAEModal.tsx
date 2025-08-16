import React from 'react';
import { OrchestratorIcon, CheckIcon, ArrowsPathIcon } from './icons.tsx';
import { ActiveOperation } from '../types.ts';

interface CSAEModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: ActiveOperation | undefined;
}

const CSAEModal: React.FC<CSAEModalProps> = ({ isOpen, onClose, operation }) => {
    const steps = [
        "Analisando ambiente de execução (rede, hardware...)",
        "Gerando blueprint arquitetural otimizado...",
        "Aplicando reconfiguração de pipeline de inferência...",
        "Validando estabilidade e ganhos de desempenho...",
    ];
    const currentStep = operation ? operation.progress : -1;
    const isComplete = operation?.status === 'DONE';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-blue-500/50 rounded-lg p-6 max-w-lg w-full">
                <div className="flex items-center space-x-3 mb-4">
                    <OrchestratorIcon className="w-8 h-8 text-blue-300" />
                    <h3 className="text-xl font-bold text-blue-300">Reconfiguração Arquitetural CSAE</h3>
                </div>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step} className={`flex items-center space-x-3 transition-opacity duration-300 ${currentStep >= index ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                {currentStep > index || isComplete ? (
                                    <CheckIcon className="w-5 h-5 text-green-400" />
                                ) : (
                                    <div className={`w-5 h-5 flex items-center justify-center ${currentStep === index ? 'animate-spin' : ''}`}>
                                        <ArrowsPathIcon className="w-4 h-4 text-blue-400" />
                                    </div>
                                )}
                            </div>
                            <span className="text-gray-300">{step}</span>
                        </div>
                    ))}
                </div>
                {isComplete && (
                     <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-center">
                        <p className="font-bold text-green-300">Reconfiguração Concluída. Pertencimento computacional otimizado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CSAEModal;
