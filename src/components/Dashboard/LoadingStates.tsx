import React, { memo } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = memo(({ 
  message = 'Cargando Dashboard' 
}) => (
  <div 
    className="flex items-center justify-center min-h-[60vh]"
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-tertiary" aria-hidden="true" />
      </div>
      <h2 className="mb-1 text-lg font-semibold text-primary">{message}</h2>
      <p className="text-sm text-secondary">Obteniendo datos del sistema...</p>
    </div>
  </div>
));

LoadingState.displayName = 'LoadingState';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = memo(({ error, onRetry }) => (
  <div 
    className="flex items-center justify-center min-h-[60vh]"
    role="alert"
    aria-live="assertive"
  >
    <div className="text-center max-w-md mx-auto px-4">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200 bg-white">
        <AlertCircle className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-primary">
        Error al cargar Dashboard
      </h2>
      <p className="mb-6 text-sm text-secondary">{error}</p>
      <button type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 
          border border-zinc-200 bg-white text-sm font-medium text-secondary
          transition-colors duration-200 
          hover:border-tertiary hover:text-primary
          focus:outline-none focus:ring-2 focus:ring-tertiary/20 focus:ring-offset-1"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Reintentar
      </button>
    </div>
  </div>
));

ErrorState.displayName = 'ErrorState';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({ icon, title, description }) => (
  <div className="text-center py-10" role="status">
    <div className="mx-auto mb-3 h-10 w-10 text-secondary/50">
      {icon}
    </div>
    <h3 className="mb-1 text-sm font-medium text-primary">{title}</h3>
    <p className="text-xs text-secondary">{description}</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

interface SectionSkeletonProps {
  rows?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = memo(({ rows = 3 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <div className="h-9 w-9 flex-shrink-0 bg-neutral" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-neutral" />
          <div className="h-3 w-1/2 bg-neutral" />
        </div>
      </div>
    ))}
  </div>
));

SectionSkeleton.displayName = 'SectionSkeleton';
