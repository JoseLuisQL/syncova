import React, { memo, useMemo } from 'react';
import { ArrowsClockwise, Clock, WarningCircle } from '@phosphor-icons/react';

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
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-zinc-200/60 pb-5">
      <div>
        <h1 className="text-[26px] font-extrabold text-zinc-900 tracking-tight leading-none">
          Panel de Control
        </h1>
        <p className="text-[13px] font-medium text-zinc-500 tracking-wide mt-1.5 capitalize">
          {today}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {formattedTime && (
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400">
            <Clock className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Última actualización:</span>
            <span className="text-zinc-600 font-bold tracking-wider">{formattedTime}</span>
          </div>
        )}

        {isStale && (
          <div 
            className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md uppercase"
            role="status"
            aria-live="polite"
          >
            <WarningCircle className="h-3.5 w-3.5" weight="fill" aria-hidden="true" />
            <span className="hidden sm:inline">Desactualizado</span>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 shadow-sm
            ${isLoading 
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none border border-transparent' 
              : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 hover:shadow-md'
            }`}
          aria-label={isLoading ? 'Actualizando datos' : 'Actualizar datos'}
          aria-busy={isLoading}
        >
          <ArrowsClockwise 
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
            weight="bold"
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
