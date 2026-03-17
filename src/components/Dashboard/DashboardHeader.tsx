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

  const today = useMemo(() => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Panel de Control
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          {today}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {formattedTime && (
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Última actualización</span>
            <span>{formattedTime}</span>
          </div>
        )}

        {isStale && (
          <div 
            className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"
            role="status"
            aria-live="polite"
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Desactualizado</span>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-1
            ${isLoading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300 hover:text-teal-700 hover:shadow-sm'
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
