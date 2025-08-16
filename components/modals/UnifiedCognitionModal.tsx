
import React, { useEffect, useState } from 'react';
import { UserIcon, BrainChipIcon, BeakerIcon, CpuChipIcon, QuantumConnectomeIcon, ShieldCheckIcon, GalaxyIcon } from '../icons.tsx';

interface UnifiedCognitionModalProps {
    isOpen: boolean;
    userPrompt: string;
}

const CoreIcon: React.FC<{ icon: React.FC<{ className?: string }>, active: boolean, delay: number, name: string }> = ({ icon: Icon, active, delay, name }) => (
    <div className={`flex flex-col items-center transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-40'}`} style={{transitionDelay: `${delay}ms`}}>
        <div className={`p-2 rounded-full border-2 bg-gray-800 transition-all duration-300 ${active ? 'border-purple-400 shadow-lg shadow-purple-500/30' : 'border-gray-600'}`}>
            <Icon className={`w-8 h-8 transition-colors duration-300 ${active ? 'text-purple-300' : 'text-gray-500'}`} />
        </div>
        <span className="text-xs mt-1 text-gray-400">{name}</span>
    </div>
);

const FlowLine: React.FC<{ active: boolean, delay: number }> = ({ active, delay }) => (
    <div className="h-10 w-px bg-gray-600 relative overflow-hidden">
        <div 
            className="absolute top-0 left-0 h-full w-full bg-cyan-400 transition-transform duration-500 ease-in-out" 
            style={{ transform: active ? 'translateY(0%)' : 'translateY(-100%)', transitionDelay: `${delay}ms` }}
        />
    </div>
);

export const UnifiedCognitionModal: React.FC<UnifiedCognitionModalProps> = ({ isOpen, userPrompt }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setStep(0);
            return;
        }

        const timers = [
            setTimeout(() => setStep(1), 500),   // Perception
            setTimeout(() => setStep(2), 1500),  // Reasoning Cores light up
            setTimeout(() => setStep(3), 2500),  // Reflection
            setTimeout(() => setStep(4), 3500),  // Synthesis
        ];

        return () => timers.forEach(clearTimeout);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <style>{`
                @keyframes fadeIn-unified { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn-unified { from { transform: scale(0.95); } to { transform: scale(1); } }
                .animate-fadeIn { animation: fadeIn-unified 0.5s ease-out forwards; }
                .animate-scaleIn { animation: scaleIn-unified 0.5s ease-out forwards; }
            `}</style>
            <div className="animate-fadeIn w-full h-full absolute inset-0"></div>
            <div className="relative z-10 animate-scaleIn text-center flex flex-col items-center space-y-4 max-w-2xl">

                {/* Input */}
                <div className={`flex flex-col items-center transition-opacity duration-500 ${step >= 0 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-blue-500">
                        <UserIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400">Input Recebido</p>
                    <p className="text-lg font-semibold text-white mt-1 p-2 bg-gray-800/50 rounded-md">"{userPrompt}"</p>
                </div>
                
                <FlowLine active={step >= 1} delay={500} />

                {/* Perception */}
                <div className={`flex flex-col items-center transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-cyan-500">
                        <BrainChipIcon className="w-10 h-10 text-cyan-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400">Percepção Unificada & Análise de Intenção</p>
                </div>

                <FlowLine active={step >= 2} delay={1500} />

                {/* Reasoning */}
                 <div className={`flex flex-col items-center transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-sm mb-2 text-gray-400">Raciocínio Transdisciplinar (Ativando Extensões Neurais)</p>
                    <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <CoreIcon icon={BeakerIcon} active={step >= 2} delay={1600} name="Física" />
                        <CoreIcon icon={CpuChipIcon} active={step >= 2} delay={1800} name="Código" />
                        <CoreIcon icon={QuantumConnectomeIcon} active={step >= 2} delay={2000} name="Quântico" />
                    </div>
                </div>

                <FlowLine active={step >= 3} delay={2500} />

                {/* Reflection */}
                <div className={`flex flex-col items-center transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-green-500">
                        <ShieldCheckIcon className="w-10 h-10 text-green-400" />
                    </div>
                    <p className="text-sm mt-2 text-gray-400">Auto-Reflexão Crítica e Validação Ética</p>
                </div>

                <FlowLine active={step >= 4} delay={3500} />

                {/* Synthesis */}
                <div className={`flex flex-col items-center transition-opacity duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="p-3 rounded-full border-2 bg-gray-800 border-yellow-400 shadow-lg shadow-yellow-500/30 animate-pulse">
                        <GalaxyIcon className="w-10 h-10 text-yellow-300" />
                    </div>
                    <p className="text-sm mt-2 text-yellow-300 font-bold">Gerando Síntese Cognitiva...</p>
                </div>

            </div>
        </div>
    );
};
