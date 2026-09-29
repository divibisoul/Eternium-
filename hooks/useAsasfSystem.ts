import { ASASFNodesState, ASASFStatus } from '../types.ts';

const INITIAL_STATE: ASASFNodesState = {
    etr: ASASFStatus.NOMINAL,
    ara: ASASFStatus.NOMINAL,
    er: ASASFStatus.NOMINAL,
    itr: ASASFStatus.NOMINAL,
    psi: ASASFStatus.NOMINAL,
};

const ALERT_STATE: ASASFNodesState = {
    etr: ASASFStatus.ALERTA,
    ara: ASASFStatus.ANALISANDO,
    er: ASASFStatus.ALERTA,
    itr: ASASFStatus.NOMINAL,
    psi: ASASFStatus.ANALISANDO,
};

/**
 * ASASF is a state projection, not a timer-based remediation simulator.
 * Without a bound corrective executor, it never claims REMEDIANDO/completed.
 */
export const useAsasfSystem = (hasCriticalErrors: boolean) => ({
    asasfNodes: hasCriticalErrors ? ALERT_STATE : INITIAL_STATE,
    isRemediating: false,
});
