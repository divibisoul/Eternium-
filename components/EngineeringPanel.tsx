import React from 'react';
import { ActiveOperation, DeployedCapability, AgiCoreModule, OperationStatus } from '../types.ts';

export interface EngineeringPanelProps {
  operations?: ActiveOperation[];
  capabilities?: DeployedCapability[];
  modules?: AgiCoreModule[];
  isOpen?: boolean;
  onClose?: () => void;
}

export const EngineeringPanel: React.FC<EngineeringPanelProps> = ({ operations = [], capabilities = [], modules = [], isOpen = true, onClose }) => {
  if (!isOpen) return null;
  const active = operations.filter((operation) => operation.status === OperationStatus.IN_PROGRESS);
  return (
    <aside aria-label="Engineering panel" className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-gray-700 bg-gray-950/95 p-4 shadow-2xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Engineering</h2>
        {onClose && <button type="button" onClick={onClose} aria-label="Close engineering panel" className="text-gray-400 hover:text-white">×</button>}
      </div>
      <section className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Active operations</h3>
        {active.length === 0 ? <p className="text-sm text-gray-500">No active operations.</p> : active.map((operation) => (
          <div key={operation.id} className="mb-2 rounded-lg border border-gray-800 bg-gray-900 p-3">
            <div className="flex justify-between gap-3 text-sm text-gray-200"><span>{operation.type}</span><span>{operation.progress}/{operation.totalSteps}</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded bg-gray-800"><div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, Math.round(operation.progress / Math.max(1, operation.totalSteps) * 100))}%` }} /></div>
          </div>
        ))}
      </section>
      <section className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Capabilities</h3>
        <div className="grid grid-cols-2 gap-2">{capabilities.map((capability) => <div key={capability.id} className="rounded-lg border border-gray-800 p-2 text-xs text-gray-300"><div className="font-medium text-white">{capability.name}</div><div>{capability.status} · {Math.round(capability.metric)}</div></div>)}</div>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Core modules</h3>
        <div className="space-y-2">{modules.map((module) => <div key={module.id} className="flex items-center justify-between rounded-lg border border-gray-800 p-2 text-sm"><span className="text-gray-300">{module.name}</span><span className="text-gray-500">{module.status}</span></div>)}</div>
      </section>
    </aside>
  );
};

export default EngineeringPanel;
