import { useEffect, useState } from 'react';
import { ASASFNodesState, ASASFStatus } from '../types.ts';

const INITIAL_STATE: ASASFNodesState = {
    etr: ASASFStatus.NOMINAL,
    ara: ASASFStatus.NOMINAL,
    er: ASASFStatus.NOMINAL,
    itr: ASASFStatus.NOMINAL,
    psi: ASASFStatus.NOMINAL,
};

export type AsasfRemediator = () => Promise<boolean>;

export const useAsasfSystem = (
    hasCriticalErrors: boolean,
    remediator?: AsasfRemediator,
) => {
    const [asasfNodes, setAsasfNodes] = useState<ASASFNodesState>(INITIAL_STATE);
    const [isRemediating, setIsRemediating] = useState(false);

    useEffect(() => {
        if (!hasCriticalErrors) {
            setAsasfNodes(INITIAL_STATE);
            setIsRemediating(false);
            return;
        }

        let disposed = false;
        setAsasfNodes({
            etr: ASASFStatus.ALERTA,
            ara: ASASFStatus.ANALISANDO,
            er: remediator ? ASASFStatus.REMEDIANDO : ASASFStatus.ALERTA,
            itr: ASASFStatus.ANALISANDO,
            psi: ASASFStatus.ANALISANDO,
        });

        if (!remediator) {
            setIsRemediating(false);
            return;
        }

        setIsRemediating(true);
        void remediator()
            .then(success => {
                if (disposed) return;
                setIsRemediating(false);
                setAsasfNodes(success ? INITIAL_STATE : {
                    etr: ASASFStatus.ALERTA,
                    ara: ASASFStatus.NOMINAL,
                    er: ASASFStatus.ALERTA,
                    itr: ASASFStatus.ALERTA,
                    psi: ASASFStatus.ANALISANDO,
                });
            })
            .catch(() => {
                if (disposed) return;
                setIsRemediating(false);
                setAsasfNodes({
                    etr: ASASFStatus.ALERTA,
                    ara: ASASFStatus.NOMINAL,
                    er: ASASFStatus.ALERTA,
                    itr: ASASFStatus.ALERTA,
                    psi: ASASFStatus.ANALISANDO,
                });
            });

        return () => {
            disposed = true;
        };
    }, [hasCriticalErrors, remediator]);

    return { asasfNodes, isRemediating };
};