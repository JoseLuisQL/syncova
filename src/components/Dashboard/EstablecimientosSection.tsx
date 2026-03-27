import React, { memo, useRef, useEffect } from 'react';
import { Heartbeat, Warning, HouseLine } from '@phosphor-icons/react';
import { usePaginatedEstablecimientosDashboard } from '../../hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import type { Establecimiento } from '../../types';

const EstablecimientoCard: React.FC<{ establecimiento: Establecimiento }> = memo(({ establecimiento }) => {
  const isActivo = establecimiento.estado === 'activo';
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`p-2 rounded-xl bg-white border border-zinc-100 shadow-sm ${isActivo ? 'text-blue-600' : 'text-zinc-400'}`}>
          <Heartbeat className="h-4 w-4" weight="fill" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[14px] font-bold text-zinc-900 truncate tracking-tight">
            {establecimiento.nombre}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Cod: {establecimiento.codigo}
            </span>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest border-l border-zinc-200 pl-3">
              {establecimiento.tipo.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 pl-4">
        <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-widest ${
          isActivo 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
        }`}>
          {establecimiento.estado}
        </span>
      </div>
    </div>
  );
});

EstablecimientoCard.displayName = 'EstablecimientoCard';

const EstablecimientosSection: React.FC = memo(() => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedEstablecimientosDashboard(5);
  
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  const handleRefresh = () => {
    refreshRef.current();
  };

  return (
    <section 
      className="bg-white rounded-[24px] border border-zinc-200/60 shadow-sm overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 h-full flex flex-col"
      aria-label="Establecimientos Asignados"
    >
      <header className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="text-[14px] font-bold text-zinc-900 flex items-center gap-2.5 tracking-tight">
          <div className="p-1.5 rounded-lg bg-white border border-zinc-200 shadow-sm">
            <HouseLine className="h-4 w-4 text-zinc-900" weight="bold" aria-hidden="true" />
          </div>
          Establecimientos
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-[12px] font-bold text-zinc-400 hover:text-zinc-900 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label={loading ? 'Actualizando establecimientos' : 'Actualizar establecimientos'}
        >
          {loading ? 'Cargando...' : 'Recargar'}
        </button>
      </header>

      <div className="p-3 flex-1 flex flex-col">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={5} />
        ) : error ? (
          <div className="text-center py-8">
            <Warning className="mx-auto h-8 w-8 text-zinc-300 mb-2" weight="duotone" aria-hidden="true" />
            <p className="text-sm font-bold text-zinc-700 mb-1">Error de carga</p>
            <p className="text-xs font-medium text-zinc-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs font-bold text-zinc-900 hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<HouseLine className="h-full w-full" weight="duotone" />}
            title="Sin establecimientos"
            description="No hay establecimientos vinculados a este centro de acopio."
          />
        ) : (
          <div className="space-y-1">
            {data.map((establecimiento) => (
              <EstablecimientoCard key={establecimiento.id} establecimiento={establecimiento} />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
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

EstablecimientosSection.displayName = 'EstablecimientosSection';

export default EstablecimientosSection;
