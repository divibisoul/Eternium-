import React from 'react';
import type { SynthesisMetricsData } from './types.ts';

export const SynthesisMetrics: React.FC<{ metrics: SynthesisMetricsData }> = ({ metrics }) => (
  <div className="text-xs text-gray-400 rounded-lg border border-gray-700 bg-gray-800/40 px-3 py-2 grid grid-cols-3 gap-3">
    <span>Coerência: {(metrics.coherence * 100).toFixed(0)}%</span>
    <span>Confiança: {(metrics.confidence * 100).toFixed(0)}%</span>
    <span>Tempo: {Math.round(metrics.integrationTime)} ms</span>
  </div>
);
