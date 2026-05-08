import React, { memo } from 'react';
import { MapPin } from '@phosphor-icons/react';
import { usePaginatedCentrosAcopio } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const CentrosAcopioSection: React.FC = memo(() => {
  const { data, loading, error } = usePaginatedCentrosAcopio(5);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e3e9f0] bg-white shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
      <header className="border-b border-[#eef1f5] px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b2]">Red</p>
        <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#171b22]">
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
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="border-b border-[#eef1f5] bg-[#f8fbfd]">
                <th className="whitespace-nowrap px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Centro logístico</th>
                <th className="whitespace-nowrap px-5 py-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Inst.</th>
                <th className="whitespace-nowrap px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Stock total</th>
                <th className="whitespace-nowrap px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.map((centro) => (
                <tr key={centro.id} className="transition-colors hover:bg-neutral/50">
                  <td className="whitespace-nowrap px-5 py-3.5 text-[13px] font-semibold text-[#171b22]">
                    {centro.nombre}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-[13px] font-medium text-secondary">
                    {centro.establecimientos}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] font-semibold text-primary tabular-nums">
                    {centro.stockTotal.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 ${centro.estado === 'activo' ? 'bg-tertiary' : centro.estado === 'alerta' ? 'bg-secondary' : 'bg-primary'}`} />
                      <span className="text-[12px] font-medium capitalize text-secondary">
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
        <button className="flex items-center gap-1 text-[13px] font-semibold text-[#35bfa8] transition-colors hover:text-[#269b8b]">
          Ver todos los centros <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

CentrosAcopioSection.displayName = 'CentrosAcopioSection';
export default CentrosAcopioSection;
