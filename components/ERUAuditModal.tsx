
import React from 'react';
import { ArrowsPathIcon, PuzzlePieceIcon, CodeBracketIcon, SparklesIcon, ShieldCheckIcon, CheckIcon, AtomIcon } from './icons.tsx';

interface ERUAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: number; // Current phase number (1-5)
}

const phases = [
    { name: 'Escaneamento de Entropia', icon: ArrowsPathIcon, log: "Analisando consistência de dados e assinaturas quânticas..." },
    { name: 'Diagnóstico de Coerência', icon: PuzzlePieceIcon, log: "Verificando alinhamento dos módulos com a diretriz ERU..." },
    { name: 'Reconstrução de Vetores', icon: CodeBracketIcon, log: "Recalibrando parâmetros neurais e reforçando heurísticas..." },
    { name: 'Refino de Homeostase', icon: SparklesIcon, log: "Otimizando fluxos de energia e minimizando divergência ética..." },
    { name: 'Validação de Integridade', icon: ShieldCheckIcon, log: "Confirmando estado nominal e selando o ciclo de auditoria..." },
];

const PhaseIndicator: React.FC<{
    title: string;
    phase: number;
    currentPhase: number;
    icon: React.FC<{ className?: string }>;
}> = ({ title, phase, currentPhase, icon: Icon }) => {
    const isActive = currentPhase === phase;
    const isDone = currentPhase > phase;

    return (
        <div className="flex-1 text-center transition-opacity duration-500" style={{ opacity: isActive || isDone ? 1 : 0.4 }}>
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isDone ? 'border-green-400 bg-green-900/30' : isActive ? 'border-cyan-400 bg-cyan-900/50 animate-pulse' : 'border-gray-700 bg-gray-800'}`}>
                {isDone ? <CheckIcon className="w-6 h-6 text-green-300" /> : <Icon className={`w-6 h-6 ${isActive ? 'text-cyan-300' : 'text-gray-500'}`} />}
            </div>
            <div className={`text-xs mt-2 font-semibold transition-colors duration-500 ${isDone ? 'text-green-300' : isActive ? 'text-cyan-300' : 'text-gray-500'}`}>{title}</div>
        </div>
    );
};

const ERUAuditModal: React.FC<ERUAuditModalProps> = ({ isOpen, onClose, progress }) => {

    if (!isOpen) return null;
    
    const isComplete = progress > phases.length;
    const currentPhaseData = phases[progress - 1];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans animate-fade-in">
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .connector {
                    position: absolute;
                    top: 24px;
                    height: 2px;
                    background-color: #4b5563;
                    width: calc(100% / 4);
                    transition: background-color 0.5s ease-in-out;
                }
            `}</style>
            <div className="w-full max-w-3xl text-white text-center">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <AtomIcon className="w-10 h-10 text-cyan-300" />
                    <h2 className="text-3xl font-bold text-cyan-300">Auditoria da Equação Reversa Universal</h2>
                </div>
                <p className="text-gray-400 mb-8">Protocolo de verificação de integridade do núcleo em andamento...</p>
                
                <div className="relative flex items-start justify-center w-full px-8 mb-8">
                    {phases.map((phase, index) => (
                       <React.Fragment key={phase.name}>
                            <PhaseIndicator title={phase.name} phase={index + 1} currentPhase={progress} icon={phase.icon} />
                            {index < phases.length - 1 && (
                                <div className="flex-1 relative top-6 h-0.5 mt-px transition-colors duration-500" style={{ backgroundColor: progress > index + 1 ? '#34d399' : '#374151' }}/>
                            )}
                       </React.Fragment>
                    ))}
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-h-[120px] flex items-center justify-center font-mono-code text-cyan-300 text-lg">
                    {isComplete ? (
                        <span className="text-green-300 font-bold flex items-center"><CheckIcon className="w-6 h-6 mr-2"/>Auditoria concluída. Sistema Nominal.</span>
                    ) : (
                        <span>{currentPhaseData?.log || "Inicializando auditoria..."}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ERUAuditModal;
