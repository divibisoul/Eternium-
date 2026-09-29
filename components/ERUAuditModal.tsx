import React from 'react';
import { ArrowsPathIcon, PuzzlePieceIcon, CodeBracketIcon, SparklesIcon, ShieldCheckIcon, AtomIcon } from './icons.tsx';

interface ERUAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: number;
}

const phases = [
    { name: 'Escaneamento de Entropia', icon: ArrowsPathIcon, log: 'Aguardando observações reais de entropia.' },
    { name: 'Diagnóstico de Coerência', icon: PuzzlePieceIcon, log: 'Aguardando evidências reais de coerência.' },
    { name: 'Reconstrução de Vetores', icon: CodeBracketIcon, log: 'Aguardando executor real de reconstrução.' },
    { name: 'Refino de Homeostase', icon: SparklesIcon, log: 'Aguardando dados reais de homeostase.' },
    { name: 'Validação de Integridade', icon: ShieldCheckIcon, log: 'Aguardando verificação independente.' },
];

const ERUAuditModal: React.FC<ERUAuditModalProps> = ({ isOpen, onClose, progress }) => {
    if (!isOpen) return null;

    const hasObservedPhase = progress > 0 && progress <= phases.length;
    const phaseIndex = Math.max(0, Math.min(phases.length - 1, progress - 1));
    const currentPhaseData = phases[phaseIndex];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="w-full max-w-3xl text-white text-center">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <AtomIcon className="w-10 h-10 text-cyan-300" />
                    <h2 className="text-3xl font-bold text-cyan-300">Auditoria da Equação Reversa Universal</h2>
                </div>

                <p className="text-gray-400 mb-8">
                    Esta interface exibe somente fases/estado fornecidos pelo executor. A abertura da tela não executa auditoria.
                </p>

                <div className="relative flex items-start justify-center w-full px-8 mb-8">
                    {phases.map((phase, index) => {
                        const done = hasObservedPhase && progress > index + 1;
                        const active = hasObservedPhase && progress === index + 1;
                        const circleClass = done
                            ? 'border-green-400 bg-green-900/30'
                            : active ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-700 bg-gray-800';
                        const iconClass = done
                            ? 'text-green-300'
                            : active ? 'text-cyan-300' : 'text-gray-500';
                        const titleClass = done
                            ? 'text-green-300'
                            : active ? 'text-cyan-300' : 'text-gray-500';
                        return (
                            <React.Fragment key={phase.name}>
                                <div className="flex-1 text-center">
                                    <div className={'mx-auto w-12 h-12 rounded-full flex items-center justify-center border-2 ' + circleClass}>
                                        <phase.icon className={'w-6 h-6 ' + iconClass} />
                                    </div>
                                    <div className={'text-xs mt-2 font-semibold ' + titleClass}>{phase.name}</div>
                                </div>
                                {index < phases.length - 1 && (
                                    <div className={'flex-1 relative top-6 h-0.5 mt-px ' + (done ? 'bg-green-400' : 'bg-gray-700')} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-h-[120px] flex flex-col items-center justify-center font-mono-code text-cyan-300 text-lg">
                    <span>{hasObservedPhase ? currentPhaseData.log : 'Resultado da auditoria: N/O'}</span>
                    {progress > phases.length && (
                        <span className="mt-3 text-amber-300 text-sm">
                            O executor sinalizou uma etapa além do fluxo local. Nenhuma conclusão de sistema nominal é inferida por esta UI.
                        </span>
                    )}
                    <button type="button" onClick={onClose} className="mt-5 px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ERUAuditModal;