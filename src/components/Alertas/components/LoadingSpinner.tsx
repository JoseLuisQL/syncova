import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-hidden="true" />
    <span className="ml-3 text-gray-600">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';
