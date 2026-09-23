import React from "react";

export interface SystemPanelUIProps {
  activeMode: string | null;
  activeModules: readonly string[];
  systemHealth: number | null;
  onModeChange?: (mode: string) => void;
  onModuleToggle?: (moduleId: string) => void;
}

const MODES = ["HARMONY", "ANALYSIS", "ABSTRACT", "SYNTHESIS"] as const;

export const SystemPanelUI: React.FC<SystemPanelUIProps> = ({
  activeMode, activeModules, systemHealth, onModeChange, onModuleToggle,
}) => (
  <aside className="h-full w-full bg-black/50 backdrop-blur-lg flex flex-col overflow-hidden">
    <header className="p-4 border-b border-white/10">
      <h1 className="text-lg font-black text-cyan-400 tracking-tighter">AETERNUM</h1>
      <p className="text-xs text-gray-400">System Panel • observed state</p>
    </header>
    <section className="p-4 border-b border-white/10">
      <div className="flex justify-between mb-2 text-xs">
        <span className="text-gray-400">Saúde observada</span>
        <span className="text-cyan-300">{systemHealth == null ? "Não observado" : systemHealth + "%"}</span>
      </div>
      {systemHealth != null && <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-cyan-500" style={{ width: systemHealth + "%" }} /></div>}
    </section>
    <section className="p-4 border-b border-white/10">
      <h2 className="text-xs font-bold text-gray-300 mb-3 uppercase">Modos</h2>
      <div className="space-y-1.5">{MODES.map(mode => (
        <button key={mode} onClick={() => onModeChange?.(mode)} className="w-full text-left px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-gray-300">
          {mode}{activeMode === mode ? " • ATIVO" : ""}
        </button>
      ))}</div>
    </section>
    <section className="flex-1 overflow-y-auto p-4">
      <h2 className="text-xs font-bold text-gray-300 mb-3 uppercase">Módulos ativos</h2>
      <div className="space-y-1">{activeModules.map(id => (
        <button key={id} onClick={() => onModuleToggle?.(id)} className="w-full text-left px-3 py-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">{id}</button>
      ))}</div>
    </section>
  </aside>
);
