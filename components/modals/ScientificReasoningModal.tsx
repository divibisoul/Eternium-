import React, { useState } from 'react';

export interface ScientificReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze?: (question: string) => Promise<string> | string;
}

export const ScientificReasoningModal: React.FC<ScientificReasoningModalProps> = ({ isOpen, onClose, onAnalyze }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const analyze = async () => {
    if (!onAnalyze || !question.trim()) return;
    setBusy(true);
    try { setAnswer(await onAnalyze(question.trim())); } finally { setBusy(false); }
  };
  return <div role="dialog" aria-modal="true" aria-label="Scientific reasoning" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-950 p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold text-white">Scientific Reasoning</h2><button type="button" onClick={onClose} className="text-gray-400">×</button></div><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} className="w-full rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm text-white" placeholder="Question or hypothesis" /><button type="button" onClick={analyze} disabled={busy || !onAnalyze || !question.trim()} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Analyzing…' : 'Analyze'}</button>{answer && <div className="mt-4 whitespace-pre-wrap rounded-lg border border-gray-800 bg-black p-3 text-sm text-gray-300">{answer}</div>}</div></div>;
};

export default ScientificReasoningModal;
