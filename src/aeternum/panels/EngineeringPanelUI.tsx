import React from "react";

export interface EngineeringCapabilityView { id: string; name: string; executable: boolean; }
export interface EngineeringOperationView { id: string; name: string; progressPercent: number | null; }

export interface EngineeringPanelUIProps {
  capabilities: readonly EngineeringCapabilityView[];
  operations: readonly EngineeringOperationView[];
  onCapabilityRequest?: (id: string) => void;
}

export const EngineeringPanelUI: React.FC<EngineeringPanelUIProps> = ({ capabilities, operations, onCapabilityRequest }) => (
  <aside className="h-full w-full bg-black/50 backdrop-blur-lg flex flex-col overflow-hidden">
    <header className="p-4 border-b border-white/10">
      <h2 className="text-sm font-bold text-orange-400">ENGENHARIA</h2>
      <p className="text-xs text-gray-400 mt-1">{capabilities.length} capacidades • {operations.length} operações observadas</p>
    </header>
    <section className="p-4 border-b border-white/10">
      <h3 className="text-xs font-bold text-gray-300 mb-2">Operações</h3>
      {operations.length === 0 ? <p className="text-xs text-gray-500">Nenhuma operação observada.</p> : operations.map(op => (
        <div key={op.id} className="p-2 bg-orange-500/10 rounded border border-orange-500/20 mb-2">
          <div className="text-xs text-orange-300">{op.name}</div>
          <div className="text-xs text-gray-500">{op.progressPercent == null ? "Progresso não observado" : op.progressPercent + "%"}</div>
        </div>
      ))}
    </section>
    <section className="flex-1 overflow-y-auto p-4">
      <h3 className="text-xs font-bold text-gray-300 mb-3">Capacidades</h3>
      {capabilities.map(cap => (
        <div key={cap.id} className="p-2 bg-white/5 rounded border border-white/10 text-xs flex justify-between mb-2">
          <span>{cap.name}</span>
          <button disabled={!cap.executable} onClick={() => onCapabilityRequest?.(cap.id)} className="text-orange-300 disabled:text-gray-600">Executar</button>
        </div>
      ))}
    </section>
  </aside>
);
