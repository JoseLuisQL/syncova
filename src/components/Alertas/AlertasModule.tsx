import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Bell,
  Activity,
  Settings,
  FileText,
  BarChart3,
  FolderOpen,
  Database,
  Target,
  RefreshCw
} from 'lucide-react';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { Alerta } from '../../types';
import { useAlertas } from '../../hooks/useAlertas';
import DashboardAlertas from './DashboardAlertas';
import GestionAlertas from './GestionAlertas';
import ConfiguracionAlertas from './ConfiguracionAlertas';
import ReportesAlertas from './ReportesAlertas';

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'monitoreo' | 'gestion' | 'configuracion';
  description?: string;
}

const ALERTS_SECTIONS: SectionConfig[] = [
  // Sección Monitoreo
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Activity,
    path: '/alertas/dashboard',
    category: 'monitoreo',
    description: 'Vista general del sistema'
  },
  {
    id: 'alertas',
    label: 'Gestión de Alertas',
    icon: Bell,
    path: '/alertas/alertas',
    category: 'monitoreo',
    description: 'Administrar alertas activas'
  },

  // Sección Gestión
  {
    id: 'reportes',
    label: 'Reportes y Análisis',
    icon: BarChart3,
    path: '/alertas/reportes',
    category: 'gestion',
    description: 'Estadísticas y tendencias'
  },

  // Sección Configuración
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    path: '/alertas/configuracion',
    category: 'configuracion',
    description: 'Parámetros del sistema'
  }
];

const CATEGORY_CONFIG = {
  monitoreo: { label: 'Monitoreo en Tiempo Real', icon: FolderOpen, color: 'blue' },
  gestion: { label: 'Gestión y Análisis', icon: Database, color: 'emerald' },
  configuracion: { label: 'Configuración', icon: Settings, color: 'amber' }
};

const AlertasModule: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();

  // Usar el hook de alertas para datos reales
  const {
    alertas,
    stats,
    isLoading,
    error,
    refreshData
  } = useAlertas();
  // Configuración local para el módulo (esto podría moverse a un contexto o backend en el futuro)
  const [configuracionAlertas, setConfiguracionAlertas] = useState({
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

  // Manejar errores de carga
  useEffect(() => {
    if (error) {
      console.error('Error al cargar alertas:', error);
    }
  }, [error]);

  // Agrupar secciones por categoría
  const sectionsByCategory = ALERTS_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  // Usar estadísticas del backend o calcular localmente como fallback
  const estadisticasAlertas = useMemo(() => {
    // Asegurar que alertas sea un array válido
    const alertasArray = Array.isArray(alertas) ? alertas : [];

    if (stats) {
      return {
        total: stats.total,
        noLeidas: stats.noLeidas,
        criticas: stats.porNivel.error,
        advertencias: stats.porNivel.warning,
        informativas: stats.porNivel.info,
        exitosas: stats.porNivel.success,
        vencidas: stats.vencidas,
        proximasVencer: stats.proximasVencer,
        porTipo: stats.porTipo,
        porNivel: stats.porNivel,
        hoy: alertasArray.filter(a => {
          const hoy = new Date();
          const fechaAlerta = new Date(a.fechaCreacion);
          return fechaAlerta.toDateString() === hoy.toDateString();
        }).length
      };
    }

    // Fallback: calcular estadísticas localmente si no hay datos del backend
    const total = alertasArray.length;
    const noLeidas = alertasArray.filter(a => !a.leida).length;
    const criticas = alertasArray.filter(a => a.nivel === 'error').length;
    const advertencias = alertasArray.filter(a => a.nivel === 'warning').length;
    const informativas = alertasArray.filter(a => a.nivel === 'info').length;
    const exitosas = alertasArray.filter(a => a.nivel === 'success').length;

    const now = new Date();
    const vencidas = alertasArray.filter(a => a.fechaVencimiento && a.fechaVencimiento < now).length;
    const proximoVencimiento = new Date();
    proximoVencimiento.setDate(now.getDate() + 7);
    const proximasVencer = alertasArray.filter(a =>
      a.fechaVencimiento &&
      a.fechaVencimiento >= now &&
      a.fechaVencimiento <= proximoVencimiento
    ).length;

    const porTipo = {
      vencimiento: alertasArray.filter(a => a.tipo === 'vencimiento').length,
      stock_bajo: alertasArray.filter(a => a.tipo === 'stock_bajo').length,
      discrepancia: alertasArray.filter(a => a.tipo === 'discrepancia').length,
      sistema: alertasArray.filter(a => a.tipo === 'sistema').length
    };

    const porNivel = {
      error: criticas,
      warning: advertencias,
      info: informativas,
      success: exitosas
    };

    return {
      total,
      noLeidas,
      criticas,
      advertencias,
      informativas,
      exitosas,
      vencidas,
      proximasVencer,
      porTipo,
      porNivel,
      hoy: alertasArray.filter(a => {
        const hoy = new Date();
        const fechaAlerta = new Date(a.fechaCreacion);
        return fechaAlerta.toDateString() === hoy.toDateString();
      }).length
    };
  }, [alertas, stats]);

  // Asegurar que alertas sea siempre un array válido para los componentes hijos
  const alertasSeguras = Array.isArray(alertas) ? alertas : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Alertas</h1>
                <p className="text-gray-600 mt-1">Monitoreo inteligente y gestión de notificaciones</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
              <div className="flex items-center bg-red-50 px-3 py-2 rounded-lg">
                <Target className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  {estadisticasAlertas.noLeidas} sin leer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;

              return (
                <div key={categoryKey} className="border-r border-gray-200 last:border-r-0">
                  <div className={`px-4 py-3 bg-${category.color}-50 border-b border-${category.color}-100`}>
                    <div className="flex items-center">
                      <CategoryIcon className={`h-4 w-4 text-${category.color}-600 mr-2`} />
                      <span className={`text-sm font-semibold text-${category.color}-800`}>
                        {category.label}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = currentSubModule === section.id || (!currentSubModule && section.id === 'dashboard');
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => navigateToModule('alertas', section.id)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <Icon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className={`font-medium text-sm ${isActive ? `text-${category.color}-800` : 'text-gray-900'}`}>
                              {section.label}
                            </div>
                            {section.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {section.description}
                              </div>
                            )}
                          </div>
                          {section.id === 'alertas' && estadisticasAlertas.noLeidas > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                              {estadisticasAlertas.noLeidas}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area Premium */}
      <div className="max-w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <DashboardAlertas
                  alertas={alertasSeguras}
                  estadisticas={estadisticasAlertas}
                  isLoading={isLoading}
                  error={error}
                  onRefresh={refreshData}
                />
              }
            />
            <Route
              path="alertas"
              element={
                <GestionAlertas
                  onRefresh={refreshData}
                />
              }
            />
            <Route
              path="reportes"
              element={
                <ReportesAlertas
                  alertas={alertasSeguras}
                  estadisticas={estadisticasAlertas}
                  isLoading={isLoading}
                  error={error}
                />
              }
            />
            <Route
              path="configuracion"
              element={
                <ConfiguracionAlertas 
                  configuracion={configuracionAlertas}
                  setConfiguracion={setConfiguracionAlertas}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AlertasModule;
