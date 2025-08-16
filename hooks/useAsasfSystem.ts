
import { useState, useEffect } from 'react';
import { ASASFNodesState, ASASFStatus } from '../types.ts';

const INITIAL_STATE: ASASFNodesState = {
    etr: ASASFStatus.NOMINAL,
    ara: ASASFStatus.NOMINAL,
    er: ASASFStatus.NOMINAL,
    itr: ASASFStatus.NOMINAL,
    psi: ASASFStatus.NOMINAL,
};

export const useAsasfSystem = (hasCriticalErrors: boolean) => {
    const [asasfNodes, setAsasfNodes] = useState<ASASFNodesState>(INITIAL_STATE);
    const [isRemediating, setIsRemediating] = useState(false);

    useEffect(() => {
        if (hasCriticalErrors && !isRemediating) {
            setIsRemediating(true);
            const timeouts: ReturnType<typeof setTimeout>[] = [];

            // Sequence of state changes to simulate remediation based on the 5-phase Reverse Equation
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, etr: ASASFStatus.ALERTA })), 500)); // Λ - Alerta
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, etr: ASASFStatus.ANALISANDO, ara: ASASFStatus.ALERTA })), 1500));
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, ara: ASASFStatus.ANALISANDO })), 2500)); // Π - Análise
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, ara: ASASFStatus.NOMINAL, er: ASASFStatus.ALERTA })), 4000));
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, er: ASASFStatus.REMEDIANDO })), 5000)); // Σ - Remediação
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, er: ASASFStatus.NOMINAL, itr: ASASFStatus.REMEDIANDO })), 6500)); // Δ - Refino
            timeouts.push(setTimeout(() => setAsasfNodes(prev => ({ ...prev, itr: ASASFStatus.NOMINAL, psi: ASASFStatus.ANALISANDO })), 8000)); // Ψ - Auditoria
            timeouts.push(setTimeout(() => {
                setAsasfNodes(INITIAL_STATE);
                setIsRemediating(false);
            }, 9500)); // Ciclo completo

            return () => {
                timeouts.forEach(clearTimeout);
            };
        }
    }, [hasCriticalErrors, isRemediating]);

    return { asasfNodes, isRemediating };
};
