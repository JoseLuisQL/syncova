import React, { memo, useState, useCallback } from 'react';
import {
  Clock,
  Package,
  Loader2,
  Zap,
  Trash2,
  Bell,
  Info,
} from 'lucide-react';
import { FormSection } from './FormSection';
import { AlertasService } from '../../../services/alertasService';
import { useToast } from '../../../hooks/useToast';
import { useAlertasGlobal } from '../../../contexts/AlertasContext';

interface ConfiguracionAlertasProps {
  config: {
    diasAnticipacion: number;
    stockMinimo: number;
    diasRetencion: number;
  };
  onUpdate: (field: string, value: number) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export const ConfiguracionAlertas: React.FC<ConfiguracionAlertasProps> = memo(({
  config,
  onUpdate,
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
}) => {
  const { showSuccess, showError } = useToast();
  const { count, refresh } = useAlertasGlobal();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    alertasGeneradas?: number;
    alertasVencimiento?: number;
    alertasStockBajo?: number;
  } | null>(null);

  const handleGenerarAlertas = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await AlertasService.generarAutomaticas(
        config.diasAnticipacion,
        config.stockMinimo
      );
      setLastResult(result);
      if (result.alertasGeneradas > 0) {
        showSuccess(`Se generaron ${result.alertasGeneradas} alertas`);
      } else {
        showSuccess('No se encontraron nuevas alertas para generar');
      }
      await refresh();
    } catch (error) {
      showError('Error al generar alertas');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [config, showSuccess, showError, refresh]);

  const handleLimpiarAntiguas = useCallback(async () => {
    if (!window.confirm(`Eliminar alertas leidas con mas de ${config.diasRetencion} dias?`)) {
      return;
    }
    setIsCleaning(true);
    try {
      const result = await AlertasService.limpiarAntiguas(config.diasRetencion);
      showSuccess(`Se eliminaron ${result.eliminadas} alertas antiguas`);
      await refresh();
    } catch (error) {
      showError('Error al limpiar alertas antiguas');
      console.error(error);
    } finally {
      setIsCleaning(false);
    }
  }, [config.diasRetencion, showSuccess, showError, refresh]);

  return (
    <FormSection
      title="Configuracion de Alertas"
      subtitle="Umbrales de deteccion y acciones"
      icon={Bell}
      iconColor="bg-amber-100 text-amber-600"
      onSave={onSave}
      onReset={onReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
    >
      <div className="space-y-6">
        {/* Indicador de alertas no leídas */}
        {count > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
            <Bell className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-medium text-rose-700">
              Tienes {count} alerta{count > 1 ? 's' : ''} sin leer
            </span>
          </div>
        )}

        {/* Umbrales de Alertas */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Umbrales de Deteccion</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vencimiento */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Alertas de Vencimiento
                  </label>
                  <p className="text-xs text-gray-500">
                    Dias de anticipacion
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="7"
                  max="90"
                  value={config.diasAnticipacion}
                  onChange={(e) => onUpdate('diasAnticipacion', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="w-14 text-center text-lg font-bold text-amber-600">
                  {config.diasAnticipacion}d
                </span>
              </div>
            </div>

            {/* Stock Bajo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Package className="h-4 w-4 text-rose-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Alertas de Stock Bajo
                  </label>
                  <p className="text-xs text-gray-500">
                    Cantidad minima
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={config.stockMinimo}
                  onChange={(e) => onUpdate('stockMinimo', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <span className="w-16 text-center text-lg font-bold text-rose-600">
                  {config.stockMinimo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Generar Alertas */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Generar Alertas Ahora
              </h4>
              <p className="text-teal-100 text-sm mt-1">
                Analiza el inventario segun los umbrales configurados
              </p>
            </div>
            <button
              onClick={handleGenerarAlertas}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-teal-700 font-medium rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50 min-w-[160px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generar
                </>
              )}
            </button>
          </div>

          {lastResult && (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm text-center">
                <div>
                  <div className="text-xl font-bold">{lastResult.alertasVencimiento || 0}</div>
                  <div className="text-teal-200 text-xs">Vencimiento</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{lastResult.alertasStockBajo || 0}</div>
                  <div className="text-teal-200 text-xs">Stock Bajo</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{lastResult.alertasGeneradas || 0}</div>
                  <div className="text-teal-200 text-xs">Total</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Limpieza */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-gray-600" />
                Limpiar Alertas Antiguas
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Elimina alertas leidas con mas de{' '}
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={config.diasRetencion}
                  onChange={(e) => onUpdate('diasRetencion', parseInt(e.target.value) || 30)}
                  className="w-14 px-2 py-0.5 mx-1 border border-gray-300 rounded text-center font-medium"
                />
                dias
              </p>
            </div>
            <button
              onClick={handleLimpiarAntiguas}
              disabled={isCleaning}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {isCleaning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800 mb-1">Como funciona</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>Las alertas se generan al hacer clic en "Generar"</li>
                <li>Una alerta no se regenera por 7 dias aunque se marque como leida</li>
                <li>Guarda los umbrales antes de generar para aplicar los nuevos valores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

ConfiguracionAlertas.displayName = 'ConfiguracionAlertas';

export default ConfiguracionAlertas;
