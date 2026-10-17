import React, { memo } from 'react';

export interface SkeletonBlockProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = memo(({ className = '', style }) => (
  <div className={`inventory-skeleton rounded-md ${className}`} style={style} aria-hidden="true" />
));
SkeletonBlock.displayName = 'SkeletonBlock';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  message?: string;
}

export const TableLoadingSkeleton: React.FC<LoadingSkeletonProps> = memo(({
  rows = 6,
  columns = 5,
  className = '',
  message,
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-2xs ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message || 'Cargando tabla de datos'}
    >
      {message ? (
        <div className="flex items-center justify-between border-b border-line-soft bg-surface-soft/60 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <span className="text-xs font-medium text-muted-2">{message}</span>
          </div>
          <SkeletonBlock className="h-3.5 w-20 rounded-full" />
        </div>
      ) : null}

      {/* Header skeleton */}
      <div className="border-b border-line bg-surface-soft/80 px-5 py-3">
        <div className="grid items-center gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={`th-skel-${colIdx}`} className={colIdx === columns - 1 ? 'flex justify-end' : ''}>
              <SkeletonBlock
                className={`h-3 rounded-full ${
                  colIdx === 0 ? 'w-28' : colIdx === columns - 1 ? 'w-16' : 'w-20'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rows skeleton */}
      <div className="divide-y divide-line-soft">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`tr-skel-${rowIndex}`}
            className=" inventory-reveal px-5 py-3.5"
            style={{ animationDelay: `${rowIndex * 35}ms` }}
          >
            <div className="grid items-center gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((__, colIdx) => {
                if (colIdx === 0) {
                  return (
                    <div key={`td-skel-${rowIndex}-${colIdx}`} className="flex items-center gap-3 min-w-0">
                      <SkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
                        <SkeletonBlock className="h-2.5 w-1/2 rounded-md opacity-75" />
                      </div>
                    </div>
                  );
                }
                if (colIdx === columns - 1) {
                  return (
                    <div key={`td-skel-${rowIndex}-${colIdx}`} className="flex items-center justify-end gap-1.5">
                      <SkeletonBlock className="h-7 w-7 rounded-lg" />
                      <SkeletonBlock className="h-7 w-7 rounded-lg" />
                    </div>
                  );
                }
                if (colIdx === columns - 2) {
                  return (
                    <div key={`td-skel-${rowIndex}-${colIdx}`}>
                      <SkeletonBlock className="h-5 w-16 rounded-md" />
                    </div>
                  );
                }
                return (
                  <div key={`td-skel-${rowIndex}-${colIdx}`} className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-4/5 rounded-md" />
                    {colIdx === 1 ? <SkeletonBlock className="h-2.5 w-1/2 rounded-md opacity-70" /> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
TableLoadingSkeleton.displayName = 'TableLoadingSkeleton';

export const CardLoadingSkeleton: React.FC<LoadingSkeletonProps> = memo(({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`} role="status" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`card-skel-${index}`}
          className="inventory-reveal rounded-2xl border border-line bg-surface p-5 shadow-2xs"
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                <SkeletonBlock className="h-3 w-1/2 rounded-md opacity-75" />
              </div>
            </div>
            <SkeletonBlock className="h-5 w-16 shrink-0 rounded-md" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-line-soft bg-surface-soft/50 p-3 space-y-1.5">
              <SkeletonBlock className="h-2.5 w-14 rounded-full" />
              <SkeletonBlock className="h-5 w-20 rounded-md" />
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-soft/50 p-3 space-y-1.5">
              <SkeletonBlock className="h-2.5 w-14 rounded-full" />
              <SkeletonBlock className="h-5 w-20 rounded-md" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3.5">
            <SkeletonBlock className="h-3 w-24 rounded-full" />
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-8 w-20 rounded-lg" />
              <SkeletonBlock className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
CardLoadingSkeleton.displayName = 'CardLoadingSkeleton';

export const FormLoadingSkeleton: React.FC<{ className?: string; fields?: number }> = memo(({
  className = '',
  fields = 4,
}) => {
  return (
    <div className={`space-y-5 ${className}`} role="status" aria-live="polite">
      <div className="space-y-1.5 border-b border-line-soft pb-3">
        <SkeletonBlock className="h-4 w-36 rounded-md" />
        <SkeletonBlock className="h-3 w-56 rounded-md opacity-75" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, idx) => (
          <div key={`form-skel-field-${idx}`} className="space-y-2">
            <SkeletonBlock className="h-3 w-24 rounded-full" />
            <SkeletonBlock className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <SkeletonBlock className="h-3 w-28 rounded-full" />
        <SkeletonBlock className="h-20 w-full rounded-lg" />
      </div>
      <div className="flex justify-end gap-2.5 border-t border-line-soft pt-4">
        <SkeletonBlock className="h-9 w-24 rounded-lg" />
        <SkeletonBlock className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
});
FormLoadingSkeleton.displayName = 'FormLoadingSkeleton';

export const FilterLoadingSkeleton: React.FC<{ className?: string }> = memo(({
  className = '',
}) => {
  return (
    <div className={`rounded-xl border border-line bg-surface p-3.5 shadow-2xs ${className}`} role="status" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <SkeletonBlock className="h-9 w-full rounded-lg sm:w-64" />
          <SkeletonBlock className="h-9 w-28 rounded-lg" />
          <SkeletonBlock className="h-9 w-32 rounded-lg hidden md:block" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
          <SkeletonBlock className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
});
FilterLoadingSkeleton.displayName = 'FilterLoadingSkeleton';

interface StatCardSkeletonProps {
  count?: number;
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = memo(({
  count = 4,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-${count} ${className}`}
      role="status"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`stat-skel-${index}`}
          className="inventory-reveal flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-2xs"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <SkeletonBlock className="h-3.5 w-28 rounded-md" />
            <SkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <SkeletonBlock className="h-7 w-24 rounded-md" />
            <SkeletonBlock className="h-3 w-12 rounded-full opacity-75" />
          </div>
          <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
            <div className="flex items-center gap-1.5">
              <SkeletonBlock className="h-2 w-2 rounded-full" />
              <SkeletonBlock className="h-3 w-24 rounded-full" />
            </div>
            <SkeletonBlock className="h-3 w-16 rounded-full opacity-75" />
          </div>
        </div>
      ))}
    </div>
  );
});
StatCardSkeleton.displayName = 'StatCardSkeleton';

export const ListLoadingSkeleton: React.FC<LoadingSkeletonProps> = memo(({
  rows = 4,
  className = '',
}) => {
  return (
    <div className={`divide-y divide-line-soft rounded-xl border border-line bg-surface px-4 py-2 ${className}`} role="status" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`list-skel-${index}`}
          className="inventory-reveal flex items-start justify-between gap-3 py-3"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <SkeletonBlock className="mt-0.5 h-8 w-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3.5 w-32 rounded-md" />
                <SkeletonBlock className="h-4 w-14 rounded-full opacity-75" />
              </div>
              <SkeletonBlock className="h-3 w-4/5 rounded-md opacity-80" />
            </div>
          </div>
          <SkeletonBlock className="h-3 w-14 shrink-0 rounded-full opacity-70" />
        </div>
      ))}
    </div>
  );
});
ListLoadingSkeleton.displayName = 'ListLoadingSkeleton';

export const MatrixTableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}> = memo(({
  rows = 7,
  columns = 8,
  title,
  subtitle,
  className = '',
}) => (
  <div
    className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-2xs ${className}`}
    role="status"
    aria-live="polite"
    aria-label={title || 'Cargando matriz de programación'}
  >
    {/* Top toolbar & context bar */}
    <div className="flex flex-col gap-3 border-b border-line bg-surface-soft/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface inventory-breathe">
          <span className="h-2.5 w-2.5 rounded-full bg-brand animate-ping" />
        </div>
        <div className="space-y-1.5">
          {title ? (
            <p className="text-sm font-semibold text-ink">{title}</p>
          ) : (
            <SkeletonBlock className="h-4 w-48 rounded-md" />
          )}
          {subtitle ? (
            <p className="text-xs text-muted">{subtitle}</p>
          ) : (
            <SkeletonBlock className="h-3 w-64 rounded-md opacity-75" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-8 w-28 rounded-lg" />
        <SkeletonBlock className="h-8 w-32 rounded-lg" />
      </div>
    </div>

    {/* Matrix Table Grid */}
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-line bg-surface-soft/80">
            <th className="w-56 px-4 py-3 text-left">
              <SkeletonBlock className="h-3 w-32 rounded-full" />
            </th>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <th key={`matrix-th-${colIdx}`} className="px-3 py-3 text-right">
                <SkeletonBlock className="ml-auto h-3 w-12 rounded-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft bg-surface">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr
              key={`matrix-tr-${rowIdx}`}
              className="inventory-reveal"
              style={{ animationDelay: `${rowIdx * 35}ms` }}
            >
              <td className="px-4 py-3">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3.5 w-40 rounded-md" />
                  <SkeletonBlock className="h-2.5 w-24 rounded-md opacity-70" />
                </div>
              </td>
              {Array.from({ length: columns }).map((__, colIdx) => (
                <td key={`matrix-td-${rowIdx}-${colIdx}`} className="px-3 py-3 text-right">
                  <SkeletonBlock className="ml-auto h-6 w-14 rounded-md" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
));
MatrixTableSkeleton.displayName = 'MatrixTableSkeleton';

export const ModalImpactSkeleton: React.FC<{ message?: string }> = memo(({
  message = 'Calculando impacto y disponibilidad en tiempo real...',
}) => (
  <div className="space-y-4 py-1" role="status" aria-live="polite" aria-label={message}>
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-soft/60 px-3.5 py-2.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
      </span>
      <span className="text-xs font-medium text-muted-2">{message}</span>
    </div>

    <div className="rounded-xl border border-line bg-surface-soft/40 p-4 space-y-3">
      <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="rounded-lg border border-line-soft bg-surface p-3 space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-md" />
        </div>
        <div className="rounded-lg border border-line-soft bg-surface p-3 space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-md" />
        </div>
        <div className="rounded-lg border border-line-soft bg-surface p-3 space-y-1.5">
          <SkeletonBlock className="h-2.5 w-16 rounded-full" />
          <SkeletonBlock className="h-5 w-20 rounded-md" />
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line-soft bg-surface-soft/70 px-4 py-2.5 flex justify-between">
        <SkeletonBlock className="h-3 w-28 rounded-full" />
        <SkeletonBlock className="h-3 w-20 rounded-full" />
      </div>
      <div className="divide-y divide-line-soft p-3 space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between pt-2.5 first:pt-0">
            <div className="space-y-1.5">
              <SkeletonBlock className="h-3.5 w-36 rounded-md" />
              <SkeletonBlock className="h-2.5 w-24 rounded-md opacity-75" />
            </div>
            <SkeletonBlock className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
));
ModalImpactSkeleton.displayName = 'ModalImpactSkeleton';

export const PageLoadingSkeleton: React.FC<{ className?: string; message?: string }> = memo(({
  className = '',
  message = 'Cargando módulo operativo...',
}) => {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-live="polite" aria-label={message}>
      {/* Header bar skeleton */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonBlock className="h-4 w-44 rounded-md" />
            <SkeletonBlock className="h-3 w-64 rounded-md opacity-75" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
          <SkeletonBlock className="h-8 w-32 rounded-lg" />
        </div>
      </div>

      {/* Stats skeleton */}
      <StatCardSkeleton count={4} />

      {/* Filters skeleton */}
      <FilterLoadingSkeleton />

      {/* Table skeleton */}
      <TableLoadingSkeleton rows={6} columns={5} message={message} />
    </div>
  );
});
PageLoadingSkeleton.displayName = 'PageLoadingSkeleton';

export default {
  SkeletonBlock,
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  FormLoadingSkeleton,
  FilterLoadingSkeleton,
  StatCardSkeleton,
  ListLoadingSkeleton,
  MatrixTableSkeleton,
  ModalImpactSkeleton,
  PageLoadingSkeleton,
};

