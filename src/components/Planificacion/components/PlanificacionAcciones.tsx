import React, { memo } from 'react';
import { FloppyDisk, ArrowsClockwise, CircleNotch, Link as LinkIcon } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

interface PlanificacionAccionesProps {
  readOnly?: boolean;
  hideAdminActions?: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  pendingChangesCount: number;
  hasData: boolean;
  onGuardarProgramacion: () => void;
  onRecalcular: () => void;
  onSincronizar: () => void;
  onGuardarPendientes: () => void;
}

export const PlanificacionAcciones: React.FC<PlanificacionAccionesProps> = memo(({
  readOnly = false,
  hideAdminActions = false,
  isLoading,
  isUpdating,
  pendingChangesCount,
  hasData,
  onGuardarProgramacion,
  onRecalcular,
  onSincronizar,
  onGuardarPendientes,
}) => {
  if (!hasData) return null;

  if (readOnly) {
    return (
      <div className="border-t border-line-soft bg-surface-soft px-4 py-3 text-sm font-medium text-muted-2">
        Modo solo lectura. Tu rol puede revisar la matriz, pero no modificarla desde este módulo.
      </div>
    );
  }

  return (
    <div className="border-t border-line-soft bg-surface px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-xs sm:text-sm text-muted-2">
          {pendingChangesCount > 0 ? (
            <span className={COMPONENT_STYLES.badge.warning}>Cambios pendientes: {pendingChangesCount}</span>
          ) : (
            <span className={COMPONENT_STYLES.badge.active}>Matriz actualizada</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        {!hideAdminActions ? (
          <button
            type="button"
            onClick={onGuardarProgramacion}
            disabled={isUpdating || isLoading}
            className={`${COMPONENT_STYLES.button.primary} w-full sm:w-auto justify-center`}
          >
            {isUpdating ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <FloppyDisk className="h-4 w-4" weight="bold" />
            )}
            {isUpdating ? 'Guardando...' : 'Guardar programación'}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRecalcular}
          disabled={isLoading}
          className={`${COMPONENT_STYLES.button.secondary} w-full sm:w-auto justify-center`}
        >
          {isLoading ? (
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          ) : (
            <ArrowsClockwise className="h-4 w-4" weight="bold" />
          )}
          {isLoading ? 'Cargando...' : 'Recalcular'}
        </button>

        {!hideAdminActions ? (
          <button
            type="button"
            onClick={onSincronizar}
            disabled={isLoading || isUpdating}
            className={`${COMPONENT_STYLES.button.primary} w-full sm:w-auto justify-center`}
            title="Sincronizar entregas con módulo de movimientos"
          >
            {isLoading ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <LinkIcon className="h-4 w-4" weight="bold" />
            )}
            Sincronizar movimientos
          </button>
        ) : null}

        {pendingChangesCount > 0 ? (
          <button
            type="button"
            onClick={onGuardarPendientes}
            disabled={isUpdating}
            className={`${COMPONENT_STYLES.button.primary} w-full sm:w-auto justify-center`}
          >
            {isUpdating ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <FloppyDisk className="h-4 w-4" weight="bold" />
            )}
            Guardar cambios ({pendingChangesCount})
          </button>
        ) : null}
        </div>
      </div>
    </div>
  );
});

PlanificacionAcciones.displayName = 'PlanificacionAcciones';
