import { useState, useEffect } from 'react';
import { AgiCoreModule, AgiCoreModuleStatus } from '../types.ts';

export type AgiCoreStatusProvider = () => Promise<AgiCoreModule[]>;

const initialCoreModules: AgiCoreModule[] = [
    {
        id: 'linguistic_analysis',
        name: 'Módulo de Análise Linguística',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Estado real não exposto nesta camada; aguardando provider do runtime.'
    },
    {
        id: 'cognitive_processing',
        name: 'Núcleo de Processamento Cognitivo',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Estado real não exposto nesta camada; aguardando provider do runtime.'
    },
    {
        id: 'decision_making',
        name: 'Módulo de Tomada de Decisão',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Estado real não exposto nesta camada; aguardando provider do runtime.'
    },
    {
        id: 'audit_tool',
        name: 'Ferramenta de Auditoria Ética',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: 'Estado real não exposto nesta camada; aguardando provider do runtime.'
    }
];

export const useAgiCoreSystems = (statusProvider?: AgiCoreStatusProvider) => {
    const [agiCoreModules, setAgiCoreModules] = useState<AgiCoreModule[]>(initialCoreModules);

    useEffect(() => {
        if (!statusProvider) return;

        let disposed = false;
        const refresh = async () => {
            try {
                const modules = await statusProvider();
                if (!disposed) setAgiCoreModules(modules);
            } catch {
                if (!disposed) {
                    setAgiCoreModules(current => current.map(module => ({
                        ...module,
                        status: AgiCoreModuleStatus.ERROR,
                    })));
                }
            }
        };

        void refresh();
        const intervalId = setInterval(() => { void refresh(); }, 2500);
        return () => {
            disposed = true;
            clearInterval(intervalId);
        };
    }, [statusProvider]);

    return { agiCoreModules };
};
