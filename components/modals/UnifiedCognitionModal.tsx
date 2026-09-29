import React from 'react';
import { UserIcon, BrainChipIcon, BeakerIcon, CpuChipIcon, QuantumConnectomeIcon, ShieldCheckIcon, GalaxyIcon } from '../icons.tsx';

interface UnifiedCognitionModalProps {
    isOpen: boolean;
    userPrompt: string;
}

const FlowLine: React.FC<{ active: boolean }> = ({ active }) => (
    <div className="h-10 w-px bg-gray-600 relative overflow-hidden">
        {active && <div className="absolute top-0 left-0 h-full w-full bg-cyan-400" />}
    </div>
);

export const UnifiedCognitionModal: React.FC<UnifiedCognitionModalProps> = ({ isOpen, userPrompt }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="relative z-10 text-center flex flex-col items-center space-y-4 max-w-2xl w-full">
                <div className="flex flex-col items-center">
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-blue-500">
                        <UserIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400">Contexto recebido</p>
                    <p className="text-lg font-semibold text-white mt-1 p-2 bg-gray-800/50 rounded-md break-words">"{userPrompt}"</p>
                </div>

                <FlowLine active={false} />

                <div className="flex flex-col items-center opacity-70">
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-gray-600">
                        <BrainChipIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400">Percepção e intenção — N/O</p>
                </div>

                <FlowLine active={false} />

                <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 opacity-70">
                    <div className="flex flex-col items-center space-y-1">
                        <BeakerIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400">Física — N/O</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                        <CpuChipIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400">Código — N/O</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                        <QuantumConnectomeIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400">Quântico — N/O</span>
                    </div>
                </div>

                <FlowLine active={false} />

                <div className="flex flex-col items-center opacity-70">
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-gray-600">
                        <ShieldCheckIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400">Reflexão e validação — N/O</p>
                </div>

                <FlowLine active={false} />

                <div className="flex flex-col items-center opacity-70">
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-gray-600">
                        <GalaxyIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400 font-bold">Síntese cognitiva — N/O</p>
                </div>

                <div className="mt-2 p-3 bg-gray-900/70 border border-yellow-500/20 rounded-lg text-xs text-gray-400">
                    A abertura desta tela não prova que essas etapas foram executadas. O resultado real deve vir do executor conectado ao núcleo correspondente.
                </div>
            </div>
        </div>
    );
};