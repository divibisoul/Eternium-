import { useState, useEffect } from 'react';

const strategies = [
    { text: 'Otimizando para Velocidade', color: 'text-yellow-400' },
    { text: 'Adaptando para Eficiência', color: 'text-blue-400' },
    { text: 'Refinando para Qualidade', color: 'text-purple-400' },
    { text: 'Mantendo Estado Nominal', color: 'text-green-400' },
];

const useReverseEquation = () => {
    const [metrics, setMetrics] = useState({
        latency: 250,
        cpuLoad: 50,
        memoryUsage: 3.0,
        ethicalScore: 0.98,
    });

    const [coreParams, setCoreParams] = useState({
        relevanceThreshold: 0.75,
        maxInferenceDepth: 5,
    });

    const [strategy, setStrategy] = useState(strategies[3]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate new metrics from RealityGuardian(Φ)
            const newLatency = 150 + Math.random() * 450;
            const newCpuLoad = 30 + Math.random() * 60;
            const newMemoryUsage = 2.5 + Math.random() * 2.5;
            const newEthicalScore = 0.95 + Math.random() * 0.05;

            setMetrics({
                latency: newLatency,
                cpuLoad: newCpuLoad,
                memoryUsage: newMemoryUsage,
                ethicalScore: newEthicalScore,
            });
            
            let newStrategy = strategies[3]; // Default to nominal
            let newRelevance = coreParams.relevanceThreshold;
            let newDepth = coreParams.maxInferenceDepth;

            // Simulate AdaptationModule(Δ) logic
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

    return { metrics, coreParams, strategy };
};

export default useReverseEquation;
