import React, { memo } from 'react';
import {
  BookOpen,
  RefreshCw,
  Download,
  Loader2,
  Activity,
} from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface KardexHeaderProps {
  loading: boolean;
  loadingEstadisticas: boolean;
  loadingFiltros: boolean;
  onRefresh: () => void;
  onExport: () => void;
  exportando: boolean;
  isExportEnabled: boolean;
  exportTooltip: string;
}

export const KardexHeader: React.FC<KardexHeaderProps> = memo(({
  loading,
  loadingEstadisticas,
  loadingFiltros,
  onRefresh,
  onExport,
  exportando,
  isExportEnabled,
  exportTooltip,
}) => {
  const isLoading = loading || loadingEstadisticas || loadingFiltros;

  return (
    <header className={COMPONENT_STYLES.header.wrapper}>
      <div className={COMPONENT_STYLES.header.container}>
        <div className="flex items-center justify-between">
          {/* Título y branding */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {/* Efecto glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              {/* Badge de icono */}
              <div className={COMPONENT_STYLES.header.iconBadge}>
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className={COMPONENT_STYLES.header.title}>
                Kardex de Inventario
              </h1>
              <p className={COMPONENT_STYLES.header.subtitle}>
                Trazabilidad y control de movimientos
              </p>
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center gap-3">
            {/* Indicador de sincronización */}
            {isLoading && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                <Activity className="h-4 w-4 text-teal-600 animate-pulse" />
                <span className="text-sm font-medium text-teal-700">Sincronizando...</span>
              </div>
            )}

            {/* Botón Actualizar */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={COMPONENT_STYLES.button.secondary}
              title="Actualizar datos"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Botón Exportar */}
            <button
              onClick={onExport}
              disabled={!isExportEnabled || exportando}
              className={COMPONENT_STYLES.button.primary}
              title={exportTooltip}
            >
              {exportando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{exportando ? 'Exportando...' : 'Exportar Excel'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

KardexHeader.displayName = 'KardexHeader';
