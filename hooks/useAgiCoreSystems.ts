
import { useState, useEffect } from 'react';
import { AgiCoreModule, AgiCoreModuleStatus } from '../types.ts';

const initialCoreModules: AgiCoreModule[] = [
    {
        id: 'linguistic_analysis',
        name: 'Módulo de Análise Linguística',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Processa e interpreta a linguagem natural de entrada."
    },
    {
        id: 'cognitive_processing',
        name: 'Núcleo de Processamento Cognitivo',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Realiza o raciocínio lógico e a inferência de alto nível."
    },
    {
        id: 'decision_making',
        name: 'Módulo de Tomada de Decisão',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Avalia opções e seleciona a ação mais apropriada."
    },
    {
        id: 'audit_tool',
        name: 'Ferramenta de Auditoria Ética',
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Monitora a conformidade com as diretrizes éticas."
    }
];

// No provider real foi encontrado para esses quatro módulos nesta camada.
const checkModuleStatus = (module: AgiCoreModule): Promise<AgiCoreModule> =>
    Promise.resolve({
        ...module,
        status: AgiCoreModuleStatus.OFFLINE,
        cpuUsage: 0,
        memoryUsage: 0,
    });

export const useAgiCoreSystems = () => {
    const [agiCoreModules, setAgiCoreModules] = useState<AgiCoreModule[]>(initialCoreModules);

    useEffect(() => {
        // Estado permanece OFFLINE até existir um heartbeat/provider executável.
        Promise.all(agiCoreModules.map(checkModuleStatus)).then(setAgiCoreModules);
    }, []);

    return { agiCoreModules };
};
