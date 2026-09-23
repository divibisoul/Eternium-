import { useState } from 'react';
import { AgiCoreModule, AgiCoreModuleStatus } from '../types.ts';

const initialCoreModules: AgiCoreModule[] = [
    {
        id: 'linguistic_analysis',
        name: 'Módulo de Análise Linguística',
        status: AgiCoreModuleStatus.NOT_OBSERVED,
        cpuUsage: null,
        memoryUsage: null,
        description: 'Processa e interpreta a linguagem natural de entrada.'
    },
    {
        id: 'cognitive_processing',
        name: 'Núcleo de Processamento Cognitivo',
        status: AgiCoreModuleStatus.NOT_OBSERVED,
        cpuUsage: null,
        memoryUsage: null,
        description: 'Realiza o raciocínio lógico e a inferência de alto nível.'
    },
    {
        id: 'decision_making',
        name: 'Módulo de Tomada de Decisão',
        status: AgiCoreModuleStatus.NOT_OBSERVED,
        cpuUsage: null,
        memoryUsage: null,
        description: 'Avalia opções e seleciona a ação mais apropriada.'
    },
    {
        id: 'audit_tool',
        name: 'Ferramenta de Auditoria Ética',
        status: AgiCoreModuleStatus.NOT_OBSERVED,
        cpuUsage: null,
        memoryUsage: null,
        description: 'Monitora a conformidade com as diretrizes éticas.'
    }
];

/**
 * N02 exposes only observed core state.
 * No random polling, timed recovery, or synthetic CPU/memory values are generated here.
 * A real N02/SOUL Mesh observer can be bound later without changing the UI contract.
 */
export const useAgiCoreSystems = () => {
    const [agiCoreModules] = useState<AgiCoreModule[]>(initialCoreModules);
    return { agiCoreModules };
};
