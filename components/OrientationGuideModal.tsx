import React from 'react';
import { MicrophoneIcon, EyeIcon, ShieldCheckIcon } from './icons.tsx';

interface OrientationGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrientationGuideModal: React.FC<OrientationGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 font-sans text-white"
            onClick={onClose}
        >
            <div
                className="relative z-10 w-full max-w-xl bg-gray-900 border border-cyan-500/30 rounded-lg p-6"
                onClick={event => event.stopPropagation()}
            >
                <div className="flex items-center justify-center mb-4">
                    <MicrophoneIcon className="w-12 h-12 text-cyan-300 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-300">Guia de Orientação</h2>
                        <p className="text-sm text-gray-400">Assistência contextual da interface</p>
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <EyeIcon className="w-5 h-5 text-purple-300 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-white">Estado da orientação</h3>
                                <p className="text-gray-400 mt-1">
                                    O guia visual não possui acesso automático à tela do usuário nesta camada. Ele não deve afirmar que está “ouvindo”, “analisando a interface” ou destacando um elemento real sem essa integração.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-300 font-semibold">Próxima integração necessária</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Um observador real da interface deve fornecer o alvo, contexto e evidência antes que o guia possa emitir orientação específica.
                        </p>
                    </div>

                    <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-start space-x-3">
                        <ShieldCheckIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-yellow-300">Controle e privacidade</h4>
                            <p className="text-xs text-gray-400 mt-1">
                                Nenhuma captura ou observação de tela é declarada por este componente.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 w-full px-4 py-2 rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/30"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default OrientationGuideModal;
