
import React from 'react';
import { WrenchScrewdriverIcon } from './icons.tsx';

interface ExpertModeToggleProps {
    isExpertMode: boolean;
    onToggle: () => void;
}

export const ExpertModeToggle: React.FC<ExpertModeToggleProps> = ({ isExpertMode, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-medium"
            title={isExpertMode ? "Desativar Modo Especialista" : "Ativar Modo Especialista"}
        >
            <WrenchScrewdriverIcon className={`w-4 h-4 transition-colors ${isExpertMode ? 'text-yellow-400' : 'text-gray-500'}`} />
            <span className={`text-xs ${isExpertMode ? 'text-yellow-400 font-semibold' : ''}`}>Especialista</span>
        </button>
    );
};
