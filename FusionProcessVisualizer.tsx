import React from 'react';
import type { IntermediateResponse } from './types.ts';

export const FusionProcessVisualizer: React.FC<{ intermediateResponses: IntermediateResponse[] }> = ({ intermediateResponses }) => (
  <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-2">
    {intermediateResponses.map((item, index) => (
      <div key={`${item.aspect}-${index}`} className="text-xs">
        <div className="font-semibold text-cyan-300">{item.aspect}</div>
        <div className="text-gray-400 whitespace-pre-wrap">{item.text}</div>
      </div>
    ))}
  </div>
);
