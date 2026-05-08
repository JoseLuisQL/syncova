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
    <section className="border-b border-[#eeeef3] bg-white px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[1.05rem] font-semibold tracking-tight text-[#15171d]">Kardex de Movimientos</h1>
          <p className="text-sm text-[#747986]">
            Consulta de ingresos, salidas, ajustes y transferencias del inventario general.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={COMPONENT_STYLES.button.secondary}
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
            className={COMPONENT_STYLES.button.primary}
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
