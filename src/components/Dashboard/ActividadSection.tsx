import React, { memo, useRef, useEffect } from 'react';
import { FileText, Package, ArrowRight, Clock, User, Building } from 'lucide-react';
import { usePaginatedActividad } from '../../hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import { ACTIVITY_TYPE_CONFIG } from './constants';
import type { ActividadReciente } from '../../services/dashboardService';

const getActivityIcon = (tipo: ActividadReciente['tipo']) => {
  const iconClass = "h-5 w-5";
  
  switch (tipo) {
    case 'vale_generado':
      return <FileText className={`${iconClass} text-teal-600`} />;
    case 'lote_recibido':
      return <Package className={`${iconClass} text-emerald-600`} />;
    case 'movimiento_registrado':
      return <ArrowRight className={`${iconClass} text-cyan-600`} />;
    default:
      return <Clock className={`${iconClass} text-gray-500`} />;
  }
};

const formatRelativeTime = (fecha: Date): string => {
  const now = new Date();
  const date = new Date(fecha);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const ActividadCard: React.FC<{ actividad: ActividadReciente }> = memo(({ actividad }) => {
  const config = ACTIVITY_TYPE_CONFIG[actividad.tipo] || ACTIVITY_TYPE_CONFIG.movimiento_registrado;

  return (
    <div
      className={`flex items-start gap-3 p-3 ${config.bg} rounded-xl border ${config.border}
        hover:shadow-sm transition-all duration-200`}
      role="listitem"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getActivityIcon(actividad.tipo)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full shadow-sm">
            {config.label}
          </span>
          <time 
            className="text-xs text-gray-500"
            dateTime={new Date(actividad.fecha).toISOString()}
          >
            {formatRelativeTime(actividad.fecha)}
          </time>
        </div>
        <p className="text-sm text-gray-900 line-clamp-2">
          {actividad.descripcion}
        </p>
        {(actividad.usuario || actividad.establecimiento) && (
          <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
            {actividad.usuario && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[100px]">{actividad.usuario}</span>
              </span>
            )}
            {actividad.establecimiento && (
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[100px]">{actividad.establecimiento}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ActividadCard.displayName = 'ActividadCard';

const ActividadSection: React.FC = memo(() => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedActividad(5);

  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  const handleRefresh = () => {
    refreshRef.current();
  };

  return (
    <section 
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      aria-label="Actividad reciente"
    >
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-600" aria-hidden="true" />
          Actividad Reciente
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label={loading ? 'Actualizando actividad' : 'Actualizar actividad'}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </header>

      <div className="p-4">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={5} />
        ) : error ? (
          <div className="text-center py-6">
            <Clock className="mx-auto h-10 w-10 text-rose-400 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900 mb-1">Error al cargar</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Reintentar
            </button>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-full w-full" />}
            title="Sin actividad"
            description="No hay actividad en las últimas 24 horas"
          />
        ) : (
          <div className="space-y-2" role="list" aria-label="Lista de actividades">
            {data.map((actividad) => (
              <ActividadCard key={actividad.id} actividad={actividad} />
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

ActividadSection.displayName = 'ActividadSection';

export default ActividadSection;
