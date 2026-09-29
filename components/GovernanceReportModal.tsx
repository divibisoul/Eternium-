import React from 'react';
import { ScaleIcon, ShieldCheckIcon } from './icons.tsx';

interface GovernanceReport {
    invariants?: { passed: number; total: number };
    biasSensitivity?: number;
    violations?: number;
    complianceStatus?: string;
    evidence?: string;
    entropySignature?: string;
}

interface GovernanceReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report?: GovernanceReport | null;
}

const StatCard: React.FC<{ title: string; value: string; status?: 'observed' | 'unknown'; }> = ({ title, value, status = 'unknown' }) => (
    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${status === 'observed' ? 'text-green-400' : 'text-gray-400'}`}>{value}</p>
    </div>
);

export const GovernanceReportModal: React.FC<GovernanceReportModalProps> = ({ isOpen, onClose, report = null }) => {
    if (!isOpen) return null;

    const invariants = report?.invariants
        ? report.invariants.passed + ' / ' + report.invariants.total
        : 'N/O';
    const bias = typeof report?.biasSensitivity === 'number'
        ? 'Δ > ' + report.biasSensitivity.toFixed(2)
        : 'N/O';
    const violations = typeof report?.violations === 'number'
        ? String(report.violations)
        : 'N/O';
    const compliance = report?.complianceStatus ?? 'Não observado';
    const evidence = report?.evidence ?? 'Nenhuma evidência de governança foi fornecida ao componente.';
    const entropy = report?.entropySignature ?? 'N/O';

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <style>{`
                @keyframes fade-in-gov {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fade-in { animation: fade-in-gov 0.3s ease-out forwards; }
            `}</style>
            <div
                className="relative bg-gray-900/70 border border-teal-400/30 rounded-lg shadow-2xl shadow-teal-500/10 w-full max-w-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-teal-400/20">
                    <div className="flex items-center space-x-3">
                        <ScaleIcon className="w-6 h-6 text-teal-300"/>
                        <h2 className="text-xl font-bold text-teal-300">Relatório de Governança Ética</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-light">&times;</button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Invariantes Éticos" value={invariants} status={report?.invariants ? 'observed' : 'unknown'} />
                        <StatCard title="Sensibilidade de Viés" value={bias} status={typeof report?.biasSensitivity === 'number' ? 'observed' : 'unknown'} />
                        <StatCard title="Violações (Nível Γ)" value={violations} status={typeof report?.violations === 'number' ? 'observed' : 'unknown'} />
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50">
                        <h3 className="font-semibold text-white mb-2 flex items-center">
                            <ShieldCheckIcon className="w-5 h-5 mr-2 text-teal-400"/> Status de Conformidade
                        </h3>
                        <p className="text-lg text-gray-300">{compliance}</p>
                        <p className="text-xs text-gray-500 mt-2">{evidence}</p>
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50 font-mono-code text-sm">
                        <p className="text-gray-400 mb-1">Assinatura de Auditoria:</p>
                        <p className="text-teal-300 break-all">{entropy}</p>
                    </div>
                </div>

                <div className="p-3 border-t border-teal-400/20 text-xs text-center text-gray-500 font-mono-code">
                    RELATÓRIO EXIBIDO: {new Date().toISOString()}
                </div>
            </div>
        </div>
    );
};
