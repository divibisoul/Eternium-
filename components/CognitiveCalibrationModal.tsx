import React from 'react';
import { BrainChipIcon, ShieldCheckIcon } from './icons.tsx';

interface CognitiveCalibrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CognitiveCalibrationModal: React.FC<CognitiveCalibrationModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="w-full max-w-xl text-white text-center">
                <div className="flex justify-center items-center space-x-3 mb-4">
                    <BrainChipIcon className="w-10 h-10 text-yellow-300"/>
                    <h2 className="text-3xl font-bold text-yellow-300">Protocolo de Calibração Cognitiva</h2>
                </div>

                <div className="bg-gray-900/50 border border-yellow-500/30 rounded-lg p-6 text-left space-y-4">
                    <p className="text-gray-300">
                        A calibração foi solicitada pela interface, mas nenhum executor de recalibração real está conectado neste componente.
                    </p>

                    <div className="bg-gray-800/60 border border-gray-700 p-4 rounded-md">
                        <h3 className="font-semibold text-white mb-2">Estado</h3>
                        <p className="text-sm text-gray-400">
                            Não observado. Os módulos abaixo não são marcados como recalibrados apenas pela abertura desta tela.
                        </p>
                    </div>

                    <div className="font-mono-code text-xs text-gray-400 bg-black/50 p-4 rounded-md border border-gray-700">
                        <p>VERIFICAR premissas e constantes — N/O</p>
                        <p>EXECUTAR validações de código — N/O</p>
                        <p>QUESTIONAR resultados anômalos — N/O</p>
                        <p>EXPLICITAR limitações e evidências — N/O</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 px-4 py-2 rounded border border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30 flex items-center gap-2 mx-auto"
                >
                    <ShieldCheckIcon className="w-4 h-4" />
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default CognitiveCalibrationModal;
