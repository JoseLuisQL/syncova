import React, { memo, useRef, useEffect } from 'react';
import { ArrowRight, Clock, User, Buildings, FileText, Package } from '@phosphor-icons/react';
import { usePaginatedActividad } from '../../hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import { ACTIVITY_TYPE_CONFIG } from './constants';
import type { ActividadReciente } from '../../services/dashboardService';

const getActivityIcon = (tipo: ActividadReciente['tipo']) => {
  const iconClass = "h-4 w-4";
  
  switch (tipo) {
    case 'vale_generado':
      return <FileText className={`${iconClass} text-violet-600`} weight="fill" />;
    case 'lote_recibido':
      return <Package className={`${iconClass} text-emerald-600`} weight="fill" />;
    case 'movimiento_registrado':
      return <ArrowRight className={`${iconClass} text-blue-600`} weight="bold" />;
    default:
      return <Clock className={`${iconClass} text-zinc-400`} weight="bold" />;
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
      className="flex items-start gap-3.5 p-4 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 hover:shadow-sm transition-all duration-200"
      role="listitem"
    >
      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-xl bg-white border border-zinc-100 shadow-sm ${config.bg.replace('bg-', 'text-')}`}>
        {getActivityIcon(actividad.tipo)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            {config.label}
          </span>
          <time 
            className="text-[11px] font-semibold text-zinc-400"
            dateTime={new Date(actividad.fecha).toISOString()}
          >
            {formatRelativeTime(actividad.fecha)}
          </time>
        </div>
        <p className="text-[13px] font-medium text-zinc-900 line-clamp-2 leading-relaxed">
          {actividad.descripcion}
        </p>
        {(actividad.usuario || actividad.establecimiento) && (
          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold tracking-wide text-zinc-400">
            {actividad.usuario && (
              <span className="flex items-center gap-1.5">
                <User className="h-3 w-3" weight="bold" aria-hidden="true" />
                <span className="truncate max-w-[100px]">{actividad.usuario}</span>
              </span>
            )}
            {actividad.establecimiento && (
              <span className="flex items-center gap-1.5">
                <Buildings className="h-3 w-3" weight="bold" aria-hidden="true" />
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
      className="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
      aria-label="Actividad reciente"
    >
      <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="text-[14px] font-bold text-zinc-900 flex items-center gap-2.5 tracking-tight">
          <div className="p-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm">
            <Clock className="h-4 w-4 text-zinc-900" weight="bold" aria-hidden="true" />
          </div>
          Registro Contable
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-[12px] font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label={loading ? 'Actualizando actividad' : 'Actualizar actividad'}
        >
          {loading ? 'Cargando...' : 'Recargar'}
        </button>
      </header>

      <div className="p-3">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={5} />
        ) : error ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-8 w-8 text-zinc-300 mb-2" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-bold text-zinc-700 mb-1">Fallo de sincronización</p>
            <p className="text-xs font-medium text-zinc-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs font-bold text-zinc-900 hover:underline"
            >
              Reintentar conexión
            </button>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-full w-full" weight="duotone" />}
            title="Libre de operaciones"
            description="Sin registros en la base de datos temporal."
          />
        ) : (
          <div className="space-y-1" role="list" aria-label="Lista de actividades">
            {data.map((actividad) => (
              <ActividadCard key={actividad.id} actividad={actividad} />
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

ActividadSection.displayName = 'ActividadSection';

export default ActividadSection;
