import React, { memo } from 'react';
import { Warning, WarningCircle, Info, Bell } from '@phosphor-icons/react';
import { usePaginatedAlertas } from '../../hooks/usePaginatedDashboard';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import type { AlertaReciente } from '../../services/dashboardService';

const getAlertIcon = (tipo: string, nivel: string) => {
  if (nivel === 'critico') return <WarningCircle size={16} className="text-rose-600" weight="fill" />;
  switch (tipo) {
    case 'stock_bajo':
    case 'vencimiento_proximo': return <Warning size={16} className="text-amber-500" weight="fill" />;
    case 'sistema': return <Info size={16} className="text-blue-500" weight="fill" />;
    default: return <Bell size={16} className="text-zinc-400" weight="fill" />;
  }
};

const formatDate = (fecha: Date): string => {
  const date = new Date(fecha);
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
};

const AlertasSection: React.FC = memo(() => {
  const { data, loading, error, pagination } = usePaginatedAlertas(4);

  return (
    <section className="bg-white rounded-md border border-zinc-200 shadow-sm flex flex-col h-full">
      <header className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-zinc-400" />
          <h3 className="text-[15px] font-extrabold text-zinc-900 tracking-tight">Resumen de alertas</h3>
        </div>
        {pagination.total > 0 && (
          <span className="text-[12px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {pagination.total} activas
          </span>
        )}
      </header>

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={4} />
        ) : error ? (
          <div className="text-center text-sm text-rose-600">{error}</div>
        ) : data.length === 0 ? (
          <EmptyState title="Cero incidencias" description="No hay alertas." icon={<Bell />} />
        ) : (
          <div className="space-y-4">
            {data.map((alerta) => (
              <div key={alerta.id} className="flex gap-3 relative pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alerta.tipo, alerta.nivel)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      {alerta.tipo.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap ml-2">
                      {formatDate(alerta.fechaCreacion)}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-zinc-800 leading-snug pr-4">
                    {alerta.mensaje}
                  </p>
                  {alerta.establecimiento && (
                    <p className="text-[12px] font-medium text-zinc-500 mt-1 truncate">
                      {alerta.establecimiento}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 mt-auto">
        <button className="text-[13px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
          Centro de notificaciones <span className="text-lg leading-none">→</span>
        </button>
      </div>
    </section>
  );
});

AlertasSection.displayName = 'AlertasSection';
export default AlertasSection;
