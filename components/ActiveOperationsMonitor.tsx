
import React from 'react';
import { ActiveOperation } from '../types.ts';
import { OperationStatusBar } from './OperationStatusBar.tsx';

interface ActiveOperationsMonitorProps {
    activeOperations: ActiveOperation[];
}

export const ActiveOperationsMonitor: React.FC<ActiveOperationsMonitorProps> = ({ activeOperations }) => {
    if (activeOperations.length === 0) {
        return null;
    }

    return (
        <div className="pb-2 space-y-2">
            {activeOperations.map(op => (
                <OperationStatusBar key={op.id} operation={op} />
            ))}
        </div>
    );
};
