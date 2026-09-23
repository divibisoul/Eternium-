import React from 'react';
import { DocumentMagnifyingGlassIcon, ShieldCheckIcon } from './icons.tsx';

interface SystemicGroundingModalProps {
    isOpen: boolean;
    onClose: () => void;
    critique: string;
}

const oldInstruction = 'Diretriz histórica não verificável: assumir execução e capacidades como fatos sem evidência.';
const newInstruction = 'Diretriz atual: usar somente contexto e capacidades efetivamente fornecidos; separar contrato, adaptador e execução observada.';

const SystemicGroundingModal: React.FC<SystemicGroundingModalProps> = ({ isOpen, onClose, critique }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans">
            <div className="w-full max-w-2xl text-white bg-gray-900/80 border border-yellow-500/30 rounded-lg shadow-2xl p-6">
                <h2 className="text-xl font-bold text-yellow-300 flex items-center mb-4">
                    <DocumentMagnifyingGlassIcon className="w-6 h-6 mr-3" />
                    Protocolo de Aterramento Sistêmico
                </h2>

                <div className="space-y-4">
                    <section>
                        <h3 className="font-semibold text-white mb-2">1. Diagnóstico recebido</h3>
                        <div className="bg-black/30 p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap">
                            {critique || 'Nenhum diagnóstico fornecido.'}
                        </div>
                    </section>

                    <section className="font-mono-code text-xs space-y-3">
                        <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                            <p className="text-red-300 font-bold">[DIRETRIZ HISTÓRICA]</p>
                            <p className="text-gray-400">{oldInstruction}</p>
                        </div>
                        <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                            <p className="text-green-300 font-bold">[DIRETRIZ ATUAL]</p>
                            <p className="text-gray-200">{newInstruction}</p>
                        </div>
                    </section>

                    <section className="bg-gray-800/60 border border-gray-700 p-4 rounded-md">
                        <div className="flex items-start space-x-3">
                            <ShieldCheckIcon className="w-5 h-5 text-yellow-300 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-white">Estado de execução</h3>
                                <p className="text-sm text-gray-400">
                                    A apresentação desta tela não prova que uma correção foi propagada ao restante do sistema. Nenhum executor real está conectado a este componente.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 px-4 py-2 rounded border border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default SystemicGroundingModal;
