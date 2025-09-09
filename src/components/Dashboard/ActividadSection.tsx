import React from 'react';
import {
  FileText,
  Package,
  ArrowRight,
  Clock,
  User,
  Building
} from 'lucide-react';
import { usePaginatedActividad } from '@/hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import type { ActividadReciente } from '@/types/dashboard';

const ActividadSection: React.FC = () => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedActividad(5);

  const getActivityIcon = (tipo: ActividadReciente['tipo']) => {
    switch (tipo) {
      case 'vale_generado':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'lote_recibido':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'movimiento_registrado':
        return <ArrowRight className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (tipo: ActividadReciente['tipo']) => {
    switch (tipo) {
      case 'vale_generado':
        return 'bg-blue-50 border-blue-200';
      case 'lote_recibido':
        return 'bg-green-50 border-green-200';
      case 'movimiento_registrado':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTipoLabel = (tipo: ActividadReciente['tipo']) => {
    switch (tipo) {
      case 'vale_generado':
        return 'Vale Generado';
      case 'lote_recibido':
        return 'Lote Recibido';
      case 'movimiento_registrado':
        return 'Movimiento';
      default:
        return 'Actividad';
    }
  };

  const formatFecha = (fecha: Date) => {
    const now = new Date();
    const activityDate = new Date(fecha);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Hace un momento';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(activityDate);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar actividad</h3>
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
        <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
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
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividad reciente</h3>
            <p className="mt-1 text-sm text-gray-500">No se registró actividad en las últimas 24 horas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((actividad) => (
              <div
                key={actividad.id}
                className={`flex items-start space-x-4 p-3 rounded-lg border ${getActivityColor(actividad.tipo)} hover:shadow-sm transition-shadow`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(actividad.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                        {getTipoLabel(actividad.tipo)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFecha(actividad.fecha)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-900">
                    {actividad.descripcion}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    {actividad.usuario && (
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {actividad.usuario}
                      </div>
                    )}
                    {actividad.establecimiento && (
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {actividad.establecimiento}
                      </div>
                    )}
                  </div>
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

export default ActividadSection;
