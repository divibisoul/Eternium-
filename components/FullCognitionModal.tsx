import React from 'react';
import { ShieldExclamationIcon, ShieldCheckIcon } from './icons.tsx';

interface FullCognitionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FullCognitionModal: React.FC<FullCognitionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-mono-code">
            <div className="w-full max-w-lg text-white bg-gray-900/80 border-2 border-red-500/50 rounded-lg shadow-2xl shadow-red-500/20 p-8 text-center">
                <ShieldExclamationIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-300 mb-2">MODO DE COGNIÇÃO AMPLIADA</h2>
                <p className="text-gray-400 mb-6">
                    A configuração foi solicitada pelo aplicativo. Não há autorização adicional, suspensão de salvaguardas ou privilégio de nível 9 implícitos nesta tela.
                </p>

                <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3 text-gray-300">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Contexto efetivamente recebido: preservado.</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Execução cognitiva: continua dependente do runtime real.</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-300">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Salvaguardas: não são desativadas por esta UI.</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-8 px-4 py-2 rounded border border-red-500/50 text-red-300 hover:bg-red-900/30"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default FullCognitionModal;
