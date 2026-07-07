import React, { memo } from 'react';
import { Receipt, Plus, ArrowsClockwise, X, SpinnerGap } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';
import { MODULE_LAYOUT } from '../../../styles/layout';

interface ValesHeaderProps {
  onGenerarVale: () => void;
  onSincronizar: () => void;
  onClose?: () => void;
  isGenerating: boolean;
  isSyncing: boolean;
  centroAcopioSeleccionado: boolean;
}

export const ValesHeader: React.FC<ValesHeaderProps> = memo(({
  onGenerarVale,
  onSincronizar,
  onClose,
  isGenerating,
  isSyncing,
  centroAcopioSeleccionado,
}) => {
  return (
    <header className={COMPONENT_STYLES.header.container}>
      <div className={`${MODULE_LAYOUT.fullWidth} ${MODULE_LAYOUT.pageSpacingX} py-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Titulo */}
          <div className="flex items-center gap-4">
            <div className={COMPONENT_STYLES.header.iconWrapper}>
              <Receipt weight="duotone" className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className={COMPONENT_STYLES.header.title}>
                Vales de Entrega
              </h1>
              <p className={COMPONENT_STYLES.header.subtitle}>
                Gestion de vales por centro de acopio
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {/* Boton principal: Generar Vale */}
            <button type="button"
              onClick={onGenerarVale}
              disabled={!centroAcopioSeleccionado || isGenerating}
              className={COMPONENT_STYLES.button.success}
              title={!centroAcopioSeleccionado ? 'Seleccione un centro de acopio' : 'Generar nuevo vale'}
            >
              {isGenerating ? (
                <SpinnerGap weight="bold" className="h-5 w-5 animate-spin" />
              ) : (
                <Plus weight="bold" className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {isGenerating ? 'Generando...' : 'Generar Vale'}
              </span>
            </button>

            {/* Boton secundario: Sincronizar */}
            <button type="button"
              onClick={onSincronizar}
              disabled={!centroAcopioSeleccionado || isSyncing || isGenerating}
              className={COMPONENT_STYLES.button.secondary}
              title="Sincronizar vales"
            >
              <ArrowsClockwise weight="bold" className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </span>
            </button>

            {/* Boton cerrar (si aplica) */}
            {onClose && (
              <button type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

ValesHeader.displayName = 'ValesHeader';
