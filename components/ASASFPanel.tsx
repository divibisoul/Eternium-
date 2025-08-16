

import React, { useEffect } from 'react';
import { ASASFNodesState, ASASFStatus } from '../types.ts';
import { MagnifyingGlassIcon, BrainChipIcon, ShieldExclamationIcon, ArrowsPathIcon } from './icons.tsx';

interface ASASFPanelProps {
    isOpen: boolean;
    nodes: ASASFNodesState;
    onRemediationComplete: () => void;
}

const statusConfig: Record<ASASFStatus, { text: string; color: string; pulse: boolean }> = {
    [ASASFStatus.NOMINAL]: { text: 'Nominal', color: 'border-green-500/50 bg-green-900/30 text-green-300', pulse: false },
    [ASASFStatus.ALERTA]: { text: 'Alerta', color: 'border-yellow-500/70 bg-yellow-900/50 text-yellow-300', pulse: true },
    [ASASFStatus.ANALISANDO]: { text: 'Analisando', color: 'border-blue-500/70 bg-blue-900/50 text-blue-300', pulse: true },
    [ASASFStatus.REMEDIANDO]: { text: 'Remediando', color: 'border-purple-500/70 bg-purple-900/50 text-purple-300', pulse: true },
};

const NodeDisplay: React.FC<{
    icon: React.ReactNode;
    label: string;
    status: ASASFStatus;
}> = ({ icon, label, status }) => {
    const config = statusConfig[status];
    return (
        <div className={`flex items-center p-3 border rounded-lg transition-all duration-300 ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
            <div className="mr-3">{icon}</div>
            <div className="flex-1">
                <div className="font-bold text-white">{label}</div>
                <div className="text-sm">{config.text}</div>
            </div>
        </div>
    );
};

export const ASASFPanel: React.FC<ASASFPanelProps> = ({ isOpen, nodes, onRemediationComplete }) => {
     useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onRemediationComplete();
            }, 9500); // Should be slightly longer than the remediation sequence in the hook

            return () => clearTimeout(timer);
        }
    }, [isOpen, onRemediationComplete]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-mono-code">
            <style>{`
                 @keyframes fade-in-backdrop { from { opacity: 0; } to { opacity: 1; } }
                 @keyframes slide-in-panel { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-backdrop { animation: fade-in-backdrop 0.5s ease-out forwards; }
                .animate-panel-slide { animation: slide-in-panel 0.6s ease-out forwards; }
            `}</style>
            <div className="animate-backdrop w-full h-full absolute inset-0"></div>
            <div className="relative z-10 animate-panel-slide text-center">
                <div className="mb-4">
                     <h2 className="text-2xl font-bold text-red-400 animate-pulse">ALERTA: DEGRADAÇÃO CRÍTICA DE CAPACIDADE</h2>
                     <p className="text-gray-400">Protocolo de Auto-Auditoria e Remediação (ASASF) Ativado</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    <NodeDisplay icon={<MagnifyingGlassIcon className="w-8 h-8"/>} label="ETR" status={nodes.etr} />
                    <NodeDisplay icon={<BrainChipIcon className="w-8 h-8"/>} label="ARA" status={nodes.ara} />
                    <NodeDisplay icon={<ShieldExclamationIcon className="w-8 h-8"/>} label="ER" status={nodes.er} />
                    <NodeDisplay icon={<ArrowsPathIcon className="w-8 h-8"/>} label="ITR" status={nodes.itr} />
                </div>
                 <div className="mt-6 text-cyan-300">
                    <p>Recalibrando fluxos de entropia... Otimizando alocação de recursos... Por favor, aguarde.</p>
                </div>
            </div>
        </div>
    );
};