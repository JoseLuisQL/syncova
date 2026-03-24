import React, { memo } from 'react';
import { Save, RefreshCw, Loader2, Link2 } from 'lucide-react';
import { COMPONENT_STYLES } from '../constants';

interface PlanificacionAccionesProps {
  readOnly?: boolean;
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
      <div className={`${COMPONENT_STYLES.mutedPanel} p-5 text-sm text-slate-600`}>
        Esta planificación se muestra en modo de solo lectura para el responsable de acopio. Las acciones de importación,
        guardado, sincronización y recalculo quedan bloqueadas por política de acceso.
      </div>
    );
  }

  return (
    <div className={`${COMPONENT_STYLES.panel} p-4 sm:p-5`}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGuardarProgramacion}
          disabled={isUpdating || isLoading}
          className={COMPONENT_STYLES.button.success}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isUpdating ? 'Guardando...' : 'Guardar programación'}
        </button>

        <button
          type="button"
          onClick={onRecalcular}
          disabled={isLoading}
          className={COMPONENT_STYLES.button.secondary}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isLoading ? 'Cargando...' : 'Recalcular'}
        </button>

        <button
          type="button"
          onClick={onSincronizar}
          disabled={isLoading || isUpdating}
          className={COMPONENT_STYLES.button.primary}
          title="Sincronizar entregas con módulo de movimientos"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          Sincronizar
        </button>

        {pendingChangesCount > 0 ? (
          <button
            type="button"
            onClick={onGuardarPendientes}
            disabled={isUpdating}
            className={COMPONENT_STYLES.button.warning}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar pendientes ({pendingChangesCount})
          </button>
        ) : null}
      </div>
    </div>
  );
});

PlanificacionAcciones.displayName = 'PlanificacionAcciones';
