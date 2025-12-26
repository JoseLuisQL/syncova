import React, { memo, useCallback } from 'react';
import { Building, Users, AlertTriangle } from 'lucide-react';
import { usePaginatedCentrosAcopio } from '../../hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import { EmptyState, SectionSkeleton } from './LoadingStates';
import { CENTER_STATUS_CONFIG } from './constants';
import type { CentroAcopioStatus } from '../../services/dashboardService';

const CentroAcopioCard: React.FC<{ centro: CentroAcopioStatus }> = memo(({ centro }) => {
  const config = CENTER_STATUS_CONFIG[centro.estado] || CENTER_STATUS_CONFIG.activo;

  return (
    <div
      className={`flex items-center justify-between p-3.5 ${config.bg} rounded-xl 
        hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <Building className={`h-5 w-5 ${config.icon}`} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {centro.nombre}
          </h4>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {centro.establecimientos}
            </span>
            <span className="text-xs text-gray-500">
              {centro.stockTotal.toLocaleString()} uds
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${config.badge}`}>
          {centro.estado}
        </span>
        {centro.alertas > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            {centro.alertas}
          </span>
        )}
      </div>
    </div>
  );
});

CentroAcopioCard.displayName = 'CentroAcopioCard';

const CentrosAcopioSection: React.FC = memo(() => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedCentrosAcopio(5);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <section 
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      aria-label="Centros de Acopio"
    >
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Building className="h-5 w-5 text-teal-600" aria-hidden="true" />
          Centros de Acopio
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50 
            disabled:cursor-not-allowed transition-colors"
          aria-label={loading ? 'Actualizando centros' : 'Actualizar centros de acopio'}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </header>

      <div className="p-4">
        {loading && data.length === 0 ? (
          <SectionSkeleton rows={5} />
        ) : error ? (
          <div className="text-center py-6">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400 mb-2" aria-hidden="true" />
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
            icon={<Building className="h-full w-full" />}
            title="Sin centros de acopio"
            description="No hay centros registrados"
          />
        ) : (
          <div className="space-y-2">
            {data.map((centro) => (
              <CentroAcopioCard key={centro.id} centro={centro} />
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

CentrosAcopioSection.displayName = 'CentrosAcopioSection';

export default CentrosAcopioSection;
