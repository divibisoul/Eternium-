import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, EyeIcon, SparklesIcon, ShieldCheckIcon } from './icons.tsx';

interface OrientationGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrientationGuideModal: React.FC<OrientationGuideModalProps> = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState(0); // 0: listening, 1: analyzing, 2: guiding

    useEffect(() => {
        if (!isOpen) {
            setPhase(0);
            return;
        }

        const timers = [
            setTimeout(() => setPhase(1), 2500), // Move to analyzing
            setTimeout(() => setPhase(2), 5000), // Move to guiding
        ];

        return () => timers.forEach(clearTimeout);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 font-sans text-white animate-fade-in-guide"
            onClick={onClose}
        >
            <style>{`
                @keyframes fade-in-guide { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-guide { animation: fade-in-guide 0.3s ease-out forwards; }

                @keyframes pulse-highlight {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
                    50% { box-shadow: 0 0 0 12px rgba(56, 189, 248, 0); }
                }
                .animate-pulse-highlight { animation: pulse-highlight 2s infinite; }
            `}</style>

            {/* Simulated App Screen in the background */}
            <div className="absolute inset-0 bg-slate-800 p-8 overflow-hidden">
                <div className="w-full h-full bg-slate-700/50 rounded-lg border border-slate-600 p-6 opacity-30">
                    <div className="h-8 w-1/3 bg-slate-600 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 w-full bg-slate-600 rounded"></div>
                        <div id="target-element" className="h-12 w-full bg-slate-600 rounded"></div>
                        <div className="h-12 w-full bg-slate-600 rounded"></div>
                        <div className="h-12 w-full bg-slate-600 rounded"></div>
                    </div>
                </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                
                {/* Visual Highlight */}
                {phase === 2 && (
                    <div 
                        className="absolute w-[calc(100%-8rem)] h-12 bg-cyan-400/20 border-2 border-cyan-400 rounded-lg animate-pulse-highlight"
                        style={{ top: 'calc(50% - 104px)' }}
                    />
                )}
                
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        {phase === 0 && (
                            <>
                                <MicrophoneIcon className="w-16 h-16 text-cyan-300 mx-auto animate-pulse" />
                                <p className="mt-4 text-2xl font-bold">Ouvindo...</p>
                                <p className="text-gray-400">Diga o que você gostaria de fazer.</p>
                            </>
                        )}
                        {phase === 1 && (
                            <>
                                <EyeIcon className="w-16 h-16 text-purple-300 mx-auto animate-spin" style={{ animationDuration: '3s' }}/>
                                <p className="mt-4 text-2xl font-bold">Analisando interface...</p>
                                <p className="text-gray-400">"Como eu mudo meu nome de usuário?"</p>
                            </>
                        )}
                        {phase === 2 && (
                             <>
                                <SparklesIcon className="w-16 h-16 text-green-300 mx-auto" />
                                <p className="mt-4 text-2xl font-bold">Entendido. Toque no seu perfil.</p>
                                <p className="text-gray-400 max-w-md">O seu nome de usuário está localizado na seção de perfil, que destaquei para você na tela.</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Privacy Disclaimer */}
                <div className="relative z-10 w-full p-4 mt-auto">
                    <div className="max-w-xl mx-auto bg-gray-800/70 border border-yellow-500/30 rounded-lg p-3 flex items-start space-x-3">
                        <ShieldCheckIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-yellow-300">Privacidade e Controle</h4>
                            <p className="text-xs text-gray-400">Esta funcionalidade requer seu consentimento explícito. O acesso à tela é temporário, processado localmente e nunca armazenado, garantindo sua total privacidade.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrientationGuideModal;