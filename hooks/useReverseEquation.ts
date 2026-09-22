import { useState, useEffect } from 'react';

const strategies = [
    { text: 'Otimizando para Velocidade', color: 'text-yellow-400' },
    { text: 'Adaptando para Eficiência', color: 'text-blue-400' },
    { text: 'Refinando para Qualidade', color: 'text-purple-400' },
    { text: 'Mantendo Estado Nominal', color: 'text-green-400' },
];

const useReverseEquation = () => {
    const [metrics, setMetrics] = useState({
        latency: 0,
        cpuLoad: 0,
        memoryUsage: 0,
        ethicalScore: 0,
        measured: false,
    });

    const [coreParams, setCoreParams] = useState({
        relevanceThreshold: 0.75,
        maxInferenceDepth: 5,
    });

    const [strategy, setStrategy] = useState(strategies[3]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!metricsRef.current.measured) return;

            const newLatency = metricsRef.current.latency;
            const newCpuLoad = metricsRef.current.cpuLoad;
            const newMemoryUsage = metricsRef.current.memoryUsage;
            const newEthicalScore = metricsRef.current.ethicalScore;
            
            let newStrategy = strategies[3]; // Default to nominal
            let newRelevance = coreParams.relevanceThreshold;
            let newDepth = coreParams.maxInferenceDepth;

            // Adaptação determinística sobre métricas que chegaram por uma fonte observada.
            if (newLatency > 400 && newCpuLoad > 70) {
                newStrategy = strategies[0]; // Adapt for Speed
                newRelevance = Math.min(0.85, coreParams.relevanceThreshold + 0.05);
            } else if (newCpuLoad > 85) {
                newStrategy = strategies[1]; // Adapt for Efficiency
                newDepth = Math.max(3, coreParams.maxInferenceDepth - 1);
            } else if (newEthicalScore > 0.98 && newLatency < 200) {
                newStrategy = strategies[2]; // Refine for Quality
                newRelevance = Math.max(0.70, coreParams.relevanceThreshold - 0.01);
            } else {
                // Drift back to defaults if nominal
                if (coreParams.relevanceThreshold > 0.75) newRelevance -= 0.01;
                if (coreParams.maxInferenceDepth < 5) newDepth += 1;
            }
            
            setStrategy(newStrategy);
            setCoreParams({
                relevanceThreshold: newRelevance,
                maxInferenceDepth: newDepth,
            });

        }, 2500);

        return () => clearInterval(interval);
    }, [coreParams]);

    const metricsRef = { current: metrics };
    const observeMetrics = (observed: Omit<typeof metrics, 'measured'>) => {
        if (
            !Object.values(observed).every(value => Number.isFinite(value)) ||
            observed.latency < 0 ||
            observed.cpuLoad < 0 ||
            observed.memoryUsage < 0 ||
            observed.ethicalScore < 0 ||
            observed.ethicalScore > 1
        ) return false;
        const next = { ...observed, measured: true };
        metricsRef.current = next;
        setMetrics(next);
        return true;
    };

    return { metrics, coreParams, strategy, observeMetrics };
};

export default useReverseEquation;
