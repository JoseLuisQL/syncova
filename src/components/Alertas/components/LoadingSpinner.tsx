import React, { memo } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando alertas...' }) => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-soft">
      <SpinnerGap className="h-4 w-4 animate-spin text-brand" aria-hidden="true" weight="bold" />
    </div>
    <span className="ml-3 text-sm font-medium text-muted-2">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';