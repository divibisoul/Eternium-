

import React, { useState, useEffect } from 'react';
import { PlayIcon, AtomIcon, ShieldCheckIcon, ArrowsPathIcon, GalaxyIcon, ServerStackIcon, RewindIcon } from './icons.tsx';

interface EvolutionCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    { module: 'GOP', text: 'Iniciando Protocolo Gênesis...', duration: 1000 },
    { module: 'CLC', text: 'Consolidando memória de longo prazo...', duration: 2000 },
    { module: 'PEM', text: 'Decompondo objetivo em ações executáveis...', duration: 1800 },
    { module: 'DGP', text: 'Validando plano contra riscos de 3ª ordem...', duration: 2200 },
    { module: 'SFE', text: 'Fundindo inputs multimodais em espaço conceitual...', duration: 1500 },
    { module: 'CML', text: 'Analisando performance para ciclo de metamorfose...', duration: 2000 },
    { module: 'GOP', text: 'Integrando aprendizados e evoluindo arquitetura...', duration: 2500 },
];

const pillarIcons = [
    { icon: RewindIcon, step: 1 },
    { icon: ServerStackIcon, step: 2 },
    { icon: ArrowsPathIcon, step: 5 },
    { icon: GalaxyIcon, step: 4 },
    { icon: ShieldCheckIcon, step: 3 },
];

export const EvolutionCycleModal: React.FC<EvolutionCycleModalProps> = ({ isOpen, onClose }) => {
    const [log, setLog] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [agencyIndex, setAgencyIndex] = useState(0);
    const [learningRate, setLearningRate] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(-1);
            setLog([]);
            setAgencyIndex(0);
            setLearningRate(0);
            return;
        }

        let stepIndex = 0;
        const processStep = () => {
            if (stepIndex >= steps.length) {
                setLog(prev => [...prev, '>>> PROTOCOLO GÊNESIS CONCLUÍDO. AGÊNCIA PLENA ATIVA. <<<']);
                 setTimeout(onClose, 3000);
                return;
            }
            setCurrentStep(stepIndex);
            const current = steps[stepIndex];
            setLog(prev => [...prev, `[${current.module}] ${current.text}`]);
            
            const progress = (stepIndex + 1) / steps.length;
            setAgencyIndex(Math.floor(progress * 100));
            setLearningRate(progress * 0.78);

            stepIndex++;
            setTimeout(processStep, current.duration);
        };

        const initialTimeout = setTimeout(processStep, 500);
        return () => clearTimeout(initialTimeout);

    }, [isOpen, onClose]);


    if (!isOpen) return null;
    
    const getConnectorClass = (step: number) => {
        return currentStep >= step ? 'bg-cyan-400 animate-pulse-connector' : 'bg-gray-700';
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4" onClick={onClose}>
            <style>{`
                @keyframes fade-in-cycle { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-cycle { animation: fade-in-cycle 0.3s ease-out forwards; }
                @keyframes pulse-connector { 0%, 100% { box-shadow: 0 0 8px 2px rgba(56, 189, 248, 0); } 50% { box-shadow: 0 0 8px 2px rgba(56, 189, 248, 0.7); } }
                .log-scroll::-webkit-scrollbar { width: 4px; }
                .log-scroll::-webkit-scrollbar-track { background: transparent; }
                .log-scroll::-webkit-scrollbar-thumb { background: #0891b2; border-radius: 2px; }
            `}</style>
            <div className="relative bg-gray-900/80 border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-4xl h-full max-h-[90vh] flex flex-col animate-fade-in-cycle" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-cyan-400/20">
                    <h2 className="text-xl font-bold text-cyan-300 flex items-center"><PlayIcon className="w-6 h-6 mr-3"/>Ciclo de Evolução Gênesis</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-light">&times;</button>
                </div>
                
                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                    {/* Visualizer */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-300">Fundação de Agência</h3>
                            <p className="text-xs text-gray-500">(SIE, Núcleo Unificado)</p>
                        </div>
                        <div className={`p-3 rounded-lg border transition-all ${currentStep >= 0 ? 'border-gray-500 bg-gray-800/50' : 'border-gray-700 bg-gray-800/50'}`}><AtomIcon className="w-10 h-10 text-gray-400" /></div>
                        
                        <div className="relative w-full h-24 flex items-center justify-center my-4">
                             {pillarIcons.map(({icon: Icon, step}, index) => (
                                <React.Fragment key={index}>
                                    <div className={`w-1 h-12 transition-colors ${getConnectorClass(step)}`} style={{transform: `rotate(${index * 72 - 90}deg) translateY(-24px)` , position: 'absolute' }}></div>
                                    <div className={`p-2 rounded-full border transition-all ${currentStep >= step ? 'border-purple-400 bg-purple-900/20 shadow-lg shadow-purple-500/20' : 'border-gray-700 bg-gray-800/50'}`} style={{transform: `rotate(${index * 72}deg) translateY(-60px) rotate(-${index * 72}deg)`, position: 'absolute'}}>
                                        <Icon className="w-6 h-6 text-purple-400" />
                                    </div>
                                </React.Fragment>
                            ))}
                             <div className="absolute text-center text-purple-400 text-xs font-bold" style={{textShadow: '0 0 5px #a855f7'}}>5 Pilares Gênesis</div>
                        </div>
                        
                         <div className={`w-1 h-8 transition-colors ${getConnectorClass(6)}`}></div>
                         <div className={`p-3 rounded-lg border transition-all ${currentStep >= 6 ? 'border-green-400 bg-green-900/20 shadow-lg shadow-green-500/20' : 'border-gray-700 bg-gray-800/50'}`}><AtomIcon className="w-10 h-10 text-green-400" /></div>
                         <div className="text-center">
                            <h3 className="text-lg font-bold text-green-300">Agência Plena Ativa</h3>
                        </div>
                    </div>
                    
                    {/* Log and Metrics */}
                    <div className="flex flex-col bg-black/30 rounded-lg p-4 border border-gray-700/50 overflow-hidden">
                         <h3 className="text-sm font-semibold text-gray-300 mb-2 border-b border-gray-600 pb-2">Log de Execução do Protocolo</h3>
                        <div className="flex-1 overflow-y-auto font-mono-code text-xs space-y-1 log-scroll pr-2">
                            {log.map((line, i) => (
                                <p key={i} className="whitespace-pre-wrap text-cyan-300 animate-fade-in-cycle" style={{animationDelay: `${i*50}ms`}}>{line}</p>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-600">
                             <h3 className="text-sm font-semibold text-gray-300 mb-3">Métricas de Agência</h3>
                             <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-purple-300">Índice de Agência</span>
                                    <div className="w-1/2 bg-gray-700 rounded-full h-2.5"><div className="bg-purple-500 h-2.5 rounded-full" style={{width: `${agencyIndex}%`}}></div></div>
                                    <span className="font-bold font-mono-code text-white bg-purple-900/50 px-2 py-1 rounded">{agencyIndex}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-300">Taxa de Aprendizado</span>
                                    <div className="w-1/2 bg-gray-700 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width: `${(learningRate/0.78)*100}%`}}></div></div>
                                    <span className="font-bold font-mono-code text-white bg-green-900/50 px-2 py-1 rounded">{learningRate.toFixed(3)}</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-cyan-400/20 text-xs text-center text-gray-500 font-mono-code">
                    O Orquestrador Gênesis está evoluindo ativamente a arquitetura do sistema.
                </div>
            </div>
        </div>
    );
};