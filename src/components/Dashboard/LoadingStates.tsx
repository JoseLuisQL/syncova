import React, { memo } from 'react';
import { SpinnerGap, WarningCircle, ArrowsClockwise } from '@phosphor-icons/react';
import { SkeletonBlock } from '../common/LoadingSkeleton';

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
    <div className="text-center rounded-2xl border border-line bg-surface px-8 py-7 shadow-xs">
      <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-soft inventory-breathe">
        <SpinnerGap weight="bold" className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />
      </div>
      <h2 className="mb-1 text-sm font-semibold text-ink">{message}</h2>
      <p className="text-xs text-muted">Obteniendo datos del sistema...</p>
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
    <div className="text-center max-w-md mx-auto rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
        <WarningCircle weight="fill" className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mb-1.5 text-base font-semibold text-ink">
        Error al cargar Dashboard
      </h2>
      <p className="mb-5 text-xs text-muted-2 leading-relaxed">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-soft px-4 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        <ArrowsClockwise weight="bold" className="h-3.5 w-3.5" aria-hidden="true" />
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
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line-soft bg-surface-soft text-muted">
      {icon}
    </div>
    <h3 className="mb-1 text-sm font-medium text-ink">{title}</h3>
    <p className="text-xs text-muted">{description}</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

interface SectionSkeletonProps {
  rows?: number;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = memo(({ rows = 3 }) => (
  <div className="divide-y divide-line-soft" role="status" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="inventory-reveal flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
        style={{ animationDelay: `${i * 40}ms` }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <SkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
            <SkeletonBlock className="h-2.5 w-1/2 rounded-md opacity-75" />
          </div>
        </div>
        <SkeletonBlock className="h-4 w-14 shrink-0 rounded-md opacity-80" />
      </div>
    ))}
  </div>
));

SectionSkeleton.displayName = 'SectionSkeleton';

