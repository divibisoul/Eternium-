import { useEffect, useState } from 'react';
import { ASASFNodesState, ASASFStatus } from '../types.ts';

const INITIAL_STATE: ASASFNodesState = {
    etr: ASASFStatus.NAO_OBSERVADO,
    ara: ASASFStatus.NAO_OBSERVADO,
    er: ASASFStatus.NAO_OBSERVADO,
    itr: ASASFStatus.NAO_OBSERVADO,
    psi: ASASFStatus.NAO_OBSERVADO,
};

/**
 * ASASF UI projection.
 * A local audit error is evidence of an alert, not evidence that remediation ran.
 * Remediation stages are therefore not advanced by timers; a real SARA executor
 * must publish their observed states.
 */
export const useAsasfSystem = (hasCriticalErrors: boolean) => {
    const [asasfNodes, setAsasfNodes] = useState<ASASFNodesState>(INITIAL_STATE);
    const [isRemediating] = useState(false);

    useEffect(() => {
        if (hasCriticalErrors) {
            setAsasfNodes(prev => ({
                ...prev,
                etr: ASASFStatus.ALERTA,
                ara: ASASFStatus.ANALISANDO,
            }));
            return;
        }

        setAsasfNodes(INITIAL_STATE);
    }, [hasCriticalErrors]);

    return { asasfNodes, isRemediating };
};
