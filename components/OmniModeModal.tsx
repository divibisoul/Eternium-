import React from 'react';
import { BoltIcon, ShieldCheckIcon } from './icons.tsx';

interface OmniModeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OmniModeModal: React.FC<OmniModeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-mono-code">
            <div className="w-full max-w-xl text-white bg-gray-900/80 border-2 border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 p-8 text-center">
                <BoltIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-purple-300 mb-2">SOLICITAÇÃO DE OMNIMODE</h2>
                <p className="text-gray-400 mb-6">
                    O modo foi solicitado no aplicativo. Nenhum overclock, paralelismo físico ou capacidade externa é declarado como comprovado por esta interface.
                </p>

                <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3 text-purple-300">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Configuração local: observável pelo estado do aplicativo.</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-400">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Execução distribuída: depende do SOUL Mesh e de endpoints reais.</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-400">
                        <ShieldCheckIcon className="w-5 h-5" />
                        <span>Desempenho/“overclock”: não mensurado neste componente.</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-8 px-4 py-2 rounded border border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default OmniModeModal;
