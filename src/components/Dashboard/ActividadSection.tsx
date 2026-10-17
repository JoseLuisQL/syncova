import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowsLeftRight,
  Clock,
  FileText,
  Package,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { usePaginatedActividad } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const getActivityMeta = (tipo: string) => {
  switch (tipo) {
    case 'vale_generado':
      return {
        icon: <FileText size={14} className="text-brand" weight="duotone" />,
        label: 'Vale emitido',
      };
    case 'lote_recibido':
      return {
        icon: <Package size={14} className="text-sky-600" weight="duotone" />,
        label: 'Ingreso de lote',
      };
    case 'movimiento_registrado':
      return {
        icon: <ArrowsLeftRight size={14} className="text-emerald-600" weight="bold" />,
        label: 'Movimiento',
      };
    default:
      return {
        icon: <Clock size={14} className="text-muted-2" weight="bold" />,
        label: 'Operación',
      };
  }
};

const formatDateShort = (fecha: Date): string => {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha));
};

const ActividadSection: React.FC = memo(() => {
  const navigate = useNavigate();
  const { data, loading, error, pagination, setPage } = usePaginatedActividad(4);

  return (
    <section className="flex h-full flex-col rounded-xl border border-line bg-surface shadow-xs">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Actividad reciente
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Bitácora de operaciones en almacén y red
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
              aria-label="Página anterior de actividad"
              className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretLeft size={12} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Página siguiente de actividad"
              className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretRight size={12} weight="bold" />
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-3">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={3} />
        ) : error ? (
          <div className="py-6 text-center text-xs text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Sin actividad"
            description="No hay registros recientes."
            icon={<Clock />}
          />
        ) : (
          <div className="divide-y divide-line-soft">
            {data.map((actividad) => {
              const meta = getActivityMeta(actividad.tipo);
              return (
                <div
                  key={actividad.id}
                  className="flex items-start gap-2.5 py-2.5 first:pt-1 last:pb-1"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface-soft">
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-muted-2">{meta.label}</span>
                      <time className="shrink-0 font-mono text-xs text-muted tabular-nums">
                        {formatDateShort(actividad.fecha)}
                      </time>
                    </div>
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-ink">
                      {actividad.descripcion}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
                      {actividad.usuario && <span>{actividad.usuario}</span>}
                      {actividad.establecimiento && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{actividad.establecimiento}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-line-soft px-5 py-3">
        <button
          type="button"
          onClick={() => navigate('/kardex')}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
        >
          Consultar Kardex de movimientos
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  );
});

ActividadSection.displayName = 'ActividadSection';
export default ActividadSection;
