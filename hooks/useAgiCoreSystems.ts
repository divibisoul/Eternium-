
import { useState, useEffect } from 'react';
import { AgiCoreModule, AgiCoreModuleStatus } from '../types.ts';

const initialCoreModules: AgiCoreModule[] = [
    {
        id: 'linguistic_analysis',
        name: 'Módulo de Análise Linguística',
        status: AgiCoreModuleStatus.ONLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Processa e interpreta a linguagem natural de entrada."
    },
    {
        id: 'cognitive_processing',
        name: 'Núcleo de Processamento Cognitivo',
        status: AgiCoreModuleStatus.ONLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Realiza o raciocínio lógico e a inferência de alto nível."
    },
    {
        id: 'decision_making',
        name: 'Módulo de Tomada de Decisão',
        status: AgiCoreModuleStatus.ONLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Avalia opções e seleciona a ação mais apropriada."
    },
    {
        id: 'audit_tool',
        name: 'Ferramenta de Auditoria Ética',
        status: AgiCoreModuleStatus.ONLINE,
        cpuUsage: 0,
        memoryUsage: 0,
        description: "Monitora a conformidade com as diretrizes éticas."
    }
];

// Simulates an async check for a single module
const checkModuleStatus = (module: AgiCoreModule): Promise<AgiCoreModule> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let newStatus = module.status;
            // If already in error, 50% chance to recover
            if (module.status === AgiCoreModuleStatus.ERROR) {
                if (Math.random() < 0.5) {
                    newStatus = AgiCoreModuleStatus.ONLINE;
                }
            } else {
                // 2% chance of a new error if not already in error
                if (Math.random() < 0.02) {
                   newStatus = AgiCoreModuleStatus.ERROR;
                }
            }
            
            const updatedModule = {
                ...module,
                status: newStatus,
                cpuUsage: Math.random() * 80 + 10, // Simulate 10-90% CPU
                memoryUsage: Math.random() * 70 + 20, // Simulate 20-90% Memory
            };
            resolve(updatedModule);
        }, 500 + Math.random() * 1000); // Staggered async check time
    });
};


export const useAgiCoreSystems = () => {
    const [agiCoreModules, setAgiCoreModules] = useState<AgiCoreModule[]>(initialCoreModules);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const updatePromises = agiCoreModules.map(module => 
                checkModuleStatus(module)
            );
            
            Promise.all(updatePromises).then(updatedModules => {
                setAgiCoreModules(updatedModules);
            });

        }, 2500); // Refresh all modules every 2.5 seconds

        return () => clearInterval(intervalId);
    }, [agiCoreModules]);

    return { agiCoreModules };
};
