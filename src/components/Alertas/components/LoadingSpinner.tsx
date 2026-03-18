import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50">
      <Loader2 className="h-4 w-4 animate-spin text-teal-600" aria-hidden="true" />
    </div>
    <span className="ml-3 text-sm font-medium text-slate-600">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';
