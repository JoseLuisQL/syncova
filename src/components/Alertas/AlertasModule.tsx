import React, { useState, useEffect } from 'react';
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
import { mockAlertas } from '../../data/mockData';
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
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas);
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

  // Generar alertas adicionales para demostración
  useEffect(() => {
    const alertasAdicionales: Alerta[] = [
      {
        id: '5',
        tipo: 'sistema',
        titulo: 'Temperatura fuera de rango',
        descripcion: 'La temperatura del refrigerador principal está en 10°C (fuera del rango 2-8°C)',
        nivel: 'error',
        fechaCreacion: new Date('2024-12-15T14:30:00'),
        leida: false,
        parametros: { temperatura: 10, rangoMin: 2, rangoMax: 8, equipoId: 'REF-001' },
      },
      {
        id: '6',
        tipo: 'sistema',
        titulo: 'Fallo de conexión',
        descripcion: 'Se perdió la conexión con el sensor de temperatura del C.S. Andahuaylas',
        nivel: 'warning',
        fechaCreacion: new Date('2024-12-15T13:45:00'),
        leida: false,
        usuarioId: '3',
        parametros: { establecimientoId: '9', sensorId: 'TEMP-002', ultimaConexion: '2024-12-15T13:30:00' },
      },
      {
        id: '7',
        tipo: 'sistema',
        titulo: 'Intento de acceso no autorizado',
        descripcion: 'Se detectaron 3 intentos fallidos de acceso desde IP 192.168.1.100',
        nivel: 'error',
        fechaCreacion: new Date('2024-12-15T12:15:00'),
        leida: true,
        parametros: { ip: '192.168.1.100', intentos: 3, ultimoIntento: '2024-12-15T12:10:00' },
      },
      {
        id: '8',
        tipo: 'sistema',
        titulo: 'Mantenimiento programado',
        descripcion: 'Mantenimiento del servidor programado para mañana a las 02:00 AM',
        nivel: 'info',
        fechaCreacion: new Date('2024-12-15T10:00:00'),
        leida: false,
        parametros: { fechaMantenimiento: '2024-12-16T02:00:00', duracionEstimada: 120 },
      },
      {
        id: '9',
        tipo: 'sistema',
        titulo: 'Respaldo completado exitosamente',
        descripcion: 'El respaldo automático diario se completó correctamente (2.3 GB)',
        nivel: 'success',
        fechaCreacion: new Date('2024-12-15T03:00:00'),
        leida: true,
        parametros: { tamaño: '2.3 GB', duracion: '45 minutos', ubicacion: 'backup-server-01' },
      }
    ];

    setAlertas(prev => [...prev, ...alertasAdicionales]);
  }, []);

  // Agrupar secciones por categoría
  const sectionsByCategory = ALERTS_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  // Calcular estadísticas
  const estadisticasAlertas = {
    total: alertas.length,
    noLeidas: alertas.filter(a => !a.leida).length,
    criticas: alertas.filter(a => a.nivel === 'error').length,
    advertencias: alertas.filter(a => a.nivel === 'warning').length,
    informativas: alertas.filter(a => a.nivel === 'info').length,
    exitosas: alertas.filter(a => a.nivel === 'success').length,
    hoy: alertas.filter(a => {
      const hoy = new Date();
      const fechaAlerta = new Date(a.fechaCreacion);
      return fechaAlerta.toDateString() === hoy.toDateString();
    }).length
  };

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
                  alertas={alertas}
                  estadisticas={estadisticasAlertas}
                />
              }
            />
            <Route
              path="alertas"
              element={
                <GestionAlertas 
                  alertas={alertas}
                  setAlertas={setAlertas}
                />
              }
            />
            <Route
              path="reportes"
              element={
                <ReportesAlertas 
                  alertas={alertas}
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
