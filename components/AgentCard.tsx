

import React from 'react';
import { Agent, AgentStatus } from '../types.ts';

const statusConfig: Record<AgentStatus, { color: string; text: string }> = {
    [AgentStatus.Online]: { color: 'bg-green-500', text: 'Online' },
    [AgentStatus.Standby]: { color: 'bg-yellow-500', text: 'Em Espera' },
    [AgentStatus.Analisando]: { color: 'bg-blue-500', text: 'Analisando' },
    [AgentStatus.Executando]: { color: 'bg-purple-500', text: 'Executando' },
};

export const AgentCard: React.FC<{
    agent: Agent;
}> = ({ agent }) => {
    const status = agent.initialStatus;

    return (
        <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-3">
                <agent.icon className="w-7 h-7 text-cyan-400 flex-shrink-0" />
                <div className="flex-1">
                    <h5 className="font-bold text-white">{agent.name}</h5>
                    <p className="text-xs text-gray-400">{agent.description}</p>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                    <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}></span>
                    <span>{statusConfig[status].text}</span>
                </div>
            </div>
        </div>
    );
};
