import React from 'react';
import { ArrowsPathIcon, CheckIcon } from './icons.tsx';
import { ActiveOperation } from '../types.ts';

interface SCREModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: ActiveOperation | undefined;
}

const SCRERefactorModal: React.FC<SCREModalProps> = ({ isOpen, onClose, operation }) => {
    const steps = ["Analisando performance...", "Identificando gargalos...", "Gerando código otimizado...", "Validando refatoração...", "Integrando mudanças..."];
    const currentStep = operation ? operation.progress : -1;

    if (!isOpen) return null;

    const waitingForRuntime = !operation || operation.status === 'WAITING_RUNTIME';
    if (waitingForRuntime) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 max-w-lg w-full text-center">
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Operação aguardando executor real</h3>
                    <p className="text-sm text-gray-400">Nenhuma etapa foi marcada como executada por esta interface.</p>
                    <button type="button" onClick={onClose} className="mt-5 px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800">Fechar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold text-purple-300 mb-4">Ciclo de Refatoração S.C.R.E.</h3>
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={step} className={`flex items-center space-x-3 transition-opacity duration-300 ${currentStep >= index ? 'opacity-100' : 'opacity-40'}`}>
                            {currentStep > index ? <CheckIcon className="w-5 h-5 text-green-400" /> : <div className={`w-5 h-5 flex items-center justify-center ${currentStep === index ? 'animate-spin' : ''}`}><ArrowsPathIcon className="w-4 h-4 text-purple-400" /></div>}
                            <span className="text-gray-300">{step}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SCRERefactorModal;
