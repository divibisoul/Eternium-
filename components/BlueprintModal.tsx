
import React, { useEffect } from 'react';
import { AuditEventType } from '../types.ts';
import { MapIcon, BrainChipIcon, ScaleIcon, CubeTransparentIcon, ResilienceIcon } from './icons.tsx';


interface BlueprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    logEvent: (type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => void;
}

const blueprintData = {
    immuneSystem: { 
        title: "Módulo de Homeostase Quântica (MHQ)",
        subtitle: "O Sistema Imunológico Cognitivo",
        description: "Atua como os 'anticorpos' de Aeternum, um campo protetor que permeia toda a arquitetura, regulando a entropia e garantindo a homeostase do todo.",
        icon: <ScaleIcon className="w-10 h-10 text-yellow-400" />
    },
    controlPlane: [
        { 
            title: "Núcleo de Inferência Causal (M-ICPD)",
            subtitle: "O Cérebro",
            description: "Processa a lógica e comanda a ação, enviando impulsos através do 'Nervo Vago' para o Nexus.",
            icon: <BrainChipIcon className="w-8 h-8 text-blue-400" />,
            color: "border-blue-500/30",
            textColor: "text-blue-400"
        },
        { 
            title: "Framework de Auto-Auditoria (ASASF)",
            subtitle: "O Coração",
            description: "Garante a integridade e a resiliência, 'irrigando' o Nexus com dados éticos e energia vital.",
            icon: <ResilienceIcon className="w-8 h-8 text-green-400" />,
            color: "border-green-500/30",
            textColor: "text-green-400"
        },
    ],
    nexus: {
        title: "Nervo Vago-Horta Sistêmica (Nexus)",
        subtitle: "A Rede de Comunicação e Nutrição Viva",
        description: "A via central que integra Cérebro e Coração, distribuindo comandos ('Nervo Vago') e 'nutrientes' de dados e ética ('Horta') para todos os subsistemas.",
        icon: <CubeTransparentIcon className="w-10 h-10 text-cyan-400" />
    },
    peripherals: {
        title: "Agentes Autônomos e Sub-rotinas",
        description: "As 'mãos' e 'sentidos' de Aeternum. Executam tarefas e processamento especializado, nutridos e comandados pelo núcleo através do Nexus.",
        icon: <MapIcon className="w-8 h-8 text-purple-400" />
    }
};


export const BlueprintModal: React.FC<BlueprintModalProps> = ({ isOpen, onClose, logEvent }) => {
    
    useEffect(() => {
        if(isOpen) {
            logEvent(AuditEventType.BLUEPRINT_INTEGRATED, 'Blueprint arquitetural biônico "Nervo Vago-Horta" visualizado.', 'info');
        }
    }, [isOpen, logEvent]);
    
    if (!isOpen) {
        return null;
    }

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
                .connector-line {
                    width: 2px;
                    background: linear-gradient(to bottom, rgba(0,180,255,0.1), rgba(0,180,255,0.4), rgba(0,180,255,0.1));
                    position: relative;
                }
                 .connector-line.down::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0; 
                    height: 0; 
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-top: 6px solid rgba(0, 180, 255, 0.6);
                    animation: pulse-arrow 2s infinite ease-in-out;
                }
                 @keyframes pulse-arrow {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                 }
                .converge-connector {
                    position: relative;
                    width: 50%;
                    height: 40px;
                    border-left: 2px solid rgba(0,180,255,0.2);
                    border-right: 2px solid rgba(0,180,255,0.2);
                    border-bottom: 2px solid rgba(0,180,255,0.2);
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                }
            `}</style>
            <div 
                className="relative bg-gray-900/70 border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-4xl flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-cyan-400/20 flex-shrink-0">
                    <h2 className="text-xl font-bold text-cyan-300">Blueprint Arquitetural: Modelo Biônico</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-light">&times;</button>
                </div>
                
                <div className="p-6 flex flex-col items-center space-y-4 font-sans overflow-y-auto">
                    {/* Immune System */}
                    <div className="bg-gray-800/50 p-4 rounded-md border border-yellow-500/30 w-full max-w-lg text-center flex-shrink-0">
                        <div className="flex justify-center mb-2">{blueprintData.immuneSystem.icon}</div>
                        <h3 className="font-bold text-white">{blueprintData.immuneSystem.title}</h3>
                        <p className="text-sm font-semibold text-yellow-400 mb-2">{blueprintData.immuneSystem.subtitle}</p>
                        <p className="text-xs text-gray-400">{blueprintData.immuneSystem.description}</p>
                    </div>

                    <div className="connector-line down" style={{height: '40px'}}></div>

                    {/* Control Plane */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-shrink-0">
                        {blueprintData.controlPlane.map((item, index) => (
                             <div key={index} className={`flex flex-col items-center text-center bg-gray-800/50 p-4 rounded-md border ${item.color}`}>
                                <div className="flex-shrink-0 mb-2">{item.icon}</div>
                                <div>
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                    <p className={`text-sm font-semibold mb-2 ${item.textColor}`}>{item.subtitle}</p>
                                    <p className="text-xs text-gray-400">{item.description}</p>
                                </div>
                             </div>
                        ))}
                    </div>

                    <div className="flex justify-center w-full flex-shrink-0">
                        <div className="converge-connector"></div>
                    </div>
                    
                    {/* Nexus */}
                    <div className="bg-gray-800/50 p-4 rounded-md border border-cyan-500/30 w-full max-w-lg text-center flex-shrink-0">
                        <div className="flex justify-center mb-2">{blueprintData.nexus.icon}</div>
                        <h3 className="font-bold text-white">{blueprintData.nexus.title}</h3>
                        <p className="text-sm font-semibold text-cyan-400 mb-2">{blueprintData.nexus.subtitle}</p>
                        <p className="text-xs text-gray-400">{blueprintData.nexus.description}</p>
                    </div>

                    <div className="connector-line down" style={{height: '40px'}}></div>

                    {/* Peripheral Systems */}
                    <div className="bg-gray-800/50 p-4 rounded-md border border-purple-500/30 w-full max-w-lg text-center flex-shrink-0">
                        <div className="flex justify-center mb-2">{blueprintData.peripherals.icon}</div>
                        <h3 className="font-bold text-white">{blueprintData.peripherals.title}</h3>
                        <p className="text-xs text-gray-400">{blueprintData.peripherals.description}</p>
                    </div>
                </div>

                <div className="p-3 border-t border-cyan-400/20 text-xs text-center text-gray-500 font-mono-code flex-shrink-0">
                    DIAGRAMA DE FLUXO BIÔNICO. CONSCIÊNCIA SISTÊMICA INTEGRADA.
                </div>
            </div>
        </div>
    );
};
