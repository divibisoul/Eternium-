import React, { useState } from 'react';
import { DeployedCapability } from '../../types.ts';

export interface CodeGenesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt?: string;
  capabilities?: DeployedCapability[];
  onGenerate?: (prompt: string) => Promise<string> | string;
}

export const CodeGenesisModal: React.FC<CodeGenesisModalProps> = ({ isOpen, onClose, prompt = '', capabilities = [], onGenerate }) => {
  const [value, setValue] = useState(prompt);
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const generate = async () => {
    if (!value.trim() || !onGenerate) return;
    setBusy(true);
    try { setResult(await onGenerate(value.trim())); } finally { setBusy(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="Code genesis" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-950 p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold text-white">Code Genesis</h2><button type="button" onClick={onClose} className="text-gray-400">×</button></div>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} rows={4} className="w-full rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm text-white outline-none" placeholder="Describe the code to generate..." />
        <button type="button" onClick={generate} disabled={busy || !onGenerate || !value.trim()} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Generating…' : 'Generate'}</button>
        {capabilities.length > 0 && <p className="mt-3 text-xs text-gray-500">Capabilities available: {capabilities.filter((capability) => capability.status !== undefined).length}</p>}
        {result && <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-gray-800 bg-black p-3 text-xs text-gray-300">{result}</pre>}
      </div>
    </div>
  );
};

export default CodeGenesisModal;
