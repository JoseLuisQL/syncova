import React, { useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Package,
  Building2,
  Users,
  RefreshCw,
  Clock,
  Zap,
  FileText,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import { useToastContext } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import CentrosAcopioSection from './CentrosAcopioSection';
import AlertasSection from './AlertasSection';
import ActividadSection from './ActividadSection';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToastContext();

  const {
    estadisticas,
    loading,
    error,
    lastUpdated,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    movimientosMensuales,
    stockPorVacuna,
    centrosAcopio,
    alertasRecientes,
    actividadReciente,
    hasData,
    isStale
  } = useDashboard();

  // Auto-refresh deshabilitado para evitar bucle infinito
  // useEffect(() => {
  //   startAutoRefresh(30000); // Actualizar cada 30 segundos

  //   return () => {
  //     stopAutoRefresh();
  //   };
  // }, [startAutoRefresh, stopAutoRefresh]);

  // Mostrar toast de error si hay problemas
  useEffect(() => {
    if (error) {
      toast.error('Error en Dashboard', error);
    }
  }, [error, toast]);

  // Función para manejar refresh manual
  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Dashboard actualizado', 'Datos actualizados correctamente');
    } catch (err) {
      toast.error('Error al actualizar', 'No se pudieron actualizar los datos');
    }
  };

  // Configuración de estadísticas con datos reales
  const statsConfig = [
    {
      label: 'Total Vacunas',
      value: estadisticas?.totalVacunas || 0,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Establecimientos',
      value: estadisticas?.totalEstablecimientos || 0,
      icon: Building2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-600'
    },
    {
      label: 'Entregas Mes',
      value: estadisticas?.entregasMes || 0,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600'
    },
    {
      label: 'Alertas Activas',
      value: estadisticas?.alertasPendientes || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600'
    },
    {
      label: 'Stock Crítico',
      value: estadisticas?.stockCritico || 0,
      icon: AlertCircle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Próximos a Vencer',
      value: estadisticas?.vencimientoProximo || 0,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-600'
    }
  ];

  // Función para navegar a diferentes módulos
  const navigateToModule = (path: string) => {
    navigate(path);
  };



  // Función para formatear fecha relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  // Mostrar loading state
  if (loading && !hasData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando Dashboard</h2>
          <p className="text-gray-600">Obteniendo datos del sistema...</p>
        </div>
      </div>
    );
  }

  // Mostrar error state
  if (error && !hasData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header con información de actualización */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Sistema Integral de Gestión de Vacunas - DISA Apurímac II
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          {isStale && (
            <div className="flex items-center text-yellow-600 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Datos desactualizados
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards con diseño moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg`}>
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
            <BarChart data={movimientosMensuales}>
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
                data={stockPorVacuna}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="stockTotal"
                label={({ vacunaNombre, stockTotal }) => `${vacunaNombre}: ${stockTotal.toLocaleString()}`}
              >
                {stockPorVacuna.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accesos Directos */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-blue-600" />
          Accesos Directos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigateToModule('/vales')}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Generar Vales</p>
              <p className="text-sm text-gray-600">Crear vales de entrega</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => navigateToModule('/movimientos')}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-green-300 group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Movimientos</p>
              <p className="text-sm text-gray-600">Gestionar movimientos</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
          </button>

          <button
            onClick={() => navigateToModule('/inventario')}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-purple-300 group"
          >
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Inventario</p>
              <p className="text-sm text-gray-600">Gestionar stock</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
          </button>

          <button
            onClick={() => navigateToModule('/alertas')}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-red-300 group"
          >
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3 text-left">
              <p className="font-medium text-gray-900">Alertas</p>
              <p className="text-sm text-gray-600">Ver alertas activas</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Información detallada con paginación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Centros de Acopio con paginación */}
        <CentrosAcopioSection />

        {/* Alertas Recientes con paginación */}
        <AlertasSection />

        {/* Actividad Reciente con paginación */}
        <ActividadSection />
      </div>
    </div>
  );
};

export default Dashboard;