import React, { memo, useMemo } from 'react';
import { ArrowsClockwise, DownloadSimple, MagnifyingGlass, Plus, WarningCircle } from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import SplitText from '../ui/reactbits/text/SplitText';
import ThemeToggle from '../common/ThemeToggle';

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
  const { user } = useAuth();

  const formattedTime = useMemo(() => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastUpdated]);

  const displayName = useMemo(() => {
    if (!user) return 'equipo';
    return user.nombres?.split(' ')[0] || user.usuario || 'equipo';
  }, [user]);

  return (
    <header className="flex min-h-16 flex-col gap-4 border-b border-line bg-surface-soft px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-ink">
          <SplitText
            text={`Hola ${displayName}, bienvenido de vuelta`}
            tag="span"
            splitType="words"
            delay={45}
            duration={0.5}
            from={{ opacity: 0, y: 10 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="left"
            className="text-xl font-semibold tracking-[-0.02em] text-ink"
          />
        </h1>
        {formattedTime && (
          <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-2">
            Actualizado {formattedTime}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <ThemeToggle />
        <label className="relative hidden min-w-[220px] md:block">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" weight="bold" />
          <input
            type="search"
            placeholder="Buscar"
            className="h-10 w-full rounded-[12px] border border-line bg-surface pl-9 pr-12 text-sm font-medium text-ink outline-none transition-colors placeholder:text-muted focus:border-[#0e9f8e]"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted">⌘ K</span>
        </label>

        {isStale && (
          <div
            className="flex h-10 items-center gap-1.5 rounded-[12px] border border-line bg-surface px-3 text-xs font-semibold uppercase tracking-wider text-muted-2"
            role="status"
            aria-live="polite"
          >
            <WarningCircle className="h-3.5 w-3.5" weight="fill" aria-hidden="true" />
            <span className="hidden sm:inline">Desactualizado</span>
          </div>
        )}

        <button type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className={`flex h-10 items-center justify-center gap-2 rounded-[12px] border px-3 text-sm font-semibold
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0e9f8e]/20
            ${isLoading
              ? 'cursor-not-allowed border-line bg-surface-soft text-muted'
              : 'border-line bg-surface text-ink hover:border-[#0e9f8e]'
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

        <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-[12px] border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-[#0e9f8e]">
          <DownloadSimple className="h-4 w-4" weight="bold" />
          Exportar CSV
        </button>

        <button type="button" className="flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#0a8276] bg-[#0e9f8e] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0a8276]">
          <Plus className="h-4 w-4" weight="bold" />
          Nuevo
        </button>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
