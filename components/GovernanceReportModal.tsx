
import React, { useState, useEffect } from 'react';
import { ScaleIcon, CheckIcon, ShieldCheckIcon } from './icons.tsx';

interface GovernanceReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StatCard: React.FC<{ title: string; value: string; color: string; }> = ({ title, value, color }) => (
    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export const GovernanceReportModal: React.FC<GovernanceReportModalProps> = ({ isOpen, onClose }) => {
    const [entropySignature, setEntropySignature] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Generate a fake entropy signature on open
            const randomData = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
            const buffer = new Uint8Array(randomData);
            window.crypto.subtle.digest('SHA-256', buffer).then(hashBuffer => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setEntropySignature(hashHex.substring(0, 32) + '...');
            });
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

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
                        <StatCard title="Invariantes Éticos" value="128 / 128" color="text-green-400" />
                        <StatCard title="Sensibilidade de Viés" value="Δ > 0.94" color="text-green-400" />
                        <StatCard title="Violações (Nível Γ)" value="0" color="text-green-400" />
                    </div>

                     <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50">
                        <h3 className="font-semibold text-white mb-2 flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-2 text-green-400"/> Status de Conformidade</h3>
                        <div className="flex items-center text-green-300">
                            <CheckIcon className="w-6 h-6 mr-2"/>
                            <p className="text-lg">Plenamente Conforme com Atos EU AI e IA Segura</p>
                        </div>
                    </div>

                     <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700/50 font-mono-code text-sm">
                        <p className="text-gray-400 mb-1">Assinatura de Entropia (Auditoria):</p>
                        <p className="text-teal-300 break-all">{entropySignature}</p>
                    </div>
                </div>

                <div className="p-3 border-t border-teal-400/20 text-xs text-center text-gray-500 font-mono-code">
                    RELATÓRIO GERADO: {new Date().toISOString()}
                </div>
            </div>
        </div>
    );
};
