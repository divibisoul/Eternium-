import React from 'react';

type AuditProgressIndicatorProps = React.HTMLAttributes<HTMLDivElement> & {
  current?: number;
  total?: number;
  label?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
};

export default function AuditProgressIndicator({
  current = 0,
  total = 0,
  label = 'Audit progress',
  status = 'idle',
  ...rest
}: AuditProgressIndicatorProps) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safeCurrent = Number.isFinite(current) ? Math.max(0, current) : 0;
  const percentage = safeTotal > 0 ? Math.min(100, (safeCurrent / safeTotal) * 100) : 0;
  const statusText = status === 'running' ? 'Running' : status === 'success' ? 'Complete' : status === 'error' ? 'Error' : 'Idle';

  return (
    <div {...rest} role="status" aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span>{label}</span>
        <span>{safeTotal > 0 ? `${Math.round(percentage)}%` : '—'}</span>
      </div>
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: 6,
          marginTop: 6,
          overflow: 'hidden',
          borderRadius: 999,
          background: 'currentColor',
          opacity: 0.16,
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            borderRadius: 999,
            background: 'currentColor',
            opacity: 1,
            transition: 'width 160ms ease-out',
          }}
        />
      </div>
      <span>{statusText}</span>
    </div>
  );
}
