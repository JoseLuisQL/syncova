import React, { memo, useState, useCallback } from 'react';
import {
  Mail,
  Bell,
  Volume2,
  Clock,
  Package,
  Save,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react';
import { COMPONENT_STYLES } from './constants';

interface ConfiguracionData {
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  sonidoAlertas: boolean;
  frecuenciaVerificacion: number;
  diasRetencion: number;
  alertasAutomaticas: {
    vencimiento: { activo: boolean; diasAnticipacion: number };
    stockBajo: { activo: boolean; porcentajeMinimo: number };
  };
}

const defaultConfig: ConfiguracionData = {
  notificacionesEmail: true,
  notificacionesPush: true,
  sonidoAlertas: true,
  frecuenciaVerificacion: 5,
  diasRetencion: 30,
  alertasAutomaticas: {
    vencimiento: { activo: true, diasAnticipacion: 30 },
    stockBajo: { activo: true, porcentajeMinimo: 20 },
  },
};

const ConfiguracionAlertas: React.FC = memo(() => {
  const [config, setConfig] = useState<ConfiguracionData>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = useCallback((field: string, value: boolean | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleUpdateAlertaAuto = useCallback((tipo: 'vencimiento' | 'stockBajo', field: string, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      alertasAutomaticas: {
        ...prev.alertasAutomaticas,
        [tipo]: { ...prev.alertasAutomaticas[tipo], [field]: value },
      },
    }));
    setSaved(false);
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Restablecer la configuracion a valores por defecto?')) {
      setConfig(defaultConfig);
      setSaved(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
    </label>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Configuracion de Alertas</h2>
          <p className="text-sm text-gray-600">Personaliza el comportamiento del sistema</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className={COMPONENT_STYLES.button.secondary}>
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={COMPONENT_STYLES.button.primary}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saved ? 'Guardado' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Configuracion General</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={COMPONENT_STYLES.input.label}>
              Frecuencia de verificacion (minutos)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.frecuenciaVerificacion}
              onChange={(e) => handleUpdate('frecuenciaVerificacion', parseInt(e.target.value) || 5)}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            />
            <p className="text-xs text-gray-500 mt-1">Intervalo para verificar nuevas alertas</p>
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>
              Dias de retencion de alertas
            </label>
            <input
              type="number"
              min="7"
              max="365"
              value={config.diasRetencion}
              onChange={(e) => handleUpdate('diasRetencion', parseInt(e.target.value) || 30)}
              className={`${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
            />
            <p className="text-xs text-gray-500 mt-1">Tiempo que se conservan las alertas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Canales de Notificacion</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-teal-600" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibir alertas por correo electronico</p>
              </div>
            </div>
            <ToggleSwitch
              checked={config.notificacionesEmail}
              onChange={(v) => handleUpdate('notificacionesEmail', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Notificaciones en el navegador</p>
              </div>
            </div>
            <ToggleSwitch
              checked={config.notificacionesPush}
              onChange={(v) => handleUpdate('notificacionesPush', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-gray-900">Sonido de Alertas</p>
                <p className="text-sm text-gray-500">Reproducir sonido para alertas criticas</p>
              </div>
            </div>
            <ToggleSwitch
              checked={config.sonidoAlertas}
              onChange={(v) => handleUpdate('sonidoAlertas', v)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Alertas Automaticas</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Vencimiento</p>
                  <p className="text-sm text-gray-500">Notificar cuando vacunas esten proximas a vencer</p>
                </div>
              </div>
              <ToggleSwitch
                checked={config.alertasAutomaticas.vencimiento.activo}
                onChange={(v) => handleUpdateAlertaAuto('vencimiento', 'activo', v)}
              />
            </div>
            {config.alertasAutomaticas.vencimiento.activo && (
              <div className="ml-8 mt-3">
                <label className={COMPONENT_STYLES.input.label}>Dias de anticipacion</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={config.alertasAutomaticas.vencimiento.diasAnticipacion}
                  onChange={(e) => handleUpdateAlertaAuto('vencimiento', 'diasAnticipacion', parseInt(e.target.value) || 30)}
                  className={`w-32 ${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                />
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-rose-600" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Stock Bajo</p>
                  <p className="text-sm text-gray-500">Notificar cuando el stock este por debajo del minimo</p>
                </div>
              </div>
              <ToggleSwitch
                checked={config.alertasAutomaticas.stockBajo.activo}
                onChange={(v) => handleUpdateAlertaAuto('stockBajo', 'activo', v)}
              />
            </div>
            {config.alertasAutomaticas.stockBajo.activo && (
              <div className="ml-8 mt-3">
                <label className={COMPONENT_STYLES.input.label}>Porcentaje minimo (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.alertasAutomaticas.stockBajo.porcentajeMinimo}
                  onChange={(e) => handleUpdateAlertaAuto('stockBajo', 'porcentajeMinimo', parseInt(e.target.value) || 20)}
                  className={`w-32 ${COMPONENT_STYLES.input.base} ${COMPONENT_STYLES.input.normal}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ConfiguracionAlertas.displayName = 'ConfiguracionAlertas';

export default ConfiguracionAlertas;
