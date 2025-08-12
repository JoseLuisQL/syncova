import React from 'react';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Package,
  Building2,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Total Vacunas',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Establecimientos',
      value: '12',
      change: '0%',
      trend: 'neutral',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      label: 'Entregas Mes',
      value: '184',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      label: 'Alertas Activas',
      value: '3',
      change: '-25%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

  const movimientosData = [
    { mes: 'Ene', entregas: 156, recepciones: 200 },
    { mes: 'Feb', entregas: 142, recepciones: 180 },
    { mes: 'Mar', entregas: 165, recepciones: 220 },
    { mes: 'Apr', entregas: 178, recepciones: 190 },
    { mes: 'May', entregas: 192, recepciones: 210 },
    { mes: 'Jun', entregas: 184, recepciones: 195 },
  ];

  const vacunasData = [
    { name: 'BCG', value: 327, color: '#3b82f6' },
    { name: 'Pentavalente', value: 542, color: '#059669' },
    { name: 'HVB Pediátrico', value: 756, color: '#dc2626' },
    { name: 'Neumococo', value: 423, color: '#7c3aed' },
    { name: 'APO', value: 189, color: '#ea580c' },
  ];

  const alertasRecientes = [
    {
      id: 1,
      tipo: 'vencimiento',
      mensaje: 'Lote APO-2024-001 vence en 30 días',
      tiempo: 'Hace 2 horas',
      nivel: 'warning',
    },
    {
      id: 2,
      tipo: 'stock',
      mensaje: 'Stock bajo de BCG (327 unidades)',
      tiempo: 'Hace 4 horas',
      nivel: 'error',
    },
    {
      id: 3,
      tipo: 'sistema',
      mensaje: 'Actualización completada exitosamente',
      tiempo: 'Hace 1 día',
      nivel: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500 mr-1" />}
                    {stat.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500 mr-1" />}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up'
                          ? 'text-green-600'
                          : stat.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movimientos Mensuales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Movimientos Mensuales</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Entregas</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Recepciones</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movimientosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entregas" fill="#3b82f6" radius={4} />
              <Bar dataKey="recepciones" fill="#059669" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock por Vacuna */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Actual por Vacuna</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vacunasData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {vacunasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Centros de Acopio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Centros de Acopio</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">San Jerónimo</p>
                <p className="text-sm text-gray-600">4 establecimientos</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Andahuaylas</p>
                <p className="text-sm text-gray-600">3 establecimientos</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Chincheros</p>
                <p className="text-sm text-gray-600">2 establecimientos</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Alertas Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h3>
          <div className="space-y-4">
            {alertasRecientes.map((alerta) => (
              <div key={alerta.id} className="flex items-start space-x-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alerta.nivel === 'error'
                      ? 'bg-red-500'
                      : alerta.nivel === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alerta.mensaje}</p>
                  <p className="text-xs text-gray-500 mt-1">{alerta.tiempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Entrega realizada</p>
                <p className="text-xs text-gray-500">C.S. San Jerónimo - BCG</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Lote recibido</p>
                <p className="text-xs text-gray-500">Pentavalente - 500 unidades</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Usuario conectado</p>
                <p className="text-xs text-gray-500">C. Mendoza - San Jerónimo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;