import React, { memo } from 'react';
import { DownloadSimple, SpinnerGap, ArrowsClockwise } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

interface KardexHeaderProps {
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingFiltros: boolean;
  onRefresh: () => void;
  onExport: () => void;
  exportando: boolean;
  isExportEnabled: boolean;
}

const KardexHeaderComponent: React.FC<KardexHeaderProps> = ({
  loading,
  loadingEstadisticas,
  loadingFiltros,
  onRefresh,
  onExport,
  exportando,
  isExportEnabled,
}) => {
  const isRefreshing = loading || loadingEstadisticas || loadingFiltros;

  return (
    <section className="bg-transparent pb-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Kardex de Movimientos</h1>
          <p className="text-sm text-zinc-500">
            Consulta de ingresos, salidas, ajustes y transferencias del inventario general.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`${COMPONENT_STYLES.button.secondary} px-4 py-2 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm focus:ring-teal-500/20`}
            aria-busy={isRefreshing}
          >
            {isRefreshing ? (
              <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowsClockwise className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="font-semibold text-sm">Actualizar</span>
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={!isExportEnabled || exportando}
            className={`${COMPONENT_STYLES.button.primary} px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors focus:ring-teal-500/20`}
            aria-busy={exportando}
          >
            {exportando ? (
              <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <DownloadSimple className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="font-semibold text-sm">{exportando ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export const KardexHeader = memo(KardexHeaderComponent);
KardexHeader.displayName = 'KardexHeader';
