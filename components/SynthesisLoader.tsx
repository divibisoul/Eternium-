
import React from 'react';
import { SparklesIcon, BrainChipIcon, HeartIcon, GalaxyIcon } from './icons.tsx';

export const SynthesisLoader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center my-4 p-4 space-y-4">
             <style>{`
                @keyframes flow-to-center-1 {
                    0% { opacity: 0; transform: translate(-80px, -60px) scale(0.5); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translate(0, 0) scale(0.1); }
                }
                @keyframes flow-to-center-2 {
                    0% { opacity: 0; transform: translate(80px, -60px) scale(0.5); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translate(0, 0) scale(0.1); }
                }
                @keyframes flow-to-center-3 {
                    0% { opacity: 0; transform: translate(0, 80px) scale(0.5); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translate(0, 0) scale(0.1); }
                }
                .flow-1 { animation: flow-to-center-1 2.5s ease-in-out infinite; }
                .flow-2 { animation: flow-to-center-2 2.5s ease-in-out infinite; animation-delay: 0.5s; }
                .flow-3 { animation: flow-to-center-3 2.5s ease-in-out infinite; animation-delay: 1s; }
                .node-pulse { animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
             `}</style>
             <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Central Synthesis Node */}
                <div className="absolute z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/30 flex items-center justify-center border-2 border-cyan-400 shadow-lg shadow-cyan-500/30 node-pulse">
                        <GalaxyIcon className="w-8 h-8 text-cyan-300" />
                    </div>
                </div>

                {/* Sub-routine Nodes */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(-80px, -60px)' }}>
                     <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                        <BrainChipIcon className="w-6 h-6 text-blue-400" />
                     </div>
                </div>
                 <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2" style={{ transform: 'translate(80px, -60px)' }}>
                     <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50">
                        <HeartIcon className="w-6 h-6 text-purple-400" />
                     </div>
                </div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ transform: 'translate(0, 80px)' }}>
                     <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                        <SparklesIcon className="w-6 h-6 text-green-400" />
                     </div>
                </div>
                
                {/* Animated Flow Particles */}
                <div className="absolute w-3 h-3 bg-blue-400 rounded-full flow-1 shadow-md shadow-blue-400"></div>
                <div className="absolute w-3 h-3 bg-purple-400 rounded-full flow-2 shadow-md shadow-purple-400"></div>
                <div className="absolute w-3 h-3 bg-green-400 rounded-full flow-3 shadow-md shadow-green-400"></div>

             </div>
             <p className="text-cyan-300 font-semibold font-mono-code animate-pulse">
                [SINTETIZANDO VERDADE...]
             </p>
        </div>
    );
};
