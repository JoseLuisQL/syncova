import React from 'react';
import {
  Bell,
  AlertCircle,
  AlertOctagon,
  Calendar,
  Activity,
  TrendingUp,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Package,
  Thermometer,
  Shield,
  Monitor,
  Settings,
  Database,
  Download,
  Users,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { Alerta } from '../../types';

interface DashboardAlertasProps {
  alertas: Alerta[];
  estadisticas: {
    total: number;
    noLeidas: number;
    criticas: number;
    advertencias: number;
    informativas: number;
    exitosas: number;
    hoy: number;
  };
}

const DashboardAlertas: React.FC<DashboardAlertasProps> = ({
  alertas,
  estadisticas,
}) => {
  const tiposAlerta = [
    { id: 'vencimiento', label: 'Vencimientos', icon: Clock, color: 'text-orange-600' },
    { id: 'stock_bajo', label: 'Stock Bajo', icon: Package, color: 'text-red-600' },
    { id: 'discrepancia', label: 'Discrepancias', icon: AlertTriangle, color: 'text-yellow-600' },
    { id: 'sistema', label: 'Sistema', icon: Monitor, color: 'text-blue-600' },
  ];

  const nivelesAlerta = [
    { id: 'error', label: 'Críticas', icon: AlertOctagon, color: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'warning', label: 'Advertencias', icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { id: 'info', label: 'Informativas', icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'success', label: 'Exitosas', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  const getIconoTipo = (tipo: string) => {
    const tipoInfo = tiposAlerta.find(t => t.id === tipo);
    return tipoInfo ? tipoInfo.icon : Bell;
  };

  const getColorTipo = (tipo: string) => {
    const tipoInfo = tiposAlerta.find(t => t.id === tipo);
    return tipoInfo ? tipoInfo.color : 'text-gray-600';
  };

  const getIconoNivel = (nivel: string) => {
    const nivelInfo = nivelesAlerta.find(n => n.id === nivel);
    return nivelInfo ? nivelInfo.icon : Info;
  };

  const getColorNivel = (nivel: string) => {
    const nivelInfo = nivelesAlerta.find(n => n.id === nivel);
    return nivelInfo ? nivelInfo.color : 'text-gray-600';
  };

  const formatearFecha = (fecha: Date | string) => {
    // Asegurar que tenemos un objeto Date válido
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);

    // Verificar que la fecha es válida
    if (isNaN(fechaObj.getTime())) {
      return 'Fecha inválida';
    }

    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;

    return fechaObj.toLocaleDateString();
  };

  const alertasRecientes = alertas.slice(0, 5);

  return (
    <div className="p-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de Alertas</p>
              <p className="text-3xl font-bold text-blue-900">{estadisticas.total}</p>
              <p className="text-sm text-blue-600 mt-1">En el sistema</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Sin Leer</p>
              <p className="text-3xl font-bold text-red-900">{estadisticas.noLeidas}</p>
              <p className="text-sm text-red-600 mt-1">Requieren atención</p>
            </div>
            <div className="p-3 bg-red-600 rounded-lg shadow-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Críticas</p>
              <p className="text-3xl font-bold text-amber-900">{estadisticas.criticas}</p>
              <p className="text-sm text-amber-600 mt-1">Nivel error</p>
            </div>
            <div className="p-3 bg-amber-600 rounded-lg shadow-lg">
              <AlertOctagon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Hoy</p>
              <p className="text-3xl font-bold text-emerald-900">{estadisticas.hoy}</p>
              <p className="text-sm text-emerald-600 mt-1">Alertas nuevas</p>
            </div>
            <div className="p-3 bg-emerald-600 rounded-lg shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Nivel y Alertas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Nivel</h3>
          <div className="space-y-4">
            {nivelesAlerta.map((nivel) => {
              const Icon = nivel.icon;
              const cantidad = estadisticas[nivel.id === 'error' ? 'criticas' : 
                                          nivel.id === 'warning' ? 'advertencias' :
                                          nivel.id === 'info' ? 'informativas' : 'exitosas'];
              const porcentaje = estadisticas.total > 0 ? (cantidad / estadisticas.total * 100).toFixed(1) : 0;
              
              return (
                <div key={nivel.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 ${nivel.bgColor} rounded-lg mr-3`}>
                      <Icon className={`h-4 w-4 ${nivel.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{nivel.label}</p>
                      <p className="text-sm text-gray-500">{cantidad} alertas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{porcentaje}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${nivel.color.replace('text-', 'bg-')}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tipos de Alertas</h3>
          <div className="space-y-3">
            {tiposAlerta.map((tipo, index) => {
              const Icon = tipo.icon;
              const cantidad = alertas.filter(a => a.tipo === tipo.id).length;
              return (
                <div key={tipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon className={`h-4 w-4 ${tipo.color} mr-3`} />
                    <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded">{cantidad}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alertas Recientes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todas
          </button>
        </div>
        <div className="space-y-4">
          {alertasRecientes.map((alerta) => {
            const IconoTipo = getIconoTipo(alerta.tipo);
            const IconoNivel = getIconoNivel(alerta.nivel);
            
            return (
              <div key={alerta.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${
                !alerta.leida ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex-shrink-0">
                  <IconoNivel className={`h-5 w-5 ${getColorNivel(alerta.nivel)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${!alerta.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                      {alerta.titulo}
                    </p>
                    <span className="text-xs text-gray-500">{formatearFecha(alerta.fechaCreacion)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                  <div className="flex items-center mt-2">
                    <IconoTipo className={`h-3 w-3 ${getColorTipo(alerta.tipo)} mr-1`} />
                    <span className="text-xs text-gray-500 capitalize">{alerta.tipo.replace('_', ' ')}</span>
                  </div>
                </div>
                {!alerta.leida && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Estado del Sistema</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Servidor Principal</span>
              <span className="text-sm font-medium text-green-600">Operativo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de Datos</span>
              <span className="text-sm font-medium text-green-600">Operativo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sensores IoT</span>
              <span className="text-sm font-medium text-yellow-600">2 Desconectados</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Rendimiento</h4>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU</span>
              <span className="text-sm font-medium text-green-600">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memoria</span>
              <span className="text-sm font-medium text-green-600">62%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disco</span>
              <span className="text-sm font-medium text-yellow-600">78%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Conectividad</h4>
            <Wifi className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Internet</span>
              <span className="text-sm font-medium text-green-600">Estable</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Red Interna</span>
              <span className="text-sm font-medium text-green-600">Estable</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">VPN</span>
              <span className="text-sm font-medium text-green-600">Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAlertas;
