import React, { memo } from 'react';
import { Warning, WarningCircle, Info, Bell } from '@phosphor-icons/react';
import { usePaginatedAlertas } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';

const getAlertIcon = (tipo: string, nivel: string) => {
  if (nivel === 'critico') return <WarningCircle size={16} className="text-primary" weight="fill" />;
  switch (tipo) {
    case 'stock_bajo':
    case 'vencimiento_proximo': return <Warning size={16} className="text-tertiary" weight="fill" />;
    case 'sistema': return <Info size={16} className="text-secondary" weight="fill" />;
    default: return <Bell size={16} className="text-secondary" weight="fill" />;
  }
};

const formatDate = (fecha: Date): string => {
  const date = new Date(fecha);
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
};

const AlertasSection: React.FC = memo(() => {
  const { data, loading, error, pagination } = usePaginatedAlertas(4);

  return (
    <section className="flex h-full flex-col rounded-[18px] border border-[#e3e9f0] bg-white shadow-[0_16px_40px_-34px_rgba(15,42,59,0.55)]">
      <header className="flex items-start justify-between border-b border-[#eef1f5] px-5 py-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b2]">Riesgo</p>
          <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[#171b22]">Alertas</h3>
        </div>
        {pagination.total > 0 && (
          <span className="rounded-full border border-[#dceeea] bg-[#effbf8] px-2 py-1 font-mono text-[11px] font-semibold text-[#269b8b]">
            {pagination.total} activas
          </span>
        )}
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto p-5">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={4} />
        ) : error ? (
          <div className="text-center text-sm text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Cero incidencias" description="No hay alertas." icon={<Bell />} />
        ) : (
          <div className="divide-y divide-zinc-100">
            {data.map((alerta) => (
              <div key={alerta.id} className="relative flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="mt-0.5 flex-shrink-0">
                  {getAlertIcon(alerta.tipo, alerta.nivel)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8797]">
                      {alerta.tipo.replace('_', ' ')}
                    </span>
                    <span className="ml-2 whitespace-nowrap font-mono text-[10px] font-medium text-secondary/70">
                      {formatDate(alerta.fechaCreacion)}
                    </span>
                  </div>
                  <p className="pr-4 text-[13px] font-medium leading-snug text-[#171b22]">
                    {alerta.mensaje}
                  </p>
                  {alerta.establecimiento && (
                    <p className="mt-1 truncate text-[12px] font-medium text-secondary">
                      {alerta.establecimiento}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-zinc-100 px-5 py-4">
        <button className="flex items-center gap-1 text-[13px] font-semibold text-[#35bfa8] transition-colors hover:text-[#269b8b]">
          Centro de notificaciones <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

AlertasSection.displayName = 'AlertasSection';
export default AlertasSection;
