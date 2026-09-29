import React from 'react';
import { EyeIcon, SparklesIcon, ShieldCheckIcon } from './icons.tsx';

interface OrientationGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrientationGuideModal: React.FC<OrientationGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white" onClick={onClose}>
            <div className="relative w-full max-w-2xl bg-gray-900 border border-cyan-400/30 rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-cyan-300">Guia de Orientação</h2>
                        <p className="text-xs text-gray-500">Estado factual do módulo</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                    <EyeIcon className="w-10 h-10 text-cyan-300" />
                    <div>
                        <p className="text-lg font-semibold">Executor de orientação não vinculado</p>
                        <p className="text-sm text-gray-400">O sistema preserva o módulo e sua função-alvo, mas não apresenta uma tela simulada como evidência de execução.</p>
                    </div>
                </div>
                <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <SparklesIcon className="w-5 h-5 text-gray-400" />
                        <span>Estado: <strong>UNMEASURED / BLOCKED</strong></span>
                    </div>
                    <p className="text-sm text-gray-400">
                        Para demonstrar orientação real, o módulo precisa receber uma entrada observável, localizar um alvo real da interface e registrar a ação executada e sua correlação. Nenhuma dessas etapas é inferida neste painel.
                    </p>
                </div>
                <div className="mt-6 bg-gray-800/70 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-3">
                    <ShieldCheckIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-yellow-300">Privacidade e Controle</h4>
                        <p className="text-xs text-gray-400">Acesso a interfaces e orientação contextual devem depender de consentimento e de uma implementação runtime comprovável.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrientationGuideModal;
