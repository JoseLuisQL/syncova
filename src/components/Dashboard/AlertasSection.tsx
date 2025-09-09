import React from 'react';
import {
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Bell
} from 'lucide-react';
import { usePaginatedAlertas } from '@/hooks/usePaginatedDashboard';
import Pagination from './Pagination';
import type { AlertaReciente } from '@/types/dashboard';

const AlertasSection: React.FC = () => {
  const { data, pagination, loading, error, currentPage, setPage, refresh } = usePaginatedAlertas(3);

  const getAlertIcon = (tipo: AlertaReciente['tipo'], nivel: AlertaReciente['nivel']) => {
    if (nivel === 'critico') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    switch (tipo) {
      case 'stock_bajo':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'vencimiento_proximo':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'sistema':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'entrega':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (nivel: AlertaReciente['nivel']) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-50 border-red-200';
      case 'alto':
        return 'bg-orange-50 border-orange-200';
      case 'medio':
        return 'bg-yellow-50 border-yellow-200';
      case 'bajo':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNivelBadgeColor = (nivel: AlertaReciente['nivel']) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-100 text-red-800';
      case 'alto':
        return 'bg-orange-100 text-orange-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'bajo':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
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
          <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error al cargar alertas</h3>
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
        <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
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
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alertas recientes</h3>
            <p className="mt-1 text-sm text-gray-500">No se encontraron alertas en los últimos 7 días.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((alerta) => (
              <div
                key={alerta.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border ${getAlertColor(alerta.nivel)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alerta.tipo, alerta.nivel)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alerta.mensaje}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNivelBadgeColor(alerta.nivel)}`}>
                      {alerta.nivel}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                    <span>{formatFecha(alerta.fechaCreacion)}</span>
                    {alerta.establecimiento && (
                      <span>• {alerta.establecimiento}</span>
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

export default AlertasSection;
