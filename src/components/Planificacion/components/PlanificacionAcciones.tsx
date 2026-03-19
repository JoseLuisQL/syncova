import React, { memo } from 'react';
import { Save, RefreshCw, Loader2, CheckCircle, BarChart3, Building2 } from 'lucide-react';
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
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 shadow-sm">
        Esta planificación se muestra en modo de solo lectura para el responsable de acopio. Las acciones de importación,
        guardado, sincronización y recalculo quedan bloqueadas por política de acceso.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onGuardarProgramacion}
            disabled={isUpdating || isLoading}
            className={COMPONENT_STYLES.button.success}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isUpdating ? 'Guardando...' : 'Guardar Programación'}
          </button>
          
          <button
            onClick={onRecalcular}
            disabled={isLoading}
            className={COMPONENT_STYLES.button.primary}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            {isLoading ? 'Cargando...' : 'Recalcular'}
          </button>
          
          <button
            onClick={onSincronizar}
            disabled={isLoading || isUpdating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
                       bg-gradient-to-r from-cyan-600 to-teal-600 
                       hover:from-cyan-700 hover:to-teal-700 
                       shadow-md hover:shadow-lg transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sincronizar entregas con módulo de movimientos"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
            Sincronizar
          </button>
          
          {pendingChangesCount > 0 && (
            <button
              onClick={onGuardarPendientes}
              disabled={isUpdating}
              className={COMPONENT_STYLES.button.warning}
            >
              {isUpdating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Guardar Pendientes ({pendingChangesCount})
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600 min-w-0">
          {pendingChangesCount > 0 ? (
            <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-2"></div>
              <span className="font-medium">{pendingChangesCount} cambio(s) pendiente(s)</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Todo guardado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PlanificacionAcciones.displayName = 'PlanificacionAcciones';

// Componente de leyenda
export const PlanificacionLeyenda: React.FC = memo(() => {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-4">
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
          <span className="text-gray-700"><strong>Campos editándose:</strong> Auto-guardado en 2s</span>
        </div>
        <div className="flex items-center">
          <BarChart3 className="h-4 w-4 text-emerald-600 mr-2" />
          <span className="text-gray-700"><strong>Total DISA:</strong> Suma consolidada</span>
        </div>
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-teal-600 mr-2" />
          <span className="text-gray-700"><strong>Establecimientos:</strong> Por centro de acopio</span>
        </div>
      </div>
    </div>
  );
});

PlanificacionLeyenda.displayName = 'PlanificacionLeyenda';
