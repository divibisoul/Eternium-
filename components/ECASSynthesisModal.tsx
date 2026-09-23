import React from 'react';
import { AtomIcon, CubeTransparentIcon, CheckIcon } from './icons.tsx';
import { ActiveOperation } from '../types.ts';

interface ECASModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: ActiveOperation | undefined;
}

const ECASSynthesisModal: React.FC<ECASModalProps> = ({ isOpen, onClose, operation }) => {
    const isComplete = operation?.status === 'DONE';
    
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
            <div className="bg-gray-900 border border-teal-500/50 rounded-lg p-6 max-w-md w-full text-center">
                <h3 className="text-lg font-bold text-teal-300 mb-4">Síntese E.C.A.S.</h3>
                {!isComplete ? (
                    <>
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                            <AtomIcon className="w-24 h-24 text-teal-400 absolute animate-pulse" />
                            <CubeTransparentIcon className="w-12 h-12 text-teal-200 absolute animate-spin" style={{ animationDuration: '5s' }} />
                        </div>
                        <p className="mt-4 text-gray-300">Gerando nova arquitetura cognitiva...</p>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <CheckIcon className="w-16 h-16 text-green-400 mb-2"/>
                        <p className="text-green-300 font-bold">Nova Capacidade Sintetizada!</p>
                        <p className="text-gray-400 text-sm">Integrando ao arsenal de evolução...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ECASSynthesisModal;
