import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  Clock,
  Package,
  Loader2,
  Check,
  RefreshCw,
  Zap,
  Trash2,
  Settings,
  Bell,
  Info,
} from 'lucide-react';
import { AlertasService } from '../../services/alertasService';
import { useToast } from '../../hooks/useToast';
import { useAlertasGlobal } from '../../contexts/AlertasContext';

interface ConfiguracionLocal {
  diasAnticipacion: number;
  stockMinimo: number;
  diasRetencion: number;
}

const defaultConfig: ConfiguracionLocal = {
  diasAnticipacion: 30,
  stockMinimo: 100,
  diasRetencion: 30,
};

const loadConfig = (): ConfiguracionLocal => {
  try {
    const saved = localStorage.getItem('alertas_umbrales_v3');
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return defaultConfig;
};

const saveConfig = (config: ConfiguracionLocal) => {
  localStorage.setItem('alertas_umbrales_v3', JSON.stringify(config));
};

const ConfiguracionAlertas: React.FC = memo(() => {
  const { showSuccess, showError } = useToast();
  const { count, refresh } = useAlertasGlobal();
  
  const [config, setConfig] = useState<ConfiguracionLocal>(loadConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    alertasGeneradas?: number;
    alertasVencimiento?: number;
    alertasStockBajo?: number;
  } | null>(null);

  // Guardar config cuando cambia
  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const handleUpdate = useCallback((field: keyof ConfiguracionLocal, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Restablecer la configuracion a valores por defecto?')) {
      setConfig(defaultConfig);
      showSuccess('Configuracion restablecida');
    }
  }, [showSuccess]);

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
      // Refrescar el contexto global
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
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600" />
            Configuracion de Alertas
          </h2>
          <p className="text-sm text-gray-600">
            Define los umbrales y genera alertas manualmente
          </p>
        </div>
        <div className="flex items-center gap-3">
          {count > 0 && (
            <span className="px-3 py-1 text-sm font-medium bg-rose-100 text-rose-700 rounded-full flex items-center gap-1">
              <Bell className="h-3.5 w-3.5" />
              {count} sin leer
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Restablecer
          </button>
        </div>
      </div>

      {/* Umbrales de Alertas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-6">Umbrales de Deteccion</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vencimiento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Alertas de Vencimiento
                </label>
                <p className="text-xs text-gray-500">
                  Dias de anticipacion antes del vencimiento
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="7"
                max="90"
                value={config.diasAnticipacion}
                onChange={(e) => handleUpdate('diasAnticipacion', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="w-16 text-center text-lg font-bold text-amber-600">
                {config.diasAnticipacion}d
              </span>
            </div>
            <p className="text-xs text-gray-500 bg-amber-50 p-2 rounded-lg">
              Ejemplo: Si un lote vence el 30 de enero y configuras 15 dias, 
              la alerta se generara el 15 de enero.
            </p>
          </div>

          {/* Stock Bajo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Package className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Alertas de Stock Bajo
                </label>
                <p className="text-xs text-gray-500">
                  Cantidad minima de unidades
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
                onChange={(e) => handleUpdate('stockMinimo', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <span className="w-20 text-center text-lg font-bold text-rose-600">
                {config.stockMinimo}
              </span>
            </div>
            <p className="text-xs text-gray-500 bg-rose-50 p-2 rounded-lg">
              Ejemplo: Si configuras 100 unidades, cuando una vacuna tenga 
              menos de 100 unidades en total, se generara una alerta.
            </p>
          </div>
        </div>
      </div>

      {/* Generar Alertas */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Generar Alertas Ahora
            </h3>
            <p className="text-teal-100 text-sm mt-1">
              Analiza el inventario y genera alertas segun los umbrales configurados
            </p>
          </div>
          <button
            onClick={handleGenerarAlertas}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50 min-w-[180px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Generar Alertas
              </>
            )}
          </button>
        </div>

        {lastResult && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4" />
              <span className="font-medium">Resultado de la generacion</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{lastResult.alertasVencimiento || 0}</div>
                <div className="text-teal-200 text-xs">Vencimiento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{lastResult.alertasStockBajo || 0}</div>
                <div className="text-teal-200 text-xs">Stock Bajo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{lastResult.alertasGeneradas || 0}</div>
                <div className="text-teal-200 text-xs">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Limpieza */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-gray-600" />
              Limpiar Alertas Antiguas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Elimina alertas que ya fueron leidas hace mas de{' '}
              <input
                type="number"
                min="7"
                max="365"
                value={config.diasRetencion}
                onChange={(e) => handleUpdate('diasRetencion', parseInt(e.target.value) || 30)}
                className="w-14 px-2 py-0.5 mx-1 border border-gray-300 rounded text-center font-medium"
              />
              dias
            </p>
          </div>
          <button
            onClick={handleLimpiarAntiguas}
            disabled={isCleaning}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
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
            <h4 className="font-medium text-blue-800 mb-1">Como funciona</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Las alertas se generan cuando haces clic en "Generar Alertas"</li>
              <li>• Una vez generada una alerta, <strong>no se vuelve a crear</strong> por 7 dias</li>
              <li>• Puedes marcar alertas como leidas desde la campana del menu</li>
              <li>• Las alertas leidas se pueden eliminar automaticamente despues del tiempo configurado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfiguracionAlertas.displayName = 'ConfiguracionAlertas';

export default ConfiguracionAlertas;
