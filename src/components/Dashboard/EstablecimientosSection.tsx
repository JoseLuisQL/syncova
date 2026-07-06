import React, { memo } from 'react';
import { Hospital } from '@phosphor-icons/react';
import { usePaginatedEstablecimientosDashboard } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const EstablecimientosSection: React.FC = memo(() => {
  const { data, loading, error } = usePaginatedEstablecimientosDashboard(5);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e3e9f0] bg-white shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
      <header className="border-b border-[#eef1f5] px-5 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b2]">Red</p>
        <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#171b22]">
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
          <table className="w-full min-w-[360px] border-collapse text-left">
            <thead>
              <tr className="bg-[#fbfafd]">
                <th className="whitespace-nowrap px-3 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b] sm:px-5">Establecimiento</th>
                <th className="whitespace-nowrap px-3 py-3 text-center text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b] sm:px-5">Código</th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b] sm:px-5">Tipo</th>
                <th className="whitespace-nowrap px-3 py-3 text-right text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b] sm:px-5">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((est) => (
                <tr key={est.id} className="border-b border-[#eeeef3] transition-colors hover:bg-[#fbfafd]">
                  <td className="whitespace-nowrap px-3 py-3.5 text-[13px] font-semibold text-[#171b22] sm:px-5">
                    {est.nombre}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-[13px] font-medium text-secondary sm:px-5">
                    {est.codigo}
                  </td>
                  <td className="px-3 py-3.5 text-right text-[13px] font-medium capitalize text-secondary sm:px-5">
                    {est.tipo.replace('_', ' ')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right sm:px-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`h-1.5 w-1.5 ${est.estado === 'activo' ? 'bg-tertiary' : 'bg-secondary'}`} />
                      <span className="text-[12px] font-medium capitalize text-secondary">
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

      <div className="mt-auto border-t border-zinc-100 px-5 py-4">
        <button className="flex items-center gap-1 text-[13px] font-semibold text-[#35bfa8] transition-colors hover:text-[#269b8b]">
          Ver todos los establecimientos <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

EstablecimientosSection.displayName = 'EstablecimientosSection';
export default EstablecimientosSection;
