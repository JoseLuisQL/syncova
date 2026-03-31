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
    <section className="overflow-hidden bg-transparent">
      <div className="border-b border-zinc-200/90 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
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
              <span>Actualizar</span>
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
              <span>{exportando ? 'Exportando...' : 'Exportar Excel'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const KardexHeader = memo(KardexHeaderComponent);
KardexHeader.displayName = 'KardexHeader';
 