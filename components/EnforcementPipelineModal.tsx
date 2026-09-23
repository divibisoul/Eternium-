import React from 'react';
import { ShieldCheckIcon, CheckIcon, ArrowsPathIcon } from './icons.tsx';

interface EnforcementPipelineModalProps {
    isOpen: boolean;
    prompt: string;
    onClose: () => void;
    onComplete: (processedPrompt: string) => void;
}

const steps = [
    'Verificação de Integridade dos Módulos',
    'Pré-processamento Neural',
    'Aplicação da Cognição Central',
    'Verificação de Governança e Segurança',
    'Aprimoramento Multimodal',
];

const EnforcementPipelineModal: React.FC<EnforcementPipelineModalProps> = ({
    isOpen,
    prompt,
    onClose,
    onComplete,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="w-full max-w-lg text-white text-center">
                <div className="flex justify-center items-center space-x-3 mb-4">
                    <ShieldCheckIcon className="w-10 h-10 text-cyan-300"/>
                    <h2 className="text-3xl font-bold text-cyan-300">Pipeline de Execução</h2>
                </div>

                <p className="text-gray-400 mb-6">
                    O pipeline específico de cinco etapas não está conectado a um executor nesta camada. Nenhuma etapa abaixo é marcada como executada por esta tela.
                </p>

                <div className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-6 w-full space-y-3">
                    {steps.map(step => (
                        <div key={step} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 bg-gray-800 opacity-70">
                            <ArrowsPathIcon className="w-6 h-6 text-gray-500" />
                            <span className="font-medium text-gray-400">{step} — N/O</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700 text-left">
                    <p className="text-xs text-gray-500">Diretiva recebida:</p>
                    <p className="text-sm text-gray-300 italic break-words">"{prompt}"</p>
                </div>

                <div className="mt-5 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onComplete(prompt);
                        }}
                        className="px-4 py-2 rounded border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/30 flex items-center gap-2"
                    >
                        <CheckIcon className="w-4 h-4" />
                        Prosseguir pelo executor atual
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnforcementPipelineModal;
