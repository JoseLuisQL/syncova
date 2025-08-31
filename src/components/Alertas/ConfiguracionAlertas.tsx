import React from 'react';
import {
  Mail,
  Smartphone,
  Bell,
  Volume2,
  Monitor,
  Clock,
  Package,
  Thermometer,
  Shield,
  Save,
  RotateCcw
} from 'lucide-react';

interface ConfiguracionAlertasProps {
  configuracion: any;
  setConfiguracion: (config: any) => void;
}

const ConfiguracionAlertas: React.FC<ConfiguracionAlertasProps> = ({
  configuracion,
  setConfiguracion,
}) => {
  const actualizarConfiguracion = (campo: string, valor: any) => {
    setConfiguracion((prev: any) => ({
      ...prev,
      [campo]: valor
    }));
  };

  const actualizarAlertaAutomatica = (tipo: string, campo: string, valor: any) => {
    setConfiguracion((prev: any) => ({
      ...prev,
      alertasAutomaticas: {
        ...prev.alertasAutomaticas,
        [tipo]: {
          ...prev.alertasAutomaticas[tipo],
          [campo]: valor
        }
      }
    }));
  };

  const restablecer = () => {
    if (window.confirm('¿Está seguro de restablecer toda la configuración a los valores por defecto?')) {
      setConfiguracion({
        notificacionesEmail: true,
        notificacionesSMS: false,
        notificacionesPush: true,
        sonidoAlertas: true,
        alertasEscritorio: true,
        frecuenciaVerificacion: 5,
        diasRetencion: 30,
        alertasAutomaticas: {
          vencimiento: { activo: true, diasAnticipacion: 30 },
          stockBajo: { activo: true, porcentajeMinimo: 20 },
          temperaturaFuera: { activo: true, tolerancia: 1 },
          fallosConexion: { activo: true, intentosMaximos: 3 },
          accesosNoAutorizados: { activo: true, intentosMaximos: 5 },
          respaldoFallido: { activo: true },
          actualizacionesDisponibles: { activo: false },
          mantenimientoProgramado: { activo: true, horasAnticipacion: 24 }
        }
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuración de Alertas</h2>
          <p className="text-gray-600 mt-1">Personaliza el comportamiento del sistema de alertas</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={restablecer}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Configuración General */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de verificación (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={configuracion.frecuenciaVerificacion}
                onChange={(e) => actualizarConfiguracion('frecuenciaVerificacion', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Intervalo para verificar nuevas alertas</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de retención de alertas
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={configuracion.diasRetencion}
                onChange={(e) => actualizarConfiguracion('diasRetencion', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Tiempo que se conservan las alertas</p>
            </div>
          </div>
        </div>

        {/* Configuración de Notificaciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Canales de Notificación</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones por Email</p>
                  <p className="text-sm text-gray-500">Recibir alertas por correo electrónico</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.notificacionesEmail}
                  onChange={(e) => actualizarConfiguracion('notificacionesEmail', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones SMS</p>
                  <p className="text-sm text-gray-500">Recibir alertas críticas por SMS</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.notificacionesSMS}
                  onChange={(e) => actualizarConfiguracion('notificacionesSMS', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones Push</p>
                  <p className="text-sm text-gray-500">Notificaciones en el navegador</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.notificacionesPush}
                  onChange={(e) => actualizarConfiguracion('notificacionesPush', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Volume2 className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Sonido de Alertas</p>
                  <p className="text-sm text-gray-500">Reproducir sonido para alertas críticas</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.sonidoAlertas}
                  onChange={(e) => actualizarConfiguracion('sonidoAlertas', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center">
                <Monitor className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Alertas de Escritorio</p>
                  <p className="text-sm text-gray-500">Mostrar notificaciones en el escritorio</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.alertasEscritorio}
                  onChange={(e) => actualizarConfiguracion('alertasEscritorio', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Alertas Automáticas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Alertas Automáticas</h3>
          <div className="space-y-6">
            {/* Vencimiento */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Vencimiento</p>
                    <p className="text-sm text-gray-500">Notificar cuando las vacunas estén próximas a vencer</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracion.alertasAutomaticas.vencimiento.activo}
                    onChange={(e) => actualizarAlertaAutomatica('vencimiento', 'activo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {configuracion.alertasAutomaticas.vencimiento.activo && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días de anticipación
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={configuracion.alertasAutomaticas.vencimiento.diasAnticipacion}
                    onChange={(e) => actualizarAlertaAutomatica('vencimiento', 'diasAnticipacion', parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Stock Bajo */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Stock Bajo</p>
                    <p className="text-sm text-gray-500">Notificar cuando el stock esté por debajo del mínimo</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracion.alertasAutomaticas.stockBajo.activo}
                    onChange={(e) => actualizarAlertaAutomatica('stockBajo', 'activo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {configuracion.alertasAutomaticas.stockBajo.activo && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje mínimo (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={configuracion.alertasAutomaticas.stockBajo.porcentajeMinimo}
                    onChange={(e) => actualizarAlertaAutomatica('stockBajo', 'porcentajeMinimo', parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Temperatura */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Temperatura</p>
                    <p className="text-sm text-gray-500">Notificar cuando la temperatura esté fuera del rango</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracion.alertasAutomaticas.temperaturaFuera.activo}
                    onChange={(e) => actualizarAlertaAutomatica('temperaturaFuera', 'activo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {configuracion.alertasAutomaticas.temperaturaFuera.activo && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tolerancia (°C)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={configuracion.alertasAutomaticas.temperaturaFuera.tolerancia}
                    onChange={(e) => actualizarAlertaAutomatica('temperaturaFuera', 'tolerancia', parseFloat(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Seguridad */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Seguridad</p>
                    <p className="text-sm text-gray-500">Notificar intentos de acceso no autorizados</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configuracion.alertasAutomaticas.accesosNoAutorizados.activo}
                    onChange={(e) => actualizarAlertaAutomatica('accesosNoAutorizados', 'activo', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {configuracion.alertasAutomaticas.accesosNoAutorizados.activo && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intentos máximos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configuracion.alertasAutomaticas.accesosNoAutorizados.intentosMaximos}
                    onChange={(e) => actualizarAlertaAutomatica('accesosNoAutorizados', 'intentosMaximos', parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionAlertas;
