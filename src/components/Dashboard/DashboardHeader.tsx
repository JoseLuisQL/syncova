import React, { memo, useMemo } from 'react';
import { RefreshCw, Clock, AlertCircle } from 'lucide-react';

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  isStale: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = memo(({
  lastUpdated,
  isStale,
  isLoading,
  onRefresh,
}) => {
  const formattedTime = useMemo(() => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastUpdated]);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Sistema Integral de Gestión de Vacunas
        </p>
      </div>

      <div className="flex items-center gap-3">
        {formattedTime && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Actualizado:</span>
            <span>{formattedTime}</span>
          </div>
        )}

        {isStale && (
          <div 
            className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Desactualizado</span>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
            ${isLoading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 shadow-md hover:shadow-lg'
            }`}
          aria-label={isLoading ? 'Actualizando datos' : 'Actualizar datos del dashboard'}
          aria-busy={isLoading}
        >
          <RefreshCw 
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
            aria-hidden="true" 
          />
          <span className="hidden sm:inline">
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </span>
        </button>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
