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
      <div className={`${COMPONENT_STYLES.mutedPanel} p-4 sm:p-5 text-sm font-semibold tracking-tight text-zinc-500`}>
        Matriz de planificación estática. El rol de operador de acopio desactiva permisiones de edición directas en esta capa.
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-zinc-200/90 bg-white shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {!hideAdminActions ? (
          <button
            type="button"
            onClick={onGuardarProgramacion}
            disabled={isUpdating || isLoading}
            className={COMPONENT_STYLES.button.primary}
          >
            {isUpdating ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <FloppyDisk className="h-4 w-4" weight="bold" />
            )}
            {isUpdating ? 'Fijando...' : 'Fijar programación'}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRecalcular}
          disabled={isLoading}
          className={COMPONENT_STYLES.button.secondary}
        >
          {isLoading ? (
            <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
          ) : (
            <ArrowsClockwise className="h-4 w-4" weight="bold" />
          )}
          {isLoading ? 'Cargando...' : 'Recalcular Matriz'}
        </button>

        {!hideAdminActions ? (
          <button
            type="button"
            onClick={onSincronizar}
            disabled={isLoading || isUpdating}
            className={COMPONENT_STYLES.button.primary}
            title="Sincronizar entregas con módulo de movimientos"
          >
            {isLoading ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <LinkIcon className="h-4 w-4" weight="bold" />
            )}
            Sincronizar
          </button>
        ) : null}

        {pendingChangesCount > 0 ? (
          <button
            type="button"
            onClick={onGuardarPendientes}
            disabled={isUpdating}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-amber-950 shadow-sm transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <FloppyDisk className="h-4 w-4" weight="bold" />
            )}
            Guardar mutaciones ({pendingChangesCount})
          </button>
        ) : null}
      </div>
    </div>
  );
});

PlanificacionAcciones.displayName = 'PlanificacionAcciones';
