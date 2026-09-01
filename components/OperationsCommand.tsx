import React from 'react';
import { OperationType } from '../types.ts';

export interface OperationsCommandProps {
  onInitiateOperation?: (type: OperationType, totalSteps: number, message: string) => void;
}

const COMMANDS: Array<{ type: OperationType; totalSteps: number; label: string; message: string }> = [
  { type: OperationType.SCRE, totalSteps: 5, label: 'S.C.R.E.', message: 'S.C.R.E. ativado: otimizando núcleo.' },
  { type: OperationType.ECAS, totalSteps: 8, label: 'E.C.A.S.', message: 'E.C.A.S. ativado: sintetizando arquitetura.' },
  { type: OperationType.CSAE, totalSteps: 6, label: 'CSAE', message: 'CSAE ativado: reconfigurando pipeline.' },
  { type: OperationType.ASC, totalSteps: 7, label: 'ASC', message: 'ASC ativado: buscando novos insights.' },
  { type: OperationType.NEURAL_FORGE, totalSteps: 10, label: 'Neural Forge', message: 'Neural Forge ativado: geração de rede neural.' },
  { type: OperationType.PAL_CORE_AUDIT, totalSteps: 4, label: 'PAL-Core Audit', message: 'Auditoria do PAL-Core iniciada.' },
  { type: OperationType.ALGORITHMIC_CORRECTION, totalSteps: 12, label: 'Auto-Correction', message: 'Ciclo de auto-correção iniciado.' },
];

export const OperationsCommand: React.FC<OperationsCommandProps> = ({ onInitiateOperation }) => (
  <section aria-label="Operations command" className="rounded-xl border border-gray-800 bg-gray-950 p-4">
    <h2 className="mb-3 text-sm font-semibold text-white">Operations Command</h2>
    <div className="grid grid-cols-2 gap-2">{COMMANDS.map((command) => (
      <button key={command.type} type="button" onClick={() => onInitiateOperation?.(command.type, command.totalSteps, command.message)} className="rounded-lg border border-gray-800 bg-gray-900 p-2 text-left text-xs text-gray-300 transition hover:border-gray-600 hover:text-white">
        {command.label}
      </button>
    ))}</div>
  </section>
);

export default OperationsCommand;
