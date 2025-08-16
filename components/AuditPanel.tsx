
import React from 'react';
import { AuditLogEntry } from '../types.ts';
import { ShieldCheckIcon, ChevronDoubleRightIcon } from './icons.tsx';

const levelColorClasses: { [key: string]: string } = {
    info: 'text-cyan-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
};

const levelIconColorClasses: { [key:string]: string } = {
    info: 'text-cyan-500',
    warn: 'text-yellow-500',
    error: 'text-red-500',
}

export const AuditPanel: React.FC<{ auditLog: AuditLogEntry[] }> = ({ auditLog }) => {
    return (
        <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 max-h-48 overflow-y-auto p-3 text-xs font-mono z-10">
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-cyan-400" />
                <span>Log de Auditoria do Núcleo</span>
            </h3>
            <ul>
                {auditLog.map(entry => (
                    <li key={entry.id} className="flex items-start whitespace-nowrap py-0.5 hover:bg-white/5 rounded px-1">
                        <span className="text-gray-500 mr-2">{new Date(entry.timestamp).toLocaleTimeString('pt-BR')}</span>
                        <ChevronDoubleRightIcon className={`w-3 h-3 mr-2 mt-0.5 flex-shrink-0 ${levelIconColorClasses[entry.level]}`} />
                        <span className={`flex-shrink-0 mr-2 font-semibold ${levelColorClasses[entry.level]}`}>[{entry.type}]</span>
                        <span className="truncate text-gray-400" title={entry.message}>{entry.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};