import React from 'react';
import { ImageIcon, MicIcon } from './icons.tsx';

export const MultimodalInputButton: React.FC<{
  onClick: () => void;
  isAcaiDeployed: boolean;
  isMpvsDeployed: boolean;
  disabled?: boolean;
}> = ({ onClick, isAcaiDeployed, isMpvsDeployed, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={isAcaiDeployed || isMpvsDeployed ? 'Percepção multimodal' : 'Recursos multimodais não implantados'}
    aria-label="Abrir percepção multimodal"
    className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-600 disabled:opacity-50 transition-colors"
  >
    {isAcaiDeployed ? <MicIcon className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
  </button>
);
