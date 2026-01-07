import React, { memo } from 'react';
import {
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Receipt,
  Save,
  Loader2
} from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface MovimientosHeaderProps {
  pendingChangesCount: number;
  isAutoSaving: boolean;
  isLoading: boolean;
  isExporting: boolean;
  selectedVacuna: string;
  selectedCentroAcopio: string;
  onSaveChanges: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenVales: () => void;
}

export const MovimientosHeader: React.FC<MovimientosHeaderProps> = memo(({
  pendingChangesCount,
  isAutoSaving,
  isLoading,
  isExporting,
  selectedVacuna,
  selectedCentroAcopio,
  onSaveChanges,
  onRefresh,
  onExport,
  onImport,
  onOpenVales,
}) => {
  return (
    <header className={COMPONENT_STYLES.header.container}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Título */}
          <div className="flex items-center gap-4">
            <div className={COMPONENT_STYLES.header.iconWrapper}>
              <BarChart3 className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className={COMPONENT_STYLES.header.title}>
                Movimientos de Vacunas
              </h1>
              <p className={`${COMPONENT_STYLES.header.subtitle} hidden sm:block`}>
                Gestión de entregas y movimientos por establecimiento
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Guardar cambios pendientes */}
            {pendingChangesCount > 0 && (
              <button
                onClick={onSaveChanges}
                disabled={isAutoSaving}
                className={COMPONENT_STYLES.button.warning}
                title={`Guardar ${pendingChangesCount} cambio(s) pendiente(s)`}
              >
                <Save className={`h-4 w-4 ${isAutoSaving ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Guardar</span>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-xs">
                  {pendingChangesCount}
                </span>
              </button>
            )}

            {/* Vales por Acopio */}
            <button
              onClick={onOpenVales}
              disabled={!selectedVacuna || selectedCentroAcopio === 'todos'}
              className={COMPONENT_STYLES.button.secondary}
              title={selectedCentroAcopio === 'todos' 
                ? 'Seleccione un centro de acopio específico' 
                : 'Ver vales de entrega'}
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden lg:inline">Vales</span>
            </button>

            {/* Actualizar */}
            <button
              onClick={onRefresh}
              disabled={isLoading || !selectedVacuna}
              className={COMPONENT_STYLES.button.secondary}
              title="Actualizar datos"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Actualizar</span>
            </button>

            {/* Importar */}
            <button
              onClick={onImport}
              className={COMPONENT_STYLES.button.secondary}
              title="Importar movimientos desde Excel"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden lg:inline">Importar</span>
            </button>

            {/* Exportar */}
            <button
              onClick={onExport}
              disabled={isExporting || !selectedVacuna}
              className={COMPONENT_STYLES.button.primary}
              title={!selectedVacuna 
                ? 'Seleccione una vacuna para exportar' 
                : 'Exportar a Excel'}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isExporting ? 'Exportando...' : 'Exportar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

MovimientosHeader.displayName = 'MovimientosHeader';
