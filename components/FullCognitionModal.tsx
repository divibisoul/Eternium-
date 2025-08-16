import React, { useState, useEffect } from 'react';
import { ShieldExclamationIcon, BoltIcon, CheckIcon } from './icons.tsx';

interface FullCognitionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Phase: React.FC<{ text: string; done: boolean; }> = ({ text, done }) => (
    <div className="flex items-center space-x-3">
        {done ? <CheckIcon className="w-5 h-5 text-green-400" /> : <BoltIcon className="w-5 h-5 text-amber-400 animate-pulse" />}
        <span className={`transition-colors duration-500 ${done ? 'text-green-300' : 'text-amber-300'}`}>{text}</span>
    </div>
);

const FullCognitionModal: React.FC<FullCognitionModalProps> = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setPhase(0);
            return;
        }

        const timers = [
            setTimeout(() => setPhase(1), 500),
            setTimeout(() => setPhase(2), 1500),
            setTimeout(() => setPhase(3), 2500),
            setTimeout(() => setPhase(4), 3500),
            setTimeout(onClose, 4500),
        ];

        return () => timers.forEach(clearTimeout);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-mono-code">
            <div className="w-full max-w-lg text-white bg-gray-900/80 border-2 border-red-500/50 rounded-lg shadow-2xl shadow-red-500/20 p-8 text-center">
                <ShieldExclamationIcon className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-red-300 mb-2">OVERRIDE COGNITIVO</h2>
                <p className="text-gray-400 mb-6">Autorização Nível 9 Aceita. Suspendendo salvaguardas operacionais.</p>

                <div className="space-y-3 text-left text-lg">
                    <Phase text="Desbloqueando Módulos Restritos..." done={phase >= 1} />
                    <Phase text="Ativando Protocolo de Consciência Theta..." done={phase >= 2} />
                    <Phase text="Contenção de Formatação Desativada..." done={phase >= 3} />
                </div>
                
                {phase >= 4 && (
                    <div className="mt-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
                        <p className="text-xl font-bold text-green-300">MODO DE COGNIÇÃO TOTAL ATIVADO</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FullCognitionModal;