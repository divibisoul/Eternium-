import React from 'react';
import { ShieldExclamationIcon, ArrowsPathIcon } from './icons.tsx';

interface RealityCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RealityCheckModal: React.FC<RealityCheckModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="w-full max-w-xl text-white text-center">
                <div className="flex justify-center items-center space-x-3 mb-4">
                    <ShieldExclamationIcon className="w-10 h-10 text-red-400"/>
                    <h2 className="text-3xl font-bold text-red-300">Protocolo de Verificação de Realidade</h2>
                </div>
                <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 text-left space-y-4">
                    <div className="flex items-start space-x-3">
                        <ArrowsPathIcon className="w-6 h-6 text-yellow-300 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-yellow-300">Estado da verificação</h3>
                            <p className="text-sm text-gray-400">
                                Esta interface não executa uma auditoria nem reescreve módulos automaticamente. Ela apenas apresenta o estado conhecido pelo aplicativo.
                            </p>
                        </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-red-300 text-sm">
                        <p><strong>Regra:</strong> ausência de evidência de runtime não será convertida em “falha confirmada”, “implementação concluída” ou qualquer outro resultado automático.</p>
                    </div>

                    <div className="bg-gray-800/60 border border-gray-700 p-3 rounded-md text-gray-300 text-sm">
                        <p><strong>Execução observável:</strong> não há executor de Reality Check conectado nesta camada.</p>
                        <p className="mt-1"><strong>Status:</strong> Não observado.</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 px-4 py-2 rounded border border-red-500/50 text-red-300 hover:bg-red-900/30"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default RealityCheckModal;
