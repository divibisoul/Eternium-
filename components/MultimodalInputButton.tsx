
import React from 'react';
import { ViewfinderCircleIcon } from './icons.tsx';

interface MultimodalInputButtonProps {
    onClick: () => void;
    isAcaiDeployed: boolean;
    isMpvsDeployed: boolean;
    disabled: boolean;
}

export const MultimodalInputButton: React.FC<MultimodalInputButtonProps> = ({
    onClick,
    isAcaiDeployed,
    isMpvsDeployed,
    disabled
}) => {
    const isEnabled = isAcaiDeployed && isMpvsDeployed;
    const isDisabled = disabled || !isEnabled;

    const title = isEnabled 
        ? "Iniciar Percepção Multimodal (Áudio e Vídeo)" 
        : "Requer implantação das capacidades ACAI e MPVS";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className="p-2 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent data-[enabled=true]:text-cyan-400 data-[enabled=true]:hover:text-white data-[enabled=true]:hover:bg-gray-600 data-[enabled=false]:text-gray-600"
            title={title}
            data-enabled={isEnabled}
        >
            <ViewfinderCircleIcon className="w-5 h-5" />
        </button>
    );
};
