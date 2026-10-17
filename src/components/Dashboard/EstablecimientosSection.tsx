import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, ArrowRight, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { usePaginatedEstablecimientosDashboard } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const EstablecimientosSection: React.FC = memo(() => {
  const navigate = useNavigate();
  const { data, loading, error, pagination, setPage } =
    usePaginatedEstablecimientosDashboard(5);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Establecimientos asignados
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {pagination.total > 0 ? `${pagination.total} establecimientos activos` : 'Jurisdicción operativa'}
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
              aria-label="Página anterior de establecimientos"
              className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretLeft size={12} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Página siguiente de establecimientos"
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
            title="Sin establecimientos"
            description="No hay datos disponibles."
            icon={<Hospital />}
          />
        ) : (
          <>
            {/* Vista compacta para móviles (< sm) */}
            <div className="divide-y divide-line-soft sm:hidden">
              {data.map((est) => (
                <div key={`mob-est-${est.id}`} className="flex items-center justify-between gap-2.5 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{est.nombre}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span className="font-mono tabular-nums">{est.codigo}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize truncate">{est.tipo.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium ${
                      est.estado === 'activo'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-muted'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        est.estado === 'activo' ? 'bg-emerald-600' : 'bg-muted'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="capitalize">{est.estado}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Vista de tabla (>= sm) */}
            <table className="hidden sm:table w-full min-w-[380px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-soft/50">
                  <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-medium text-muted">
                    Establecimiento
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-muted">
                    Código
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-muted">
                    Categoría
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-medium text-muted">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft bg-surface">
                {data.map((est) => (
                  <tr key={est.id} className="transition-colors hover:bg-surface-soft/40">
                    <td className="px-4 py-2.5">
                      <div className="truncate text-sm font-medium text-ink">
                        {est.nombre}
                      </div>
                      {est.responsable && (
                        <div className="truncate text-xs text-muted">{est.responsable}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs font-medium text-muted-2 tabular-nums">
                      {est.codigo}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs capitalize text-muted-2">
                      {est.tipo.replace('_', ' ')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <span
                        className={`inline-flex items-center justify-end gap-1.5 text-xs font-medium ${
                          est.estado === 'activo'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-muted'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            est.estado === 'activo' ? 'bg-emerald-600' : 'bg-muted'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="capitalize">{est.estado}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="mt-auto border-t border-line-soft px-5 py-3">
        <button
          type="button"
          onClick={() => navigate('/establecimientos')}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
        >
          Ver todos los establecimientos
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  );
});

EstablecimientosSection.displayName = 'EstablecimientosSection';
export default EstablecimientosSection;
