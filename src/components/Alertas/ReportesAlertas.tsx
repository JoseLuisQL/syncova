import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  LineChart,
  PieChart,
  Clock,
  Package,
  AlertTriangle,
  Monitor,
  AlertOctagon,
  Info,
  CheckCircle
} from 'lucide-react';
import { Alerta } from '../../types';

interface ReportesAlertasProps {
  alertas: Alerta[];
}

const ReportesAlertas: React.FC<ReportesAlertasProps> = ({
  alertas,
}) => {
  const [filtroFecha, setFiltroFecha] = useState('30'); // días
  const [filtroTipoHistorial, setFiltroTipoHistorial] = useState('todos');

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

  const alertasFiltradas = alertas.filter(alerta => {
    const diasAtras = parseInt(filtroFecha);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
    
    const cumpleFecha = alerta.fechaCreacion >= fechaLimite;
    const cumpleTipo = filtroTipoHistorial === 'todos' || alerta.tipo === filtroTipoHistorial;
    
    return cumpleFecha && cumpleTipo;
  });

  const estadisticasHistorial = {
    totalPeriodo: alertasFiltradas.length,
    promedioDiario: Math.round(alertasFiltradas.length / parseInt(filtroFecha)),
    tipoMasFrecuente: tiposAlerta.reduce((max, tipo) => {
      const cantidad = alertasFiltradas.filter(a => a.tipo === tipo.id).length;
      return cantidad > max.cantidad ? { tipo: tipo.label, cantidad } : max;
    }, { tipo: '', cantidad: 0 }),
    distribucionNiveles: {
      criticas: alertasFiltradas.filter(a => a.nivel === 'error').length,
      advertencias: alertasFiltradas.filter(a => a.nivel === 'warning').length,
      informativas: alertasFiltradas.filter(a => a.nivel === 'info').length,
      exitosas: alertasFiltradas.filter(a => a.nivel === 'success').length,
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reportes y Análisis</h2>
          <p className="text-gray-600 mt-1">Estadísticas detalladas y tendencias del sistema de alertas</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período de Análisis</label>
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último año</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Alerta</label>
            <select
              value={filtroTipoHistorial}
              onChange={(e) => setFiltroTipoHistorial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              {tiposAlerta.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total en Período</p>
              <p className="text-3xl font-bold text-blue-900">{estadisticasHistorial.totalPeriodo}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Promedio Diario</p>
              <p className="text-3xl font-bold text-emerald-900">{estadisticasHistorial.promedioDiario}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Más Frecuente</p>
              <p className="text-lg font-bold text-purple-900">{estadisticasHistorial.tipoMasFrecuente.tipo}</p>
              <p className="text-sm text-purple-600">{estadisticasHistorial.tipoMasFrecuente.cantidad} alertas</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Alertas Críticas</p>
              <p className="text-3xl font-bold text-amber-900">{estadisticasHistorial.distribucionNiveles.criticas}</p>
            </div>
            <AlertOctagon className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribución por Nivel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Nivel de Criticidad</h3>
          <div className="space-y-4">
            {nivelesAlerta.map((nivel) => {
              const Icon = nivel.icon;
              const cantidad = estadisticasHistorial.distribucionNiveles[
                nivel.id === 'error' ? 'criticas' : 
                nivel.id === 'warning' ? 'advertencias' :
                nivel.id === 'info' ? 'informativas' : 'exitosas'
              ];
              const porcentaje = estadisticasHistorial.totalPeriodo > 0 ? 
                (cantidad / estadisticasHistorial.totalPeriodo * 100).toFixed(1) : 0;
              
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

        {/* Distribución por Tipo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución por Tipo de Alerta</h3>
          <div className="space-y-3">
            {tiposAlerta.map((tipo) => {
              const cantidad = alertasFiltradas.filter(a => a.tipo === tipo.id).length;
              const porcentaje = alertasFiltradas.length > 0 ? (cantidad / alertasFiltradas.length * 100).toFixed(1) : 0;
              const Icon = tipo.icon;
              
              return (
                <div key={tipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Icon className={`h-4 w-4 ${tipo.color} mr-3`} />
                    <span className="text-sm font-medium text-gray-900">{tipo.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded">{cantidad}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${tipo.color.replace('text-', 'bg-')}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">{porcentaje}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendencia de Alertas en el Tiempo</h3>
        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <div className="text-center">
            <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">Gráfico de Tendencias</p>
            <p className="text-sm text-gray-400">Visualización de alertas por día/semana/mes</p>
            <p className="text-xs text-gray-400 mt-2">Funcionalidad disponible en próxima versión</p>
          </div>
        </div>
      </div>

      {/* Resumen Estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de alertas:</span>
              <span className="font-semibold">{estadisticasHistorial.totalPeriodo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Promedio diario:</span>
              <span className="font-semibold">{estadisticasHistorial.promedioDiario}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alertas críticas:</span>
              <span className="font-semibold text-red-600">{estadisticasHistorial.distribucionNiveles.criticas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alertas de advertencia:</span>
              <span className="font-semibold text-yellow-600">{estadisticasHistorial.distribucionNiveles.advertencias}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alertas informativas:</span>
              <span className="font-semibold text-blue-600">{estadisticasHistorial.distribucionNiveles.informativas}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights y Recomendaciones</h3>
          <div className="space-y-3 text-sm">
            {estadisticasHistorial.distribucionNiveles.criticas > 5 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800">⚠️ Alto número de alertas críticas detectadas. Revisar configuración de umbrales.</p>
              </div>
            )}
            {estadisticasHistorial.promedioDiario > 10 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">📈 Promedio diario elevado. Considerar optimizar filtros automáticos.</p>
              </div>
            )}
            {estadisticasHistorial.tipoMasFrecuente.cantidad > estadisticasHistorial.totalPeriodo * 0.4 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800">🎯 Tipo "{estadisticasHistorial.tipoMasFrecuente.tipo}" representa el {((estadisticasHistorial.tipoMasFrecuente.cantidad / estadisticasHistorial.totalPeriodo) * 100).toFixed(0)}% del total.</p>
              </div>
            )}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800">✅ Sistema monitoreando correctamente {tiposAlerta.length} tipos de alertas diferentes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones de Exportación */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar y Compartir</h3>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar a Excel
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Generar PDF
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="h-4 w-4 mr-2" />
            Enviar por Email
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Programar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportesAlertas;
