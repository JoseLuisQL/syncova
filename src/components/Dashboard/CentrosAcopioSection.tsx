import React, { memo } from 'react';
import { MapPin } from '@phosphor-icons/react';
import { usePaginatedCentrosAcopio } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const CentrosAcopioSection: React.FC = memo(() => {
  const { data, loading, error } = usePaginatedCentrosAcopio(5);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
      <header className="border-b border-line px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Red</p>
        <h3 className="mt-1 text-md font-semibold tracking-[-0.02em] text-ink">
          Centros logísticos
        </h3>
      </header>

      <div className="flex-1 overflow-x-auto">
        {loading && data.length === 0 ? (
          <div className="p-6"><SectionSkeleton rows={4} /></div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Sin centros" description="No hay datos disponibles." icon={<MapPin />} />
        ) : (
          <table className="w-full min-w-[360px] border-collapse text-left">
            <thead>
              <tr className="bg-surface-soft">
                <th className="whitespace-nowrap px-3 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-muted sm:px-5">Centro logístico</th>
                <th className="whitespace-nowrap px-3 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-muted sm:px-5">Inst.</th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-[0.78rem] font-medium tracking-[-0.01em] text-muted sm:px-5">Stock total</th>
                <th className="whitespace-nowrap px-3 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-muted sm:px-5">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {data.map((centro) => (
                <tr key={centro.id} className="border-b border-line-soft transition-colors hover:bg-surface-soft">
                  <td className="whitespace-nowrap px-3 py-3.5 text-base font-semibold text-ink sm:px-5">
                    {centro.nombre}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-base font-medium text-muted-2 sm:px-5">
                    {centro.establecimientos}
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono text-base font-semibold text-ink tabular-nums sm:px-5">
                    {centro.stockTotal.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 sm:px-5">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${centro.estado === 'activo' ? 'bg-emerald-500' : centro.estado === 'alerta' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="text-sm font-medium capitalize text-muted-2">
                        {centro.estado}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-auto border-t border-zinc-100 px-5 py-4">
        <button type="button" className="flex items-center gap-1 text-base font-semibold text-[#0e9f8e] transition-colors hover:text-[#0a8276]">
          Ver todos los centros <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

CentrosAcopioSection.displayName = 'CentrosAcopioSection';
export default CentrosAcopioSection;
