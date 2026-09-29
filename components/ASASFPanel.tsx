

import React from 'react';
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
    [ASASFStatus.NAO_OBSERVADO]: { text: 'Não observado', color: 'border-gray-600 bg-gray-900/40 text-gray-400', pulse: false },
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
    if (!isOpen) {
        return null;
    }

    const hasRemediationEvidence = Object.values(nodes).some(
        status => status === ASASFStatus.REMEDIANDO,
    );
    const canMarkLocalErrorResolved = !hasRemediationEvidence;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-mono-code">
            <div className="relative z-10 w-full max-w-4xl text-center">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-red-400">ALERTA: degradação crítica observada</h2>
                    <p className="text-gray-400">ASASF aguarda um executor SARA real; esta interface não simula remediação.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    <NodeDisplay icon={<MagnifyingGlassIcon className="w-8 h-8"/>} label="ETR" status={nodes.etr} />
                    <NodeDisplay icon={<BrainChipIcon className="w-8 h-8"/>} label="ARA" status={nodes.ara} />
                    <NodeDisplay icon={<ShieldExclamationIcon className="w-8 h-8"/>} label="ER" status={nodes.er} />
                    <NodeDisplay icon={<ArrowsPathIcon className="w-8 h-8"/>} label="ITR" status={nodes.itr} />
                </div>

                <div className="mt-6 text-gray-300">
                    <p>Estado: observação local registrada. Nenhuma conclusão de remediação é inferida pelo tempo.</p>
                </div>

                {canMarkLocalErrorResolved && (
                    <button
                        type="button"
                        onClick={onRemediationComplete}
                        className="mt-6 px-4 py-2 rounded border border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30"
                    >
                        Marcar erro local como resolvido
                    </button>
                )}
            </div>
        </div>
    );
};
