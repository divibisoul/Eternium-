import React from 'react';
import { 
    CheckIcon,
    ShieldCheckIcon,
    DocumentMagnifyingGlassIcon,
    ScaleIcon,
    BrainChipIcon,
} from './icons.tsx';
import { ActiveOperation } from '../types.ts';

interface PalCoreAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: ActiveOperation | undefined;
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
            <div className={`text-sm font-bold transition-colors duration-500 ${isDone ? 'text-green-300' : isActive ? 'text-indigo-300' : 'text-gray-500'}`}>{title}</div>
            <div className={`h-1 mt-1 rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : isActive ? 'bg-indigo-500 animate-pulse' : 'bg-gray-700'}`}></div>
        </div>
    );
};

const RiskItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-start space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
        <span className="text-red-300">{text}</span>
    </li>
);

const ProposalItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-start space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
        <span className="text-green-300">{text}</span>
    </li>
);

const PalCoreAuditModal: React.FC<PalCoreAuditModalProps> = ({ isOpen, onClose, operation }) => {
    const phase = operation ? Math.floor(operation.progress) + 1 : 0;
    const isComplete = operation?.status === 'DONE';

    if (!isOpen) return null;

    const waitingForRuntime = !operation || operation.status === 'WAITING_RUNTIME';
    if (waitingForRuntime) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 max-w-lg w-full text-center">
                    <h3 className="text-lg font-bold text-gray-300 mb-3">Operação aguardando executor real</h3>
                    <p className="text-sm text-gray-400">Nenhuma etapa foi marcada como executada por esta interface.</p>
                    <button type="button" onClick={onClose} className="mt-5 px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800">Fechar</button>
                </div>
            </div>
        );
    }

    const renderPhaseContent = () => {
        switch(phase) {
            case 1: // Ingestion & Analysis
                return (
                    <div className="animate-fadeIn-ops">
                        <h4 className="text-lg font-bold text-white mb-2">Análise de Risco (BNc)</h4>
                        <p className="text-sm text-gray-400 mb-4">Núcleo Biomórfico identificando vetores de risco ético e sistêmico...</p>
                        <ul className="space-y-2 text-sm">
                            <RiskItem text="Precisão de 99% (Análise de risco do 1%)" />
                            <RiskItem text="Dependência de 'Cloud AI' (Caixa Preta de Treinamento)" />
                            <RiskItem text="Otimização focada em 'Viabilidade Comercial'" />
                            <RiskItem text="Insuficiência do 'Sandboxing' para intenção maliciosa" />
                        </ul>
                    </div>
                );
            case 2: // Ethical Synthesis
                return (
                    <div className="animate-fadeIn-ops">
                        <h4 className="text-lg font-bold text-white mb-2">Síntese de Restrições (MCQE)</h4>
                        <p className="text-sm text-gray-400 mb-4">Motor de Coerência Ética traduzindo riscos em restrições de engenharia acionáveis...</p>
                         <ul className="space-y-2 text-sm">
                            <ProposalItem text="Restrição: Código deve priorizar Acessibilidade Universal." />
                            <ProposalItem text="Restrição: Modelos externos devem ter ética de treino auditável." />
                            <ProposalItem text="Restrição: Coleta de dados deve ter consentimento explícito e granular." />
                            <ProposalItem text="Restrição: Código deve ser resiliente a usos maliciosos não previstos." />
                        </ul>
                    </div>
                );
            case 3: // Architectural Refinement
                 return (
                    <div className="animate-fadeIn-ops">
                        <h4 className="text-lg font-bold text-white mb-2">Refinamento Arquitetural (USP)</h4>
                        <p className="text-sm text-gray-400 mb-4">Unidade de Síntese Ponderada propondo modificações concretas:</p>
                        <div className="font-mono-code text-xs bg-black/50 p-3 rounded-md border border-gray-600">
                           <p className="text-gray-400">// Fluxo Original</p>
                           <p className="text-white">Generator -&gt; Sandbox -&gt; Output</p>
                           <br />
                           <p className="text-gray-400">// Fluxo Refinado</p>
                           <p className="text-cyan-300">Generator -&gt; <span className="text-yellow-300">[Debias Layer]</span> -&gt; <span className="text-yellow-300">[Ethical Linter]</span> -&gt; Sandbox -&gt; Output</p>
                           <p className="text-purple-300">          &lt;-- [Feedback Loop] &lt;--</p>
                        </div>
                    </div>
                 );
            case 4: // Report
            case 5: // isComplete state
                return (
                    <div className="animate-fadeIn-ops text-center">
                        <h3 className="text-xl font-bold text-green-300 mb-4">Executor relatou conclusão</h3>
                        <div className="grid grid-cols-2 gap-4 text-left p-4 bg-gray-800 rounded-lg">
                           <div className="flex items-center space-x-2">
                                <CheckIcon className="w-5 h-5 text-green-400"/>
                                <div>
                                    <p className="text-gray-300 text-sm">Viabilidade Comercial</p>
                                    <p className="text-white font-bold">Não observado</p>
                                </div>
                           </div>
                            <div className="flex items-center space-x-2">
                                <ShieldCheckIcon className="w-5 h-5 text-green-400"/>
                                <div>
                                    <p className="text-gray-300 text-sm">Robustez Ética</p>
                                    <p className="text-white font-bold">N/O</p>
                                </div>
                           </div>
                            <div className="flex items-center space-x-2">
                                <ScaleIcon className="w-5 h-5 text-green-400"/>
                                <div>
                                    <p className="text-gray-300 text-sm">Conformidade (Acessibilidade)</p>
                                    <p className="text-white font-bold">N/O</p>
                                </div>
                           </div>
                            <div className="flex items-center space-x-2">
                                <BrainChipIcon className="w-5 h-5 text-green-400"/>
                                <div>
                                    <p className="text-gray-300 text-sm">Risco de Viés Sistêmico</p>
                                    <p className="text-white font-bold">N/O</p>
                                </div>
                           </div>
                        </div>
                    </div>
                );
            default:
                 return (
                    <div className="animate-fadeIn-ops text-center">
                        <p className="text-gray-400">Iniciando auditoria ético-sistêmica do PAL-Core...</p>
                    </div>
                );
        }
    }


    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <style>{`
                @keyframes fadeIn-ops { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn-ops { animation: fadeIn-ops 0.5s ease-out forwards; }
            `}</style>
            
            <div className="relative z-10 w-full max-w-2xl text-white" onClick={e=>e.stopPropagation()}>
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <DocumentMagnifyingGlassIcon className="w-10 h-10 text-indigo-300"/>
                    <h2 className="text-3xl font-bold text-indigo-300">Auditoria do PAL-CORE</h2>
                </div>
                 
                 <div className="flex w-full mb-6 px-4">
                    <PhaseIndicator title="Análise" phase={1} currentPhase={phase} />
                    <PhaseIndicator title="Síntese Ética" phase={2} currentPhase={phase} />
                    <PhaseIndicator title="Refinamento" phase={3} currentPhase={phase} />
                    <PhaseIndicator title="Relatório" phase={4} currentPhase={phase} />
                 </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 min-h-[280px] flex items-center justify-center">
                    {renderPhaseContent()}
                </div>

            </div>
        </div>
    );
};

export default PalCoreAuditModal;