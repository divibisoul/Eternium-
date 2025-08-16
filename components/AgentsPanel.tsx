
import React from 'react';
import { agents } from '../data/agents.ts';
import { AgentCard } from './AgentCard.tsx';
import { XMarkIcon } from './icons.tsx';

interface AgentsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AgentsPanel: React.FC<AgentsPanelProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in" 
            onClick={onClose}
        >
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/80 border border-purple-500/30 rounded-lg shadow-2xl shadow-purple-500/10 w-full max-w-md flex flex-col p-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-purple-300">Painel de Agentes Externos</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-3">
                    {agents.map(agent => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            </div>
        </div>
    );
};
