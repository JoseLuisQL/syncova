import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import type { StockPorVacuna } from '../../services/dashboardService';

interface StockAvailabilitySectionProps {
  data: StockPorVacuna[];
  isLoading?: boolean;
}

const STATUS_META: Record<
  StockPorVacuna['estado'],
  { label: string; dotClass: string; textClass: string; barClass: string }
> = {
  normal: {
    label: 'Normal',
    dotClass: 'bg-emerald-600',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    barClass: 'bg-emerald-600',
  },
  bajo: {
    label: 'Bajo',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-400',
    barClass: 'bg-amber-500',
  },
  critico: {
    label: 'Crítico',
    dotClass: 'bg-rose-600',
    textClass: 'text-rose-700 dark:text-rose-400',
    barClass: 'bg-rose-600',
  },
};

const StockAvailabilitySection: React.FC<StockAvailabilitySectionProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<'all' | 'alert'>('all');

  const filteredData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const priority = { critico: 0, bajo: 1, normal: 2 };
      if (priority[a.estado] !== priority[b.estado]) {
        return priority[a.estado] - priority[b.estado];
      }
      return b.stockTotal - a.stockTotal;
    });

    if (filterMode === 'alert') {
      return sorted.filter((item) => item.estado !== 'normal' || item.proximosVencer > 0);
    }
    return sorted.slice(0, 7);
  }, [data, filterMode]);

  const alertCount = useMemo(
    () => data.filter((item) => item.estado !== 'normal' || item.proximosVencer > 0).length,
    [data]
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[360px] animate-pulse flex-col rounded-xl border border-line bg-surface p-5">
        <div className="mb-5 h-5 w-44 rounded bg-surface-soft" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 rounded bg-surface-soft" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-ink">
            Disponibilidad por vacuna
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Stock actual frente a stock mínimo requerido
          </p>
        </div>

        {alertCount > 0 && (
          <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface-soft p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filterMode === 'all' ? 'bg-surface text-ink shadow-2xs' : 'text-muted-2 hover:text-ink'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('alert')}
              className={`whitespace-nowrap shrink-0 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filterMode === 'alert' ? 'bg-surface text-ink shadow-2xs' : 'text-muted-2 hover:text-ink'
              }`}
            >
              Observadas ({alertCount})
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 border-b border-line pb-2 text-xs font-medium text-muted">
        <div className="col-span-5">Biológico</div>
        <div className="col-span-4 text-right">Actual / Mín.</div>
        <div className="col-span-3 text-right">Estado</div>
      </div>

      <div className="flex-1 divide-y divide-line-soft">
        {filteredData.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-center text-xs text-muted">
            No hay biológicos con observaciones de stock o vencimiento.
          </div>
        ) : (
          filteredData.map((item) => {
            const status = STATUS_META[item.estado] || STATUS_META.normal;
            const ratio = Math.min(
              100,
              Math.round((item.stockTotal / Math.max(1, item.stockMinimo * 2)) * 100)
            );

            return (
              <div
                key={item.vacunaId}
                className="grid grid-cols-12 items-center gap-2 py-2.5 text-sm"
              >
                <div className="col-span-5 min-w-0 pr-1">
                  <div className="truncate font-medium text-ink">{item.vacunaNombre}</div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <span className="font-mono tabular-nums">{item.lotesActivos} lote{item.lotesActivos === 1 ? '' : 's'}</span>
                    {item.proximosVencer > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {item.proximosVencer} por vencer
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-span-4 text-right">
                  <div className="font-mono text-sm font-semibold text-ink tabular-nums">
                    {item.stockTotal.toLocaleString('es-PE')}
                  </div>
                  <div className="font-mono text-xs text-muted tabular-nums">
                    mín. {item.stockMinimo.toLocaleString('es-PE')}
                  </div>
                </div>

                <div className="col-span-3 flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.textClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} aria-hidden="true" />
                    {status.label}
                  </span>
                  <div className="h-1 w-14 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={`h-full rounded-full ${status.barClass}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 border-t border-line-soft pt-3">
        <button
          type="button"
          onClick={() => navigate('/inventario')}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-600 whitespace-nowrap shrink-0"
        >
          Ver catálogo y lotes de inventario
          <ArrowRight size={13} weight="bold" />
        </button>
      </div>
    </section>
  );
};

export default StockAvailabilitySection;
