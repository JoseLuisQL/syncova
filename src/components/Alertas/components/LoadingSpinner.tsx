import React, { memo } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100">
      <SpinnerGap className="h-4 w-4 animate-spin text-zinc-900" aria-hidden="true" />
    </div>
    <span className="ml-3 text-sm font-medium text-zinc-600">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';
 