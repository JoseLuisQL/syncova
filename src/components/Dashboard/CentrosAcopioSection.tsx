import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { usePaginatedCentrosAcopio } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const ESTADO_META: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  activo: {
    label: 'Operativo',
    dot: 'bg-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  alerta: {
    label: 'Con alerta',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  critico: {
    label: 'Crítico',
    dot: 'bg-rose-600',
    text: 'text-rose-700 dark:text-rose-400',
  },
};

const CentrosAcopioSection: React.FC = memo(() => {
  const navigate = useNavigate();
  const { data, loading, error, pagination, setPage } = usePaginatedCentrosAcopio(5);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Centros de acopio
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {pagination.total > 0 ? `${pagination.total} centros registrados en red` : 'Red logística regional'}
          </p>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="font-mono tabular-nums">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Página anterior de centros"
              className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretLeft size={12} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Página siguiente de centros"
              className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretRight size={12} weight="bold" />
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-x-auto">
        {loading && data.length === 0 ? (
          <div className="p-5">
            <SectionSkeleton rows={4} />
          </div>
        ) : error ? (
          <div className="p-5 text-center text-xs text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Sin centros de acopio"
            description="No hay datos disponibles."
            icon={<MapPin />}
          />
        ) : (
          <table className="w-full min-w-[380px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-surface-soft/50">
                <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">
                  Centro de acopio
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-muted">
                  EESS
                </th>
                <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-muted">
                  Dosis disp.
                </th>
                <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-medium text-muted">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft bg-surface">
              {data.map((centro) => {
                const status = ESTADO_META[centro.estado] || ESTADO_META.activo;
                return (
                  <tr
                    key={centro.id}
                    className="transition-colors hover:bg-surface-soft/40"
                  >
                    <td className="px-4 py-2.5">
                      <div className="truncate text-sm font-medium text-ink">
                        {centro.nombre}
                      </div>
                      {centro.responsable && (
                        <div className="truncate text-xs text-muted">
                          {centro.responsable}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-sm text-muted-2 tabular-nums">
                      {centro.establecimientos}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-sm font-semibold text-ink tabular-nums">
                      {centro.stockTotal.toLocaleString('es-PE')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <span className={`inline-flex items-center justify-end gap-1.5 text-xs font-medium ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-auto border-t border-line-soft px-5 py-3">
        <button
          type="button"
          onClick={() => navigate('/establecimientos')}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
        >
          Gestionar centros y establecimientos
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  );
});

CentrosAcopioSection.displayName = 'CentrosAcopioSection';
export default CentrosAcopioSection;
