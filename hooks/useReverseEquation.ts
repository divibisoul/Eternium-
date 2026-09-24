import { useEffect, useState } from 'react';

export type ReverseEquationMetrics = {
    latency: number;
    cpuLoad: number;
    memoryUsage: number;
    ethicalScore: number;
    available: boolean;
};

export type ReverseEquationMetricsProvider = () => Promise<{
    latency: number;
    cpuLoad: number;
    memoryUsage: number;
    ethicalScore: number;
}>;

const nominalStrategy = { text: 'Estado de monitoramento indisponível', color: 'text-muted-foreground' };

const useReverseEquation = (metricsProvider?: ReverseEquationMetricsProvider) => {
    const [metrics, setMetrics] = useState<ReverseEquationMetrics>({
        latency: 0,
        cpuLoad: 0,
        memoryUsage: 0,
        ethicalScore: 0,
        available: false,
    });

    const [coreParams, setCoreParams] = useState({
        relevanceThreshold: 0.75,
        maxInferenceDepth: 5,
    });

    const [strategy, setStrategy] = useState(nominalStrategy);

    useEffect(() => {
        if (!metricsProvider) return;
        let disposed = false;
        const refresh = async () => {
            try {
                const observed = await metricsProvider();
                if (disposed) return;
                setMetrics({ ...observed, available: true });
                setStrategy(
                    observed.latency > 400 && observed.cpuLoad > 70
                        ? { text: 'Otimizando para Velocidade', color: 'text-yellow-400' }
                        : observed.cpuLoad > 85
                            ? { text: 'Adaptando para Eficiência', color: 'text-blue-400' }
                            : observed.ethicalScore > 0.98 && observed.latency < 200
                                ? { text: 'Refinando para Qualidade', color: 'text-purple-400' }
                                : { text: 'Estado Nominal Observado', color: 'text-green-400' }
                );
                setCoreParams(current => ({
                    relevanceThreshold: observed.latency > 400 && observed.cpuLoad > 70
                        ? Math.min(0.85, current.relevanceThreshold + 0.05)
                        : observed.cpuLoad > 85
                            ? current.relevanceThreshold
                            : Math.max(0.70, current.relevanceThreshold),
                    maxInferenceDepth: observed.cpuLoad > 85
                        ? Math.max(3, current.maxInferenceDepth - 1)
                        : Math.min(5, current.maxInferenceDepth + 1),
                }));
            } catch {
                if (!disposed) setMetrics(current => ({ ...current, available: false }));
            }
        };
        void refresh();
        const interval = setInterval(() => { void refresh(); }, 2500);
        return () => {
            disposed = true;
            clearInterval(interval);
        };
    }, [metricsProvider]);

    return { metrics, coreParams, strategy };
};

export default useReverseEquation;
