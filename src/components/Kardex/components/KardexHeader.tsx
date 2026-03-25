import React, { memo } from 'react';
import { BookOpen, Download, Loader2, RefreshCw } from 'lucide-react';
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
      <div className="border-b border-slate-200/90 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={COMPONENT_STYLES.header.iconWrapper}>
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className={COMPONENT_STYLES.header.title}>Kardex</h1>
              <p className={`${COMPONENT_STYLES.header.subtitle} mt-1`}>
                Trazabilidad por lote, documento y saldo operativo dentro del mismo lenguaje visual del sistema.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={COMPONENT_STYLES.button.secondary}
              aria-busy={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
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
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
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
