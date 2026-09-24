import React from 'react';
import { ScaleIcon, CheckIcon, ShieldCheckIcon } from './icons.tsx';

export interface GovernanceReportData {
    invariants?: { passed: number; total: number };
    biasSensitivity?: number;
    violations?: number;
    compliance?: string;
    entropySignature?: string;
}

interface GovernanceReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report?: GovernanceReportData | null;
}

const StatCard: React.FC<{ title: string; value: string; color: string; }> = ({ title, value, color }) => (
    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export const GovernanceReportModal: React.FC<GovernanceReportModalProps> = ({ isOpen, onClose, report }) => {
    if (!isOpen) return null;

    const invariantValue = report?.invariants
        ? `${report.invariants.passed} / ${report.invariants.total}`
        : 'N/D';
    const biasValue = report?.biasSensitivity === undefined ? 'N/D' : `Δ > ${report.biasSensitivity.toFixed(2)}`;
    const violationsValue = report?.violations === undefined ? 'N/D' : String(report.violations);
    const compliance = report?.compliance ?? 'Conformidade não avaliada nesta camada.';
    const signature = report?.entropySignature ?? 'N/D';

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
                onClick={event => event.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-teal-400/20">
                    <div className="flex items-center space-x-3">
                        <ScaleIcon className="w-6 h-6 text-teal-300"/>
                        <h2 className="text-xl font-bold text-teal-300">Relatório de Governança Ética</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-light">&times;</button>
                </div>

                <div className="p-6 space-y-6">
                    {!report && (
                        <div className="bg-gray-800/70 p-4 rounded-lg border border-amber-500/30 text-sm text-amber-300">
                            Nenhum relatório real de governança foi fornecido pelo runtime.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Invariantes Éticos" value={invariantValue} color="text-green-400" />
                        <StatCard title="Sensibilidade de Viés" value={biasValue} color="text-yellow-300" />
                        <StatCard title="Violações (Nível Γ)" value={violationsValue} color={violationsValue === '0' ? 'text-green-400' : 'text-red-400'} />
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50">
                        <h3 className="font-semibold text-white mb-2 flex items-center">
                            <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-400"/> Status de Conformidade
                        </h3>
                        <div className="flex items-center text-green-300">
                            <CheckIcon className="w-6 h-6 mr-2"/>
                            <p className="text-lg">{compliance}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50 font-mono-code text-sm">
                        <p className="text-gray-400 mb-1">Assinatura de Entropia (Auditoria):</p>
                        <p className="text-teal-300 break-all">{signature}</p>
                    </div>
                </div>

                <div className="p-3 border-t border-teal-400/20 text-xs text-center text-gray-500 font-mono-code">
                    RELATÓRIO EXIBIDO COM BASE EM EVIDÊNCIA FORNECIDA PELO RUNTIME
                </div>
            </div>
        </div>
    );
};