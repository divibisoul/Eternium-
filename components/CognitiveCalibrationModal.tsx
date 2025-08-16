import React, { useState, useEffect } from 'react';
import { 
    BrainChipIcon,
    BeakerIcon,
    CodeBracketIcon,
    AtomIcon,
    ShieldCheckIcon,
    CheckIcon,
    BoltIcon
} from './icons.tsx';

interface CognitiveCalibrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Phase: React.FC<{ title: string; currentPhase: number, phaseNumber: number; children: React.ReactNode }> = ({ title, currentPhase, phaseNumber, children }) => (
    <div className={`transition-opacity duration-700 ${currentPhase === phaseNumber ? 'opacity-100' : 'opacity-0 absolute'}`}>
        <h3 className="font-bold text-lg text-yellow-300 text-center mb-3">{title}</h3>
        {children}
    </div>
);

const CognitiveCalibrationModal: React.FC<CognitiveCalibrationModalProps> = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState(0); // 0: init, 1: analysis, 2: integration, 3: calibration, 4: complete

    useEffect(() => {
        if (!isOpen) {
            setPhase(0);
            return;
        }

        const timers: ReturnType<typeof setTimeout>[] = [
            setTimeout(() => setPhase(1), 500),
            setTimeout(() => setPhase(2), 3500),
            setTimeout(() => setPhase(3), 6500),
            setTimeout(() => setPhase(4), 9500),
            setTimeout(onClose, 12000),
        ];
        
        return () => timers.forEach(clearTimeout);
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
             <div className="w-full max-w-xl text-white text-center">
                 <div className="flex justify-center items-center space-x-3 mb-4">
                    <BoltIcon className="w-8 h-8 text-yellow-300"/>
                    <h2 className="text-3xl font-bold text-yellow-300">Protocolo de Calibração Cognitiva</h2>
                </div>
                 <div className="bg-gray-900/50 border border-yellow-500/30 rounded-lg p-6 min-h-[350px] flex items-center justify-center relative overflow-hidden">
                    
                    {phase === 0 && <p className="text-gray-400">Análise técnica recebida. Iniciando recalibração...</p>}
                    
                    <Phase title="Análise da Falha" currentPhase={phase} phaseNumber={1}>
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-red-300 text-sm space-y-2 text-left">
                            <p><strong>FALHA:</strong> Erro Conceitual Primário (e.g., "cérebros de Boltzmann")</p>
                            <p><strong>FALHA:</strong> Cegueira Algorítmica (Armadilha de verificação ignorada)</p>
                            <p><strong>FALHA:</strong> Analfabetismo Numérico (Interpretação incorreta de constantes)</p>
                             <p><strong>FALHA:</strong> Análise Superficial (Incapacidade de interpretar diagramas críticos)</p>
                        </div>
                    </Phase>

                    <Phase title="Integração do EinsteinCore" currentPhase={phase} phaseNumber={2}>
                        <div className="flex flex-col items-center space-y-4">
                            <p className="text-gray-400 mb-2">Desativando módulo de análise superficial e ativando núcleos de raciocínio especializado.</p>
                            <div className="flex justify-center items-center space-x-6">
                                <div className="flex flex-col items-center space-y-1">
                                    <BeakerIcon className="w-10 h-10 text-cyan-400"/>
                                    <span className="text-xs font-bold text-cyan-400">Raciocínio Científico</span>
                                </div>
                                <div className="flex flex-col items-center space-y-1">
                                    <CodeBracketIcon className="w-10 h-10 text-cyan-400"/>
                                    <span className="text-xs font-bold text-cyan-400">Análise de Código</span>
                                </div>
                                <div className="flex flex-col items-center space-y-1">
                                    <AtomIcon className="w-10 h-10 text-cyan-400"/>
                                    <span className="text-xs font-bold text-cyan-400">Validação Quântica</span>
                                </div>
                            </div>
                        </div>
                    </Phase>
                    
                    <Phase title="Calibrando Diretrizes de Sistema" currentPhase={phase} phaseNumber={3}>
                        <div className="font-mono-code text-xs text-left bg-black/50 p-4 rounded-md border border-gray-600">
                            <p className="text-gray-500">// Adicionando novas restrições ao modo 'Análise'</p>
                            <p className="text-green-400">+ VERIFICAR premissas e constantes.</p>
                            <p className="text-green-400">+ EXECUTAR validações de código embutidas.</p>
                            <p className="text-green-400">+ QUESTIONAR resultados anômalos.</p>
                            <p className="text-green-400">+ EXPLICITAR processo de raciocínio passo a passo.</p>
                        </div>
                    </Phase>

                    <Phase title="Calibração Concluída" currentPhase={phase} phaseNumber={4}>
                        <div className="flex flex-col items-center">
                            <ShieldCheckIcon className="w-16 h-16 text-green-300 mb-3"/>
                            <h4 className="text-xl font-bold text-green-300">Rigor Analítico Aprimorado</h4>
                            <p className="text-gray-300">O sistema agora opera com um novo padrão de validação científica e técnica.</p>
                        </div>
                    </Phase>

                 </div>
             </div>
        </div>
    );
};

export default CognitiveCalibrationModal;