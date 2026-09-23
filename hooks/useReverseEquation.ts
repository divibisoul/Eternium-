import { useEffect, useState } from 'react';

export interface ReverseEquationObservations {
    latency: number | null;
    cpuLoad: number | null;
    memoryUsage: number | null;
    ethicalScore: number | null;
}

export interface ReverseEquationStrategy {
    text: string;
    color: string;
}

const UNOBSERVED_STRATEGY: ReverseEquationStrategy = {
    text: 'Aguardando observações reais',
    color: 'text-gray-400',
};

const useReverseEquation = (observations?: ReverseEquationObservations) => {
    const [metrics, setMetrics] = useState<ReverseEquationObservations>({
        latency: null,
        cpuLoad: null,
        memoryUsage: null,
        ethicalScore: null,
    });

    const [coreParams] = useState({
        relevanceThreshold: 0.75,
        maxInferenceDepth: 5,
    });

    const [strategy, setStrategy] = useState<ReverseEquationStrategy>(UNOBSERVED_STRATEGY);

    useEffect(() => {
        if (!observations) return;

        setMetrics({
            latency: Number.isFinite(observations.latency) ? observations.latency : null,
            cpuLoad: Number.isFinite(observations.cpuLoad) ? observations.cpuLoad : null,
            memoryUsage: Number.isFinite(observations.memoryUsage) ? observations.memoryUsage : null,
            ethicalScore: Number.isFinite(observations.ethicalScore) ? observations.ethicalScore : null,
        });
    }, [observations]);

    return { metrics, coreParams, strategy };
};

export default useReverseEquation;
