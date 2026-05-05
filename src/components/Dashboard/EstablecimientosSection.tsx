import React, { memo } from 'react';
import { Hospital } from '@phosphor-icons/react';
import { usePaginatedEstablecimientosDashboard } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const EstablecimientosSection: React.FC = memo(() => {
  const { data, loading, error } = usePaginatedEstablecimientosDashboard(5);

  return (
    <section className="bg-white rounded-md border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
      <header className="px-6 py-5 border-b border-zinc-100 flex items-center gap-2">
        <Hospital size={18} className="text-zinc-400" />
        <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">
          Establecimientos
        </h3>
      </header>

      <div className="flex-1 overflow-x-auto">
        {loading && data.length === 0 ? (
          <div className="p-6"><SectionSkeleton rows={4} /></div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Sin establecimientos" description="No hay datos disponibles." icon={<Hospital />} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Establecimiento</th>
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap text-center">Código</th>
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Tipo</th>
                <th className="px-6 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.map((est) => (
                <tr key={est.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-[13px] font-bold text-zinc-900 whitespace-nowrap">
                    {est.nombre}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] font-medium text-zinc-600 text-center">
                    {est.codigo}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] font-medium text-zinc-600 text-right capitalize">
                    {est.tipo.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${est.estado === 'activo' ? 'bg-teal-500' : 'bg-zinc-300'}`} />
                      <span className="text-[12px] font-semibold text-zinc-700 capitalize">
                        {est.estado}
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
          Ver todos los establecimientos <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

EstablecimientosSection.displayName = 'EstablecimientosSection';
export default EstablecimientosSection;
