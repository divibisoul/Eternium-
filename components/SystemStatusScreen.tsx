import React from 'react';
import { SystemStatus } from '../types.ts';
import { AtomIcon, ShieldExclamationIcon } from './icons.tsx';

interface SystemStatusScreenProps {
  status: SystemStatus;
}

export const SystemStatusScreen: React.FC<SystemStatusScreenProps> = ({ status }) => {
  const content = {
    [SystemStatus.BOOTING]: {
      icon: <AtomIcon className="w-24 h-24 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />,
      title: "Inicializando Sistema AGI",
      message: "Por favor, aguarde. Calibrando núcleo cognitivo...",
      color: "text-cyan-300",
    },
    [SystemStatus.FAILED]: {
      icon: <ShieldExclamationIcon className="w-24 h-24 text-red-500" />,
      title: "FALHA CRÍTICA NA INICIALIZAÇÃO",
      message: "Não foi possível estabelecer conexão com o núcleo. Verifique os logs.",
      color: "text-red-400",
    },
     [SystemStatus.ONLINE]: { // Should not be rendered, but here for completeness
      icon: <></>,
      title: "",
      message: "",
      color: "",
    },
  };
  
  const currentContent = content[status];

  return (
    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      {currentContent.icon}
      <h1 className={`mt-6 text-3xl font-bold ${currentContent.color}`}>{currentContent.title}</h1>
      <p className="mt-2 text-gray-400">{currentContent.message}</p>
    </div>
  );
};