import React from 'react';
import { AgiCoreModule } from '../../types.ts';

export interface QuantumCoreModalProps { isOpen: boolean; onClose: () => void; modules?: AgiCoreModule[]; }

export const QuantumCoreModal: React.FC<QuantumCoreModalProps> = ({ isOpen, onClose, modules = [] }) => {
  if (!isOpen) return null;
  return <div role="dialog" aria-modal="true" aria-label="Quantum core" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-xl rounded-xl border border-gray-700 bg-gray-950 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold text-white">Quantum Core</h2><button type="button" onClick={onClose} className="text-gray-400">×</button></div><div className="space-y-2">{modules.map((module) => <div key={module.id} className="flex justify-between rounded-lg border border-gray-800 p-3 text-sm"><span className="text-gray-200">{module.name}</span><span className="text-gray-500">{module.status}</span></div>)}</div></div></div>;
};

export default QuantumCoreModal;
