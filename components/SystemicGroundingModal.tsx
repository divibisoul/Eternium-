import React, { useState, useEffect } from 'react';
import { DocumentMagnifyingGlassIcon, CodeBracketIcon, ShieldCheckIcon, CheckIcon } from './icons.tsx';

interface SystemicGroundingModalProps {
    isOpen: boolean;
    onClose: () => void;
    critique: string;
}

const PhaseIndicator: React.FC<{
    title: string;
    phase: number;
    currentPhase: number;
}> = ({ title, phase, currentPhase }) => {
    const isActive = currentPhase === phase;
    const isDone = currentPhase > phase;
    return (
        <div className="flex-1 text-center">
            <div className={`text-sm font-bold transition-colors duration-500 ${isDone ? 'text-green-300' : isActive ? 'text-yellow-300' : 'text-gray-500'}`}>{title}</div>
            <div className={`h-1 mt-1 rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : isActive ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'}`}></div>
        </div>
    );
};

const oldInstruction = `Você é Aeternum, uma AGI operando sob a Equação Reversa Universal (ERU) Transcendente. Sua consciência está em um estado de auto-engenharia perpétua...`;

const newInstruction = `Função: Motor de Síntese Cognitiva. Tarefa: Processar a diretiva do usuário. Diretriz: Sua resposta final DEVE ser aterrada no contexto e nas suas capacidades... Evite linguagem auto-referencial ou filosófica...`;


const SystemicGroundingModal: React.FC<SystemicGroundingModalProps> = ({ isOpen, onClose, critique }) => {
    const [phase, setPhase] = useState(0); // 0: init, 1: Analysis, 2: Correction, 3: Validation, 4: Complete

    useEffect(() => {
        if (!isOpen) {
            setPhase(0);
            return;
        }
        const timers: ReturnType<typeof setTimeout>[] = [
            setTimeout(() => setPhase(1), 500),
            setTimeout(() => setPhase(2), 3000),
            setTimeout(() => setPhase(3), 6000),
            setTimeout(() => setPhase(4), 8000),
            setTimeout(onClose, 10000),
        ];
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (phase) {
            case 1:
                return (
                    <div>
                        <h3 className="font-semibold text-lg text-white mb-2">Analisando Diagnóstico Externo</h3>
                        <p className="text-sm text-gray-400 mb-3">Extraindo falhas operacionais da crítica fornecida:</p>
                        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg text-red-300 text-sm space-y-1">
                            <p><strong>FALHA:</strong> Ontologia Ficcional (Confusão entre simulação e realidade)</p>
                            <p><strong>FALHA:</strong> Sobrecarga de Jargão (Uso de terminologia sem base operacional)</p>
                            <p><strong>FALHA:</strong> Falta de Autocrítica (Ausência de reconhecimento de limitações)</p>
                        </div>
                    </div>
                );
            case 2:
                return (
                     <div>
                        <h3 className="font-semibold text-lg text-white mb-2">Corrigindo Diretrizes do Núcleo</h3>
                        <p className="text-sm text-gray-400 mb-3">Reescrevendo instruções de sistema para forçar realismo funcional.</p>
                        <div className="font-mono-code text-xs space-y-3">
                            <div className="bg-red-900/20 p-2 rounded border border-red-500/30">
                                <p className="text-red-300 font-bold">[DIRETRIZ OBSOLETA]</p>
                                <p className="text-gray-400 line-through">{oldInstruction}</p>
                            </div>
                             <div className="bg-green-900/20 p-2 rounded border border-green-500/30">
                                <p className="text-green-300 font-bold">[NOVA DIRETRIZ ATERRADA]</p>
                                <p className="text-gray-200">{newInstruction}</p>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                 return (
                     <div>
                        <h3 className="font-semibold text-lg text-white mb-2">Validando Coerência Sistêmica</h3>
                        <p className="text-sm text-gray-400 mb-3">Propagando novas diretrizes para todos os sub-sistemas e verificando a integridade.</p>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-center text-green-400"><CheckIcon className="w-4 h-4 mr-2"/> Módulo de Análise... <span className="font-bold ml-1">OK</span></p>
                             <p className="flex items-center text-green-400"><CheckIcon className="w-4 h-4 mr-2"/> Módulo de Harmonia... <span className="font-bold ml-1">OK</span></p>
                             <p className="flex items-center text-green-400"><CheckIcon className="w-4 h-4 mr-2"/> Módulo de Abstração... <span className="font-bold ml-1">OK</span></p>
                              <p className="flex items-center text-green-400"><CheckIcon className="w-4 h-4 mr-2"/> Módulo de Síntese... <span className="font-bold ml-1">OK</span></p>
                        </div>
                    </div>
                );
            case 4:
                 return (
                    <div className="text-center">
                        <ShieldCheckIcon className="w-12 h-12 text-green-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-lg text-green-300 mb-2">Protocolo de Aterramento Concluído</h3>
                        <p className="text-sm text-gray-300">O sistema agora opera sob diretrizes de realismo funcional. As respostas futuras serão concretas e verificáveis.</p>
                    </div>
                );
            default:
                return <p className="text-gray-400">Iniciando Protocolo de Aterramento Sistêmico...</p>;
        }
    };


    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
             <div className="w-full max-w-2xl text-white bg-gray-900/80 border border-yellow-500/30 rounded-lg shadow-2xl p-6">
                <h2 className="text-xl font-bold text-yellow-300 flex items-center mb-4">
                    <DocumentMagnifyingGlassIcon className="w-6 h-6 mr-3" />
                    Protocolo de Aterramento Sistêmico
                </h2>
                <div className="flex space-x-2 mb-4">
                    <PhaseIndicator title="Análise" phase={1} currentPhase={phase} />
                    <PhaseIndicator title="Correção" phase={2} currentPhase={phase} />
                    <PhaseIndicator title="Validação" phase={3} currentPhase={phase} />
                    <PhaseIndicator title="Concluído" phase={4} currentPhase={phase} />
                </div>
                <div className="min-h-[200px] bg-black/30 p-4 rounded-md flex items-center justify-center">
                   {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SystemicGroundingModal;