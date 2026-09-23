
import React from 'react';
import { UISystemModule } from '../types.ts';

interface UISystemsMonitorProps {
    systems: UISystemModule[];
    onToggleBlueprint: () => void;
    onToggleCodex: () => void;
    onRunEruAudit: () => void;
    onToggleEruDashboard: () => void;
    onInitiateOrientationGuide: () => void;
}


const statusColors: { [key: string]: string } = {
    'Monitorando': 'text-green-300',
    'Otimizando Cache': 'text-blue-300',
    'Analisando Dados': 'text-yellow-300',
    'Em Espera': 'text-gray-400',
    'Não observado': 'text-gray-500',
};

const statusDotColors: { [key: string]: string } = {
    'Monitorando': 'bg-green-400',
    'Otimizando Cache': 'bg-blue-400',
    'Analisando Dados': 'bg-yellow-400',
    'Em Espera': 'bg-gray-500',
    'Não observado': 'bg-gray-500',
};

const actionMap: { [key: string]: (props: UISystemsMonitorProps) => void } = {
    'blueprint': (props) => props.onToggleBlueprint(),
    'codex': (props) => props.onToggleCodex(),
    'audit': (props) => props.onRunEruAudit(),
    'eru': (props) => props.onToggleEruDashboard(),
    'guide': (props) => props.onInitiateOrientationGuide(),
};

export const UISystemsMonitor: React.FC<UISystemsMonitorProps> = (props) => {
    const { systems } = props;
    return (
        <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Monitor de Sistemas de Interface</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {systems.map(sys => {
                    const action = actionMap[sys.id];
                    return (
                        <button 
                            key={sys.id} 
                            onClick={() => action ? action(props) : null}
                            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all text-center"
                            title={`Abrir ${sys.name}`}
                        >
                            <sys.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-200">{sys.name}</p>
                            <div className="flex items-center justify-center space-x-1.5 mt-1">
                                <div className={`w-2 h-2 rounded-full ${statusDotColors[sys.status] ?? 'bg-gray-500'} ${sys.status === 'Não observado' ? '' : 'animate-pulse'}`}></div>
                                <span className={`text-xs font-mono-code ${statusColors[sys.status] ?? 'text-gray-500'}`}>{sys.status}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
