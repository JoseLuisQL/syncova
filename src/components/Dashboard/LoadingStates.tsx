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
      <div className="mx-auto h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Loader2 className="h-6 w-6 text-teal-600 animate-spin" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{message}</h2>
      <p className="text-sm text-gray-400">Obteniendo datos del sistema...</p>
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
      <div className="mx-auto h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-rose-500" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Error al cargar Dashboard
      </h2>
      <p className="text-sm text-gray-400 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 
          bg-white text-gray-700 border border-gray-200 
          rounded-xl font-medium text-sm 
          hover:border-teal-300 hover:text-teal-700 hover:shadow-sm
          transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-1"
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
    <div className="mx-auto h-10 w-10 text-gray-300 mb-3">
      {icon}
    </div>
    <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

interface SectionSkeletonProps {
  rows?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = memo(({ rows = 3 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
        <div className="h-9 w-9 bg-gray-100 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
));

SectionSkeleton.displayName = 'SectionSkeleton';
