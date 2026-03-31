import React, { memo, useMemo, useRef, useEffect } from 'react';
import { Warning, WarningCircle, Info, Bell } from '@phosphor-icons/react';
import { usePaginatedAlertas } from '../../hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import { ALERT_LEVEL_CONFIG } from './constants';
import type { AlertaReciente } from '../../services/dashboardService';

const getAlertIcon = (tipo: string, nivel: string) => {
  const iconClass = "h-4 w-4";
  
  if (nivel === 'critico') {
    return <WarningCircle className={`${iconClass} text-rose-600`} weight="fill" />;
  }
  
  switch (tipo) {
    case 'stock_bajo':
    case 'vencimiento_proximo':
      return <Warning className={`${iconClass} text-amber-600`} weight="fill" />;
    case 'sistema':
      return <Info className={`${iconClass} text-blue-600`} weight="fill" />;
    default:
      return <Bell className={`${iconClass} text-zinc-400`} weight="fill" />;
  }
};

const formatDate = (fecha: Date): string => {
  const date = new Date(fecha);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const AlertaCard: React.FC<{ alerta: AlertaReciente }> = memo(({ alerta }) => {
  const config = ALERT_LEVEL_CONFIG[alerta.nivel as keyof typeof ALERT_LEVEL_CONFIG] 
    || ALERT_LEVEL_CONFIG.bajo;

  return (
    <div
      className="flex items-start gap-3.5 p-4 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 hover:shadow-sm transition-all duration-200"
      role="listitem"
    >
      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-xl bg-white border border-zinc-100 shadow-sm ${config.bg.replace('bg-', 'text-')}`}>
        {getAlertIcon(alerta.tipo, alerta.nivel)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-bold text-zinc-900 line-clamp-2 leading-relaxed tracking-tight">
            {alerta.mensaje}
          </p>
          <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-widest flex-shrink-0 ${config.badge}`}>
            {alerta.nivel}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
          <time dateTime={new Date(alerta.fechaCreacion).toISOString()}>
            {formatDate(alerta.fechaCreacion)}
          </time>
          {alerta.establecimiento && (
            <>
              <span aria-hidden="true" className="text-zinc-300">•</span>
              <span className="truncate max-w-[150px] font-bold text-zinc-500">{alerta.establecimiento}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AlertaCard.displayName = 'AlertaCard';

const AlertasSection: React.FC = memo(() => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedAlertas(4);

  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  const handleRefresh = () => {
    refreshRef.current();
  };

  const alertCount = useMemo(() => pagination.total, [pagination.total]);

  return (
    <section 
      className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
      aria-label={`Alertas recientes (${alertCount} total)`}
    >
      <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="text-[14px] font-bold text-zinc-900 flex items-center gap-2.5 tracking-tight">
          <div className="p-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm">
            <Warning className="h-4 w-4 text-zinc-900" weight="bold" aria-hidden="true" />
          </div>
          Centro de Alertas
          {alertCount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-600 text-white shadow-sm ml-1">
              {alertCount}
            </span>
          )}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-[12px] font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label={loading ? 'Actualizando alertas' : 'Actualizar alertas'}
        >
          {loading ? 'Cargando...' : 'Recargar'}
        </button>
      </header>

      <div className="p-3">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={4} />
        ) : error ? (
          <div className="text-center py-8">
            <Warning className="mx-auto h-8 w-8 text-zinc-300 mb-2" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-bold text-zinc-700 mb-1">Fallo de lectura</p>
            <p className="text-xs font-medium text-zinc-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs font-bold text-zinc-900 hover:underline"
            >
              Reconectar
            </button>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-full w-full" weight="duotone" />}
            title="Sistemas operativos nominales"
            description="Cero incidencias reportadas en el periodo."
          />
        ) : (
          <div className="space-y-1" role="list" aria-label="Lista de alertas">
            {data.map((alerta) => (
              <AlertaCard key={alerta.id} alerta={alerta} />
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="border-t border-zinc-100 px-4 py-3 bg-zinc-50/30">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
          />
        </div>
      )}
    </section>
  );
});

AlertasSection.displayName = 'AlertasSection';

export default AlertasSection;
