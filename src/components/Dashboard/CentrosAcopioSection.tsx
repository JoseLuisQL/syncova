import React, { memo } from 'react';
import { MapPin } from '@phosphor-icons/react';
import { usePaginatedCentrosAcopio } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import type { CentroAcopioStatus } from '../../services/dashboardService';

const CentrosAcopioSection: React.FC = memo(() => {
  const { data, loading, error, refresh } = usePaginatedCentrosAcopio(5);

  return (
    <section className="bg-white rounded-md border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
      <header className="px-6 py-5 border-b border-zinc-100 flex items-center gap-2">
        <MapPin size={18} className="text-zinc-400" />
        <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">
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
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Centro logístico</th>
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap text-center">Inst.</th>
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Stock total</th>
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.map((centro) => (
                <tr key={centro.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-[13px] font-bold text-zinc-900 whitespace-nowrap">
                    {centro.nombre}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] font-medium text-zinc-600 text-center">
                    {centro.establecimientos}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] font-extrabold text-zinc-900 tabular-nums text-right">
                    {centro.stockTotal.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${centro.estado === 'activo' ? 'bg-teal-500' : centro.estado === 'alerta' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="text-[12px] font-semibold text-zinc-700 capitalize">
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

      <div className="px-6 py-4 border-t border-zinc-100 mt-auto">
        <button className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
          Ver todos los centros <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

CentrosAcopioSection.displayName = 'CentrosAcopioSection';
export default CentrosAcopioSection;
