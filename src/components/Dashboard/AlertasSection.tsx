import React, { memo, useMemo, useRef, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import { usePaginatedAlertas } from '../../hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import { ALERT_LEVEL_CONFIG } from './constants';
import type { AlertaReciente } from '../../services/dashboardService';

const getAlertIcon = (tipo: string, nivel: string) => {
  const iconClass = "h-4 w-4";
  
  if (nivel === 'critico') {
    return <AlertCircle className={`${iconClass} text-rose-500`} />;
  }
  
  switch (tipo) {
    case 'stock_bajo':
    case 'vencimiento_proximo':
      return <AlertTriangle className={`${iconClass} text-amber-500`} />;
    case 'sistema':
      return <Info className={`${iconClass} text-sky-500`} />;
    default:
      return <Bell className={`${iconClass} text-gray-400`} />;
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
      className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors duration-200"
      role="listitem"
    >
      <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-lg ${config.bg}`}>
        {getAlertIcon(alerta.tipo, alerta.nivel)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {alerta.mensaje}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ${config.badge}`}>
            {alerta.nivel}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
          <time dateTime={new Date(alerta.fechaCreacion).toISOString()}>
            {formatDate(alerta.fechaCreacion)}
          </time>
          {alerta.establecimiento && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{alerta.establecimiento}</span>
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
      className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
      aria-label={`Alertas recientes (${alertCount} total)`}
    >
      <header className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
          </div>
          Alertas Recientes
          {alertCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
              {alertCount}
            </span>
          )}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs font-medium text-gray-400 hover:text-teal-600 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label={loading ? 'Actualizando alertas' : 'Actualizar alertas'}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </header>

      <div className="p-4">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={4} />
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-gray-300 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700 mb-1">Error al cargar</p>
            <p className="text-xs text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Reintentar
            </button>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-full w-full" />}
            title="Sin alertas"
            description="No hay alertas en los últimos 7 días"
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
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </section>
  );
});

AlertasSection.displayName = 'AlertasSection';

export default AlertasSection;
