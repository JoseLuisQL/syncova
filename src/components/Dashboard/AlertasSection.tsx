import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Warning,
  WarningCircle,
  Info,
  Bell,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { usePaginatedAlertas } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const getAlertMeta = (tipo: string, nivel: string) => {
  if (nivel === 'critico') {
    return {
      icon: <WarningCircle size={15} className="text-rose-600" weight="fill" />,
      label: 'Crítica',
      toneClass: 'text-rose-700 dark:text-rose-400',
    };
  }
  if (nivel === 'alto' || tipo === 'vencimiento_proximo' || tipo === 'stock_bajo') {
    return {
      icon: <Warning size={15} className="text-amber-500" weight="fill" />,
      label: tipo === 'vencimiento_proximo' ? 'Vencimiento' : 'Stock bajo',
      toneClass: 'text-amber-700 dark:text-amber-400',
    };
  }
  return {
    icon: <Info size={15} className="text-sky-600" weight="fill" />,
    label: 'Sistema',
    toneClass: 'text-sky-700 dark:text-sky-400',
  };
};

const formatDate = (fecha: Date): string => {
  const date = new Date(fecha);
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const AlertasSection: React.FC = memo(() => {
  const navigate = useNavigate();
  const { data, loading, error, pagination, setPage } = usePaginatedAlertas(4);

  return (
    <section className="flex h-full flex-col rounded-xl border border-line bg-surface shadow-xs">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Alertas operativas
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {pagination.total > 0
              ? `${pagination.total} notificaciones registradas`
              : 'Monitoreo de lotes y cadena de frío'}
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
              aria-label="Página anterior de alertas"
              className="flex h-6 w-6 items-center justify-center rounded border border-line bg-surface text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretLeft size={12} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Página siguiente de alertas"
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
            title="Cero incidencias"
            description="No hay alertas activas en este momento."
            icon={<Bell />}
          />
        ) : (
          <div className="divide-y divide-line-soft">
            {data.map((alerta) => {
              const meta = getAlertMeta(alerta.tipo, alerta.nivel);
              return (
                <div
                  key={alerta.id}
                  className="flex items-start gap-3 py-3 first:pt-1 last:pb-1"
                >
                  <div className="mt-0.5 shrink-0">{meta.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-medium ${meta.toneClass}`}>
                          {meta.label}
                        </span>
                        {alerta.establecimiento && (
                          <>
                            <span className="text-muted" aria-hidden="true">·</span>
                            <span className="truncate text-muted-2">
                              {alerta.establecimiento}
                            </span>
                          </>
                        )}
                      </div>
                      <time className="shrink-0 font-mono text-xs text-muted tabular-nums">
                        {formatDate(alerta.fechaCreacion)}
                      </time>
                    </div>
                    <p className="text-sm font-medium leading-snug text-ink">
                      {alerta.mensaje}
                    </p>
                    {alerta.descripcion && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                        {alerta.descripcion}
                      </p>
                    )}
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
          onClick={() => navigate('/alertas')}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
        >
          Ir al centro de alertas
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  );
});

AlertasSection.displayName = 'AlertasSection';
export default AlertasSection;
