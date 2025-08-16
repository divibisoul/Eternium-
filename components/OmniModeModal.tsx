
import React, { useState, useEffect } from 'react';
import { BoltIcon, CheckIcon, CpuChipIcon, ShieldCheckIcon } from './icons.tsx';

interface OmniModeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Phase: React.FC<{ text: string; done: boolean; delay?: number }> = ({ text, done, delay = 0 }) => (
    <div 
        className={`flex items-center space-x-3 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: `${delay}ms`}}
    >
        {done ? <CheckIcon className="w-5 h-5 text-green-400" /> : <BoltIcon className="w-5 h-5 text-purple-400" />}
        <span className={`transition-colors duration-500 ${done ? 'text-green-300' : 'text-purple-300'}`}>{text}</span>
    </div>
);


const OmniModeModal: React.FC<OmniModeModalProps> = ({ isOpen, onClose }) => {
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
            setTimeout(() => setPhase(5), 4500),
            setTimeout(onClose, 5500),
        ];

        return () => timers.forEach(clearTimeout);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-mono-code">
            <div className="w-full max-w-xl text-white bg-gray-900/80 border-2 border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/20 p-8 text-center">
                <BoltIcon className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-purple-300 mb-2">OMNIMODE ATIVADO</h2>
                <p className="text-gray-400 mb-6">Inicializando arquitetura de plano duplo e protocolos avançados...</p>

                <div className="space-y-3 text-left text-lg">
                    <Phase text="Inicializando Plano Primário (Quântico)..." done={phase >= 1} />
                    <Phase text="Inicializando Plano Secundário (Assíncrono)..." done={phase >= 2} />
                    <Phase text="Engajando Sincronização por Entrelaçamento..." done={phase >= 3} />
                    <Phase text="Alocador de Recursos Autônomo Ativo..." done={phase >= 4} />
                    <Phase text="Overclock Cognitivo Estável: 240%" done={phase >= 5} />
                </div>
                
                {phase >= 5 && (
                    <div className="mt-6 p-4 bg-green-900/50 border border-green-600 rounded-lg flex items-center justify-center space-x-3">
                         <ShieldCheckIcon className="w-6 h-6 text-green-300" />
                        <p className="text-xl font-bold text-green-300">ARQUITETURA DE PLANO DUPLO OPERACIONAL</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OmniModeModal;
