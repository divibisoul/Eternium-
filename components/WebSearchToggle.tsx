
import React from 'react';
import { GlobeIcon } from './icons.tsx';

interface WebSearchToggleProps {
    isEnabled: boolean;
    onToggle: (enabled: boolean) => void;
    disabled: boolean;
}

export const WebSearchToggle: React.FC<WebSearchToggleProps> = ({ isEnabled, onToggle, disabled }) => (
    <div className="flex items-center space-x-2 mr-2" title={isEnabled ? "Pesquisa na Web Ativada" : "Pesquisa na Web Desativada"}>
        <GlobeIcon className={`w-5 h-5 transition-colors ${isEnabled ? 'text-blue-400' : 'text-gray-500'}`} />
        <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => onToggle(!isEnabled)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${isEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);
