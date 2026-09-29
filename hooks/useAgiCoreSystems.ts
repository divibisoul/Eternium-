import { useState } from 'react';
import { AgiCoreModule, AgiCoreModuleStatus } from '../types.ts';

const initialCoreModules: AgiCoreModule[] = [
    {
        id: 'linguistic_analysis',
        name: 'Módulo de Análise Linguística',
        status: AgiCoreModuleStatus.UNMEASURED,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Processamento definido no núcleo, mas não há fonte de telemetria runtime conectada a este painel.',
    },
    {
        id: 'cognitive_processing',
        name: 'Núcleo de Processamento Cognitivo',
        status: AgiCoreModuleStatus.UNMEASURED,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Capacidade existente; estado quantitativo deste painel permanece não mensurado sem telemetria runtime.',
    },
    {
        id: 'decision_making',
        name: 'Módulo de Tomada de Decisão',
        status: AgiCoreModuleStatus.UNMEASURED,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Capacidade declarada; executor e telemetria quantitativa não estão vinculados a este painel.',
    },
    {
        id: 'audit_tool',
        name: 'Ferramenta de Auditoria Ética',
        status: AgiCoreModuleStatus.UNMEASURED,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Capacidade preservada no catálogo; não há evidência de telemetria runtime conectada ao painel.',
    },
];

export const useAgiCoreSystems = () => {
    const [agiCoreModules] = useState<AgiCoreModule[]>(initialCoreModules);
    return { agiCoreModules };
};
