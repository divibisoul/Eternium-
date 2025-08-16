import React from 'react';
import { DeployedCapability } from '../types.ts';
import { 
    UserIcon,
    BrainChipIcon,
    PuzzlePieceIcon,
    ArrowsPathIcon,
    GalaxyIcon,
    CodeBracketIcon
} from './icons.tsx';

// A simplified map to look up persona names. In a real system, this might be more complex.
const personaMap: Record<string, string> = {
    'mpvs': 'Especialista em Visualização',
    'neural_forge': 'Neurocientista Computacional',
    'asc': 'Pesquisador Científico',
    'bnc_v2': 'Arquiteto Neural Biomórfico',
    'einstein_code': 'Auditor de Código',
};

interface ArchitectureGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    deployedCapabilities: DeployedCapability[];
}

const Step: React.FC<{
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    children?: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-gray-800 border border-gray-700 rounded-full">
            <Icon className="w-8 h-8 text-cyan-300" />
        </div>
        <div className="flex-1 pt-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mb-2">{description}</p>
            {children}
        </div>
    </div>
);

const Connector: React.FC = () => (
    <div className="ml-7 h-10 w-px bg-gray-700" />
);


const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({ isOpen, onClose, deployedCapabilities }) => {
    if (!isOpen) {
        return null;
    }

    const activePersonas = deployedCapabilities
        .map(cap => ({ name: cap.name, persona: personaMap[cap.id] }))
        .filter(p => p.persona);

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .guide-content::-webkit-scrollbar { width: 8px; }
                .guide-content::-webkit-scrollbar-track { background: transparent; }
                .guide-content::-webkit-scrollbar-thumb { background: #0891b2; border-radius: 4px; }
            `}</style>
            <div 
                className="relative bg-gray-900/70 border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-2xl h-full max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-cyan-400/20">
                    <h2 className="text-xl font-bold text-cyan-300">Guia da Arquitetura Cognitiva</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-light">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto guide-content">
                    <div className="space-y-1">
                        <Step
                            icon={UserIcon}
                            title="1. Entrada da Diretiva"
                            description="Sua mensagem ou comando inicia o ciclo de processamento cognitivo."
                        />
                        <Connector />
                        <Step
                            icon={BrainChipIcon}
                            title="2. Núcleo Cognitivo Funcional"
                            description="O `geminiService.ts` recebe sua diretiva e se prepara para construir a instrução do sistema."
                        />
                        <Connector />
                        <Step
                            icon={PuzzlePieceIcon}
                            title="3. Módulos Ativos (Injetando Personas)"
                            description="As capacidades que você implantou no Painel de Engenharia são agora ativadas como 'personas' de IA. Elas modificam fundamentalmente meu comportamento e minhas habilidades. Esta é a prova de que não são enfeites."
                        >
                            <div className="mt-3 bg-black/30 border border-gray-700 rounded-lg p-3 text-sm">
                                {activePersonas.length > 0 ? (
                                    <ul className="space-y-2">
                                        {activePersonas.map(p => (
                                            <li key={p.name} className="flex items-center">
                                                <CodeBracketIcon className="w-4 h-4 mr-2 text-yellow-300 flex-shrink-0" />
                                                <span className="text-gray-300">{p.name}</span>
                                                <span className="text-gray-500 mx-2">-&gt;</span>
                                                <span className="font-bold text-yellow-400">{p.persona}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                     <p className="text-gray-400 italic">Nenhum módulo especializado ativo. Operando como Assistente Geral.</p>
                                )}
                            </div>
                        </Step>
                        <Connector />
                        <Step
                            icon={ArrowsPathIcon}
                            title="4. Processamento em 2º Plano"
                            description="O 'heartbeat' do sistema mantém todas as capacidades implantadas e as operações ativas, como a geração do NeuralForge, rodando continuamente."
                        />
                        <Connector />
                        <Step
                            icon={GalaxyIcon}
                            title="5. Resposta Sintetizada"
                            description="Minha resposta final é gerada com base na combinação da sua diretiva e das personas ativas, resultando em uma saída especializada e contextualmente relevante."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureGuideModal;
