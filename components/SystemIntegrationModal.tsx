import React from 'react';
import { DeployedCapability } from '../types.ts';

export interface SystemIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilities?: DeployedCapability[];
}

export const SystemIntegrationModal: React.FC<SystemIntegrationModalProps> = ({ isOpen, onClose, capabilities = [] }) => {
  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="System integration" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-950 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold text-white">System Integration</h2><button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white">×</button></div>
        <p className="mb-4 text-sm text-gray-400">Current deployed capability registry.</p>
        <div className="max-h-80 space-y-2 overflow-y-auto">{capabilities.map((capability) => <div key={capability.id} className="flex items-center justify-between rounded-lg border border-gray-800 p-3"><span className="text-sm text-gray-200">{capability.name}</span><span className="text-xs text-gray-500">{capability.status}</span></div>)}</div>
      </div>
    </div>
  );
};

export default SystemIntegrationModal;
