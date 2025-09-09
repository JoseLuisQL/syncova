import React from 'react';
import { Building, Users, AlertTriangle } from 'lucide-react';
import { usePaginatedCentrosAcopio } from '@/hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import type { CentroAcopioStatus } from '@/types/dashboard';

const CentrosAcopioSection: React.FC = () => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedCentrosAcopio(5);

  const getStatusColor = (estado: CentroAcopioStatus['estado']) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'alerta':
        return 'bg-yellow-100 text-yellow-800';
      case 'critico':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (estado: CentroAcopioStatus['estado']) => {
    switch (estado) {
      case 'activo':
        return <Building className="h-5 w-5 text-green-600" />;
      case 'alerta':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critico':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Building className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Centros de Acopio</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Centros de Acopio</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar datos</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={refresh}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Centros de Acopio</h3>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
      
      <div className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay centros de acopio</h3>
            <p className="mt-1 text-sm text-gray-500">No se encontraron centros de acopio activos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((centro) => (
              <div
                key={centro.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(centro.estado)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{centro.nombre}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {centro.establecimientos} establecimientos
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {centro.stockTotal.toLocaleString()} unidades
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(centro.estado)}`}>
                    {centro.estado}
                  </span>
                  {centro.alertas > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {centro.alertas} alertas
                    </span>
                  )}
                </div>
              </div>
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
    </div>
  );
};

export default CentrosAcopioSection;
