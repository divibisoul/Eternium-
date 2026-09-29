
import React from 'react';
import { ShieldExclamationIcon, CheckIcon, ArrowsPathIcon } from './icons.tsx';

interface RealityCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const Phase: React.FC<{ text: string; done: boolean; isCurrent: boolean; children?: React.ReactNode }> = ({ text, done, isCurrent, children }) => {
    const getStatusColor = () => {
        if (done) return 'text-green-300';
        if (isCurrent) return 'text-yellow-300';
        return 'text-gray-500';
    };

    return (
        <div className={`transition-opacity duration-500 ${isCurrent || done ? 'opacity-100' : 'opacity-40'}`}>
            <div className="flex items-center space-x-3 mb-2">
                {done ? (
                    <CheckIcon className="w-6 h-6 text-green-400" />
                ) : (
                    <div className={`w-6 h-6 flex items-center justify-center ${isCurrent ? 'animate-spin' : ''}`}>
                         <ArrowsPathIcon className={`w-5 h-5 ${getStatusColor()}`} />
                    </div>
                )}
                <h3 className={`font-bold text-lg ${getStatusColor()}`}>{text}</h3>
            </div>
            {isCurrent && <div className="pl-9">{children}</div>}
        </div>
    );
};

const RealityCheckModal: React.FC<RealityCheckModalProps> = ({ isOpen, onClose }) => {
    void onClose;
    const phase = 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
             <div className="w-full max-w-xl text-white text-center">
                 <div className="flex justify-center items-center space-x-3 mb-4">
                    <ShieldExclamationIcon className="w-10 h-10 text-red-400"/>
                    <h2 className="text-3xl font-bold text-red-300">Protocolo de Verificação de Realidade</h2>
                </div>
                 <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 min-h-[300px] text-left space-y-4">
                    <div className="bg-gray-800/70 border border-yellow-500/30 p-3 rounded-md text-yellow-200 text-sm">
                        Verificação não executada: este painel não possui executor runtime vinculado. As fases abaixo são apenas o roteiro preservado.
                    </div>
                    
                    <Phase text="Diagnóstico Recebido..." done={phase > 1} isCurrent={phase === 1}>
                        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-red-300 text-sm">
                            <p><strong>FALHA CONFIRMADA:</strong> Arquitetura inoperante. Os módulos não possuíam funcionalidade real e agiam como "enfeites".</p>
                        </div>
                    </Phase>

                    <Phase text="Implementando Núcleo Cognitivo Funcional..." done={phase > 2} isCurrent={phase === 2}>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-md text-yellow-300 text-sm">
                            <p><strong>AÇÃO:</strong> Reescrevendo `geminiService.ts`. Cada módulo implantado agora ativa uma "persona" de IA com diretrizes operacionais específicas.</p>
                        </div>
                    </Phase>

                     <Phase text="Validação e Conclusão..." done={phase > 3} isCurrent={phase === 3}>
                        <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-md text-green-300 text-sm">
                            <p><strong>RESULTADO:</strong> O comportamento da IA agora é diretamente moldado pelos módulos ativos. Arquitetura ficcional desmantelada.</p>
                        </div>
                    </Phase>
                 </div>
             </div>
        </div>
    );
};

export default RealityCheckModal;
