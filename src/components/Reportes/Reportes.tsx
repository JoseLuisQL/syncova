import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Package,
  Users,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Settings,
  Eye,
  Plus,
  Edit,
  Trash2,
  Mail,
  Archive,
  Star,
  X,
  Search,
  ArrowRightLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { mockEstablecimientos, mockVacunas } from '../../data/mockData';
import { Establecimiento, Vacuna } from '../../types';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { useReportes } from '../../hooks/useReportes';
import { KardexService } from '../../services/KardexService';
import { useKardexFiltros } from '../../hooks/useKardexData';
import { useToastContext } from '../../contexts/ToastContext';
import {
  FiltrosReporteBase,
  FiltrosStockCritico,
  FiltrosVencimientos,
  FiltrosKardexDetallado,
  ConfiguracionExportacion
} from '../../types/reportes';

// Configuración de secciones organizadas jerárquicamente
interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'generacion' | 'automatizacion' | 'configuracion';
  description?: string;
}

const REPORTS_SECTIONS: SectionConfig[] = [
  // Sección Generación
  {
    id: 'inventario',
    label: 'Inventario y Stock',
    icon: Package,
    path: '/reportes/inventario',
    category: 'generacion',
    description: 'Reportes de inventario y stock'
  },
  { 
    id: 'movimientos', 
    label: 'Movimientos', 
    icon: TrendingUp, 
    path: '/reportes/movimientos', 
    category: 'generacion',
    description: 'Análisis de distribución'
  },
  { 
    id: 'planificacion', 
    label: 'Planificación', 
    icon: Target, 
    path: '/reportes/planificacion', 
    category: 'generacion',
    description: 'Programación y metas'
  },
  { 
    id: 'ejecutivo', 
    label: 'Ejecutivo', 
    icon: Star, 
    path: '/reportes/ejecutivo', 
    category: 'generacion',
    description: 'Reportes estratégicos'
  },
  
  // Sección Automatización
  { 
    id: 'programados', 
    label: 'Reportes Programados', 
    icon: Clock, 
    path: '/reportes/programados', 
    category: 'automatizacion',
    description: 'Automatización y programación'
  },
  
  // Sección Configuración
  { 
    id: 'configuracion', 
    label: 'Configuración', 
    icon: Settings, 
    path: '/reportes/configuracion', 
    category: 'configuracion',
    description: 'Ajustes del sistema'
  }
];

const CATEGORY_CONFIG = {
  generacion: { label: 'Generación de Reportes', icon: FileText, color: 'emerald' },
  automatizacion: { label: 'Automatización', icon: Clock, color: 'purple' },
  configuracion: { label: 'Configuración', icon: Settings, color: 'amber' }
};

const Reportes: React.FC = () => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const { toast } = useToastContext();

  // Cargar datos reales desde la base de datos
  const {
    vacunas: vacunasReales,
    establecimientos: establecimientosReales,
    centrosAcopio: centrosAcopioReales,
    loading: loadingFiltros
  } = useKardexFiltros();

  const [filtros, setFiltros] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    centroAcopio: 'todos',
    vacuna: 'todas',
    formato: 'pdf'
  });
  const [showModalGenerador, setShowModalGenerador] = useState(false);
  const [showModalProgramar, setShowModalProgramar] = useState(false);
  const [reportesProgramados, setReportesProgramados] = useState([
    {
      id: '1',
      nombre: 'Reporte Mensual de Stock',
      tipo: 'stock_mensual',
      frecuencia: 'mensual',
      proximaEjecucion: new Date('2024-12-31'),
      estado: 'activo',
      destinatarios: ['coordinadora@saludapurimac.gob.pe'],
      formato: 'pdf'
    },
    {
      id: '2',
      nombre: 'Análisis de Consumo Trimestral',
      tipo: 'consumo_trimestral',
      frecuencia: 'trimestral',
      proximaEjecucion: new Date('2025-01-15'),
      estado: 'activo',
      destinatarios: ['admin@saludapurimac.gob.pe'],
      formato: 'excel'
    }
  ]);

  // Agrupar secciones por categoría
  const sectionsByCategory = REPORTS_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, SectionConfig[]>);

  // Usar centros de acopio específicos si están disponibles, sino usar mock filtrado
  const centrosAcopio = centrosAcopioReales.length > 0
    ? centrosAcopioReales
    : mockEstablecimientos.filter((e: Establecimiento) => e.nombre.toLowerCase().includes('acopio'));

  // Debug: Verificar que se están cargando los centros de acopio
  React.useEffect(() => {
    console.log('🏥 Centros de Acopio cargados:', {
      reales: centrosAcopioReales.length,
      mockFiltrados: mockEstablecimientos.filter(e => e.nombre.toLowerCase().includes('acopio')).length,
      total: centrosAcopio.length,
      nombres: centrosAcopio.map(e => e.nombre)
    });
  }, [centrosAcopioReales, centrosAcopio]);

  const vacunas = vacunasReales.length > 0 ? vacunasReales : mockVacunas;

  const handleProgramarReporte = () => {
    setShowModalProgramar(true);
  };

  const handleExportarReporte = (formato: string) => {
    alert(`Generando reporte en formato ${formato.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Reportes</h1>
                <p className="text-gray-600">Generación de reportes profesionales y análisis estadístico</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleProgramarReporte}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Programar Reporte
              </button>
              <button
                onClick={() => setShowModalGenerador(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reporte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(sectionsByCategory).map(([categoryKey, sections]) => {
              const category = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
              const CategoryIcon = category.icon;
              
              return (
                <div key={categoryKey} className="relative group">
                  {/* Category Header */}
                  <div className={`flex items-center justify-center py-4 border-b-4 border-${category.color}-500 bg-${category.color}-50`}>
                    <CategoryIcon className={`h-5 w-5 text-${category.color}-600 mr-2`} />
                    <span className={`font-semibold text-${category.color}-800`}>{category.label}</span>
                  </div>
                  
                  {/* Section Buttons */}
                  <div className="bg-white">
                    {sections.map((section) => {
                      const SectionIcon = section.icon;
                      const isActive = currentSubModule === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => navigateToModule('reportes', section.id)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            isActive ? `bg-${category.color}-50 border-l-4 border-l-${category.color}-500` : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <SectionIcon className={`h-4 w-4 mr-3 ${isActive ? `text-${category.color}-600` : 'text-gray-500'}`} />
                            <div>
                              <div className={`text-sm font-medium ${isActive ? `text-${category.color}-900` : 'text-gray-900'}`}>
                                {section.label}
                              </div>
                              {section.description && (
                                <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                              )}
                            </div>
                          </div>
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
            <Route path="/" element={<Navigate to="inventario" replace />} />
            <Route path="inventario" element={<InventarioReportesTab filtros={filtros} setFiltros={setFiltros} centrosAcopio={centrosAcopio} vacunas={vacunas} onGenerarReporte={handleExportarReporte} />} />
            <Route path="movimientos" element={<MovimientosReportesTab filtros={filtros} setFiltros={setFiltros} centrosAcopio={centrosAcopio} vacunas={vacunas} onGenerarReporte={handleExportarReporte} />} />
            <Route path="planificacion" element={<PlanificacionReportesTab filtros={filtros} setFiltros={setFiltros} centrosAcopio={centrosAcopio} vacunas={vacunas} onGenerarReporte={handleExportarReporte} />} />
            <Route path="ejecutivo" element={<EjecutivoReportesTab filtros={filtros} setFiltros={setFiltros} onGenerarReporte={handleExportarReporte} />} />
            <Route path="programados" element={<ReportesProgramadosTab reportesProgramados={reportesProgramados} setReportesProgramados={setReportesProgramados} />} />
            <Route path="configuracion" element={<ConfiguracionReportesTab />} />
          </Routes>
        </div>
      </div>

      {/* Modal Generador de Reportes */}
      {showModalGenerador && (
        <GeneradorReporteModal
          selectedReporte=""
          filtros={filtros}
          setFiltros={setFiltros}
          centrosAcopio={centrosAcopio}
          vacunas={vacunas}
          onClose={() => setShowModalGenerador(false)}
          onGenerar={handleExportarReporte}
        />
      )}

      {/* Modal Programar Reporte */}
      {showModalProgramar && (
        <ProgramarReporteModal
          onClose={() => setShowModalProgramar(false)}
          onProgramar={(reporte) => {
            setReportesProgramados(prev => [...prev, { ...reporte, id: Date.now().toString() }]);
            setShowModalProgramar(false);
          }}
        />
      )}
    </div>
  );
};

// Tabs específicos para cada categoría de reportes
interface InventarioReportesTabProps {
  filtros: any;
  setFiltros: (filtros: any) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onGenerarReporte: (formato: string) => void;
}

const InventarioReportesTab: React.FC<InventarioReportesTabProps> = ({
  filtros,
  setFiltros,
  centrosAcopio,
  vacunas,
  onGenerarReporte,
}) => {
  const {
    reportes,
    estadisticas,
    estado,
    generarStockActual,
    generarStockCritico,
    generarVencimientos,
    generarLotesVencidos,
    generarKardexDetallado,
    obtenerEstadisticas,
    exportarExcel,
    exportarKardexDetallado,
    limpiarError
  } = useReportes();

  const [filtrosReportes, setFiltrosReportes] = React.useState<{
    stockActual: FiltrosReporteBase;
    stockCritico: FiltrosStockCritico;
    vencimientos: FiltrosVencimientos;
    lotesVencidos: FiltrosReporteBase;
    kardexDetallado: FiltrosKardexDetallado | null;
  }>({
    stockActual: {},
    stockCritico: { porcentajeMinimo: 20, cantidadMinima: 50 },
    vencimientos: { diasAnticipacion: 30 },
    lotesVencidos: {},
    kardexDetallado: null
  });

  const [showKardexModal, setShowKardexModal] = React.useState(false);
  const [reporteActivo, setReporteActivo] = React.useState<string | null>(null);
  const [reporteVisualizando, setReporteVisualizando] = React.useState<string | null>(null);

  // Cargar estadísticas al montar el componente
  React.useEffect(() => {
    obtenerEstadisticas();
  }, [obtenerEstadisticas]);

  const reportesInventario = [
    {
      id: 'stock_actual',
      nombre: 'Stock Actual',
      descripcion: 'Estado actual del inventario por vacuna',
      icon: Package,
      color: 'blue',
      datos: reportes.stockActual,
      generar: () => handleGenerarReporte('stock_actual')
    },
    {
      id: 'stock_critico',
      nombre: 'Stock Crítico',
      descripcion: 'Vacunas con stock bajo o agotado',
      icon: Activity,
      color: 'red',
      datos: reportes.stockCritico,
      generar: () => handleGenerarReporte('stock_critico')
    },
    {
      id: 'vencimientos',
      nombre: 'Próximos Vencimientos',
      descripcion: 'Lotes próximos a vencer en 30 días',
      icon: Calendar,
      color: 'amber',
      datos: reportes.vencimientos,
      generar: () => handleGenerarReporte('vencimientos')
    },
    {
      id: 'lotes_vencidos',
      nombre: 'Lotes Vencidos',
      descripcion: 'Lotes que ya han vencido y requieren acción',
      icon: AlertTriangle,
      color: 'red',
      datos: reportes.lotesVencidos,
      generar: () => handleGenerarReporte('lotes_vencidos')
    },
    {
      id: 'kardex_detallado',
      nombre: 'Kardex Detallado',
      descripción: 'Movimientos detallados con filtros',
      icon: Archive,
      color: 'emerald',
      datos: reportes.kardexDetallado,
      generar: () => setShowKardexModal(true)
    }
  ];

  const handleGenerarReporte = async (tipoReporte: string) => {
    try {
      setReporteActivo(tipoReporte);

      switch (tipoReporte) {
        case 'stock_actual':
          await generarStockActual(filtrosReportes.stockActual);
          break;
        case 'stock_critico':
          await generarStockCritico(filtrosReportes.stockCritico);
          break;
        case 'vencimientos':
          await generarVencimientos(filtrosReportes.vencimientos);
          break;
        case 'lotes_vencidos':
          await generarLotesVencidos(filtrosReportes.lotesVencidos);
          break;
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setReporteActivo(null);
    }
  };

  const handleExportarExcel = async (tipoReporte: string) => {
    try {
      const config: ConfiguracionExportacion = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Reporte generado el ${new Date().toLocaleDateString('es-PE')}`
      };

      await exportarExcel(tipoReporte as any, config);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  };

  const handleExportarKardex = async (filtros: FiltrosKardexDetallado) => {
    try {
      const config: ConfiguracionExportacion = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: 'Sistema SIVAC',
        observaciones: `Kardex detallado generado el ${new Date().toLocaleDateString('es-PE')}`
      };

      await exportarKardexDetallado(filtros, config);
      setShowKardexModal(false);

      // Toast de éxito (temporalmente comentado hasta arreglar el scope)
      console.log('✅ Kardex exportado exitosamente:', `Movimientos del ${filtros.fechaInicio} al ${filtros.fechaFin}`);
    } catch (error: any) {
      console.error('Error al exportar kardex:', error);

      // Extraer mensaje de error específico
      let errorMessage = 'Error desconocido al exportar kardex';
      let errorTitle = 'Error de exportación';

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;

        // Personalizar título según el tipo de error
        if (errorMessage.includes('No se encontraron movimientos')) {
          errorTitle = 'Sin movimientos en el rango';
        } else if (errorMessage.includes('fecha')) {
          errorTitle = 'Error de fechas';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Mostrar error en consola (temporalmente hasta arreglar el toast)
      console.error('❌', errorTitle + ':', errorMessage);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reportes de Inventario y Stock</h2>
        {estadisticas && (
          <div className="text-sm text-gray-600">
            Última actualización: {estadisticas.ultimaActualizacion.toLocaleString('es-PE')}
          </div>
        )}
      </div>

      {/* Estadísticas Rápidas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Vacunas</p>
                <p className="text-2xl font-bold text-blue-900">{estadisticas.totalVacunas}</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-emerald-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-emerald-600">Stock Total</p>
                <p className="text-2xl font-bold text-emerald-900">{estadisticas.totalStock.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Stock Crítico</p>
                <p className="text-2xl font-bold text-red-900">{estadisticas.vacunasCriticas}</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-amber-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-amber-600">Por Vencer</p>
                <p className="text-2xl font-bold text-amber-900">{estadisticas.lotesProximosVencer}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Vencidos</p>
                <p className="text-2xl font-bold text-orange-900">{estadisticas.lotesVencidos}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros Globales */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centro de Acopio</label>
            <select
              value={filtrosReportes.stockActual.centroAcopioId || ''}
              onChange={(e) => {
                const value = e.target.value || undefined;
                setFiltrosReportes(prev => ({
                  ...prev,
                  stockActual: { ...prev.stockActual, centroAcopioId: value },
                  stockCritico: { ...prev.stockCritico, centroAcopioId: value },
                  vencimientos: { ...prev.vencimientos, centroAcopioId: value },
                  lotesVencidos: { ...prev.lotesVencidos, centroAcopioId: value }
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los centros</option>
              {centrosAcopio.map((centro: Establecimiento) => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vacuna</label>
            <select
              value={filtrosReportes.stockActual.vacunaId || ''}
              onChange={(e) => {
                const value = e.target.value || undefined;
                setFiltrosReportes(prev => ({
                  ...prev,
                  stockActual: { ...prev.stockActual, vacunaId: value },
                  stockCritico: { ...prev.stockCritico, vacunaId: value },
                  vencimientos: { ...prev.vencimientos, vacunaId: value },
                  lotesVencidos: { ...prev.lotesVencidos, vacunaId: value }
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las vacunas</option>
              {vacunas.map((vacuna: Vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Incluir Inactivos</label>
            <select
              value={filtrosReportes.stockActual.incluirInactivos ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value === 'true';
                setFiltrosReportes(prev => ({
                  ...prev,
                  stockActual: { ...prev.stockActual, incluirInactivos: value },
                  stockCritico: { ...prev.stockCritico, incluirInactivos: value },
                  vencimientos: { ...prev.vencimientos, incluirInactivos: value },
                  lotesVencidos: { ...prev.lotesVencidos, incluirInactivos: value }
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="false">Solo activos</option>
              <option value="true">Incluir inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje de Error */}
      {estado.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al generar reporte</p>
              <p className="text-sm text-red-600">{estado.error}</p>
            </div>
            <button
              onClick={limpiarError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Reportes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportesInventario.map((reporte) => {
          const Icon = reporte.icon;
          const isLoading = estado.cargando && reporteActivo === reporte.id;
          const hasData = reporte.datos.length > 0;

          return (
            <div key={reporte.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`bg-${reporte.color}-100 p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${reporte.color}-600`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                    {hasData && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {reporte.datos.length} registros
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={reporte.generar}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                    isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : `bg-${reporte.color}-600 text-white hover:bg-${reporte.color}-700`
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 inline-block border-2 border-white border-t-transparent rounded-full"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2 inline" />
                      Generar
                    </>
                  )}
                </button>

                {hasData && (
                  <>
                    <button
                      onClick={() => setReporteVisualizando(reporte.id)}
                      className={`flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium mr-2`}
                    >
                      <Eye className="h-4 w-4 mr-2 inline" />
                      Ver Datos
                    </button>
                    <button
                      onClick={() => handleExportarExcel(reporte.id)}
                      className={`flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium`}
                    >
                      <Download className="h-4 w-4 mr-2 inline" />
                      Exportar Excel
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Kardex Detallado */}
      {showKardexModal && (
        <KardexDetalladoModal
          onClose={() => setShowKardexModal(false)}
          onExportar={handleExportarKardex}
          vacunas={vacunas}
          centrosAcopio={centrosAcopio}
        />
      )}

      {/* Modal para visualizar datos del reporte */}
      {reporteVisualizando && (
        <VisualizarReporteModal
          tipoReporte={reporteVisualizando}
          datos={reportes}
          onClose={() => setReporteVisualizando(null)}
        />
      )}
    </div>
  );
};

// Modal para configurar filtros de Kardex Detallado
interface KardexDetalladoModalProps {
  onClose: () => void;
  onExportar: (filtros: FiltrosKardexDetallado) => void;
  vacunas: Vacuna[];
  centrosAcopio: Establecimiento[];
}

const KardexDetalladoModal: React.FC<KardexDetalladoModalProps> = ({
  onClose,
  onExportar,
  vacunas,
  centrosAcopio
}) => {
  // Función para obtener fecha actual en zona horaria de Perú
  const getFechaPeruActual = () => {
    const ahora = new Date();
    // Perú está en UTC-5 (sin horario de verano)
    const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    return fechaPeru.toISOString().split('T')[0];
  };

  const getFechaPeruMesAnterior = () => {
    const ahora = new Date();
    // Perú está en UTC-5 (sin horario de verano)
    const fechaPeru = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    fechaPeru.setMonth(fechaPeru.getMonth() - 1);
    return fechaPeru.toISOString().split('T')[0];
  };

  const [filtros, setFiltros] = React.useState<FiltrosKardexDetallado>({
    fechaInicio: getFechaPeruMesAnterior(),
    fechaFin: getFechaPeruActual()
  });

  const [jeringas, setJeringas] = React.useState<any[]>([]);
  const [lotes, setLotes] = React.useState<any[]>([]);
  const [loadingJeringas, setLoadingJeringas] = React.useState(false);
  const [loadingLotes, setLoadingLotes] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [exportando, setExportando] = React.useState(false);

  // Cargar jeringas al montar el componente
  React.useEffect(() => {
    const cargarJeringas = async () => {
      setLoadingJeringas(true);
      try {
        // Usar el servicio real de Kardex
        const jeringasData = await KardexService.getJeringas();
        setJeringas(jeringasData);
        console.log('✅ Jeringas cargadas desde KardexService:', jeringasData.length);
      } catch (error) {
        console.error('❌ Error al cargar jeringas:', error);
        setJeringas([]);
      } finally {
        setLoadingJeringas(false);
      }
    };

    cargarJeringas();
  }, []);

  // Cargar lotes cuando cambie el tipo o item seleccionado
  React.useEffect(() => {
    const cargarLotes = async () => {
      if (!filtros.tipo || !filtros.itemId) {
        setLotes([]);
        return;
      }

      setLoadingLotes(true);
      try {
        let lotesData: any[] = [];

        if (filtros.tipo === 'vacuna') {
          lotesData = await KardexService.getLotesVacunas(filtros.itemId);
        } else if (filtros.tipo === 'jeringa') {
          lotesData = await KardexService.getLotesJeringas(filtros.itemId);
        }

        setLotes(lotesData);
        console.log(`✅ Lotes de ${filtros.tipo} cargados:`, lotesData.length);
      } catch (error) {
        console.error('❌ Error al cargar lotes:', error);
        setLotes([]);
      } finally {
        setLoadingLotes(false);
      }
    };

    cargarLotes();
  }, [filtros.tipo, filtros.itemId]);

  const handleExportar = async () => {
    setExportando(true);
    try {
      const filtrosCompletos = {
        ...filtros,
        search: searchTerm || undefined
      };
      await onExportar(filtrosCompletos);
    } finally {
      setExportando(false);
    }
  };

  const getItemsDisponibles = () => {
    if (!filtros.tipo) return [];
    return filtros.tipo === 'vacuna' ? vacunas : jeringas;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Archive className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-semibold text-gray-900">Configurar Kardex Detallado</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Fechas */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Rango de Fechas *
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Filtros de Tipo y Item */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Filtros de Producto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={filtros.tipo || ''}
                  onChange={(e) => {
                    const nuevoTipo = e.target.value as 'vacuna' | 'jeringa' || undefined;
                    setFiltros(prev => ({
                      ...prev,
                      tipo: nuevoTipo,
                      itemId: undefined, // Reset item cuando cambia tipo
                      loteId: undefined  // Reset lote cuando cambia tipo
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="vacuna">Vacunas</option>
                  <option value="jeringa">Jeringas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filtros.tipo === 'vacuna' ? 'Vacuna' : filtros.tipo === 'jeringa' ? 'Jeringa' : 'Item'}
                </label>
                <select
                  value={filtros.itemId || ''}
                  onChange={(e) => setFiltros(prev => ({
                    ...prev,
                    itemId: e.target.value || undefined,
                    loteId: undefined // Reset lote cuando cambia item
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={!filtros.tipo || (filtros.tipo === 'jeringa' && loadingJeringas)}
                >
                  <option value="">Todos</option>
                  {getItemsDisponibles().map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                {filtros.tipo === 'jeringa' && loadingJeringas && (
                  <div className="text-xs text-gray-500 mt-1">Cargando jeringas...</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lote</label>
                <select
                  value={filtros.loteId || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, loteId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={!filtros.itemId || loadingLotes}
                >
                  <option value="">Todos</option>
                  {lotes.map((lote: any) => (
                    <option key={lote.id} value={lote.id}>
                      {lote.numero}
                    </option>
                  ))}
                </select>
                {loadingLotes && (
                  <div className="text-xs text-gray-500 mt-1">Cargando lotes...</div>
                )}
              </div>
            </div>
          </div>

          {/* Filtros de Movimiento y Establecimiento */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Filtros de Movimiento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
                <select
                  value={filtros.tipoMovimiento || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipoMovimiento: e.target.value as any || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="ingreso">Ingreso</option>
                  <option value="salida">Salida</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Establecimiento</label>
                <select
                  value={filtros.establecimientoId || ''}
                  onChange={(e) => setFiltros(prev => ({ ...prev, establecimientoId: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {centrosAcopio.map((centro) => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Búsqueda y Opciones Adicionales */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Búsqueda y Opciones
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda General</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por documento, número de documento, observaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="incluirTrazabilidad"
                  checked={filtros.incluirTrazabilidad || false}
                  onChange={(e) => setFiltros(prev => ({ ...prev, incluirTrazabilidad: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="incluirTrazabilidad" className="ml-2 text-sm text-gray-700">
                  Incluir información de trazabilidad completa
                </label>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleExportar}
              disabled={exportando}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {exportando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MovimientosReportesTabProps {
  filtros: any;
  setFiltros: (filtros: any) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onGenerarReporte: (formato: string) => void;
}

const MovimientosReportesTab: React.FC<MovimientosReportesTabProps> = ({
  filtros,
  setFiltros,
  centrosAcopio,
  onGenerarReporte,
}) => {
  const reportesMovimientos = [
    { id: 'movimientos_mensual', nombre: 'Movimientos Mensuales', descripcion: 'Resumen mensual', icon: TrendingUp },
    { id: 'entregas_establecimiento', nombre: 'Entregas por Establecimiento', descripcion: 'Detalle de entregas', icon: Package },
    { id: 'consumo_historico', nombre: 'Consumo Histórico', descripcion: 'Tendencias de consumo', icon: BarChart3 },
    { id: 'eficiencia_distribucion', nombre: 'Eficiencia de Distribución', descripcion: 'Métricas de eficiencia', icon: Target }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reportes de Movimientos</h2>
      </div>

      {/* Filtros Simplificados */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centro</label>
            <select
              value={filtros.centroAcopio}
              onChange={(e) => setFiltros({...filtros, centroAcopio: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos</option>
              {centrosAcopio.map((centro: Establecimiento) => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select
              value={filtros.formato}
              onChange={(e) => setFiltros({...filtros, formato: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportesMovimientos.map((reporte) => {
          const Icon = reporte.icon;
          return (
            <div key={reporte.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                  <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => alert('Vista previa del reporte...')}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  Vista Previa
                </button>
                <button
                  onClick={() => onGenerarReporte(filtros.formato)}
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Generar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PlanificacionReportesTabProps {
  filtros: any;
  setFiltros: (filtros: any) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onGenerarReporte: (formato: string) => void;
}

const PlanificacionReportesTab: React.FC<PlanificacionReportesTabProps> = ({
  filtros,
  setFiltros,
  vacunas,
  onGenerarReporte,
}) => {
  const reportesPlanificacion = [
    { id: 'programacion_anual', nombre: 'Programación Anual', descripcion: 'Plan anual por vacuna', icon: Target },
    { id: 'cumplimiento_metas', nombre: 'Cumplimiento de Metas', descripcion: 'Avance vs programado', icon: CheckCircle },
    { id: 'proyeccion_demanda', nombre: 'Proyección de Demanda', descripcion: 'Estimación de necesidades', icon: TrendingUp },
    { id: 'distribucion_geografica', nombre: 'Distribución Geográfica', descripcion: 'Análisis por zonas', icon: BarChart3 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reportes de Planificación</h2>
      </div>

      {/* Filtros Simplificados */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vacuna</label>
            <select
              value={filtros.vacuna}
              onChange={(e) => setFiltros({...filtros, vacuna: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="todas">Todas</option>
              {vacunas.map((vacuna: Vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select
              value={filtros.formato}
              onChange={(e) => setFiltros({...filtros, formato: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportesPlanificacion.map((reporte) => {
          const Icon = reporte.icon;
          return (
            <div key={reporte.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                  <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => alert('Vista previa del reporte...')}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  Vista Previa
                </button>
                <button
                  onClick={() => onGenerarReporte(filtros.formato)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Generar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface EjecutivoReportesTabProps {
  filtros: any;
  setFiltros: (filtros: any) => void;
  onGenerarReporte: (formato: string) => void;
}

const EjecutivoReportesTab: React.FC<EjecutivoReportesTabProps> = ({
  filtros,
  setFiltros,
  onGenerarReporte,
}) => {
  const reportesEjecutivo = [
    { id: 'dashboard_ejecutivo', nombre: 'Dashboard Ejecutivo', descripcion: 'Métricas clave consolidadas', icon: Star },
    { id: 'analisis_costo', nombre: 'Análisis de Costos', descripcion: 'Análisis económico del programa', icon: BarChart3 },
    { id: 'indicadores_kpi', nombre: 'Indicadores KPI', descripcion: 'Indicadores clave de rendimiento', icon: Target },
    { id: 'reporte_ministerial', nombre: 'Reporte Ministerial', descripcion: 'Formato oficial para MINSA', icon: FileText }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reportes Ejecutivos</h2>
      </div>

      {/* Filtros Mínimos */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
            <select
              value={filtros.formato}
              onChange={(e) => setFiltros({...filtros, formato: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportesEjecutivo.map((reporte) => {
          const Icon = reporte.icon;
          return (
            <div key={reporte.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                  <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => alert('Vista previa del reporte...')}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  Vista Previa
                </button>
                <button
                  onClick={() => onGenerarReporte(filtros.formato)}
                  className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Generar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



// Reportes Programados Tab
interface ReportesProgramadosTabProps {
  reportesProgramados: any[];
  setReportesProgramados: (reportes: any[]) => void;
}

const ReportesProgramadosTab: React.FC<ReportesProgramadosTabProps> = ({
  reportesProgramados,
  setReportesProgramados,
}) => {
  const handleEliminarReporte = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este reporte programado?')) {
      setReportesProgramados(reportesProgramados.filter(r => r.id !== id));
    }
  };

  const handleToggleEstado = (id: string) => {
    setReportesProgramados(reportesProgramados.map(r => 
      r.id === id ? { ...r, estado: r.estado === 'activo' ? 'inactivo' : 'activo' } : r
    ));
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas de Reportes Programados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Programados</p>
              <p className="text-2xl font-bold text-gray-900">{reportesProgramados.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportesProgramados.filter(r => r.estado === 'activo').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Próxima Ejecución</p>
              <p className="text-sm font-bold text-gray-900">Hoy 18:00</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enviados Hoy</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reportes Programados */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reportes Programados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frecuencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima Ejecución
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinatarios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportesProgramados.map((reporte) => (
                <tr key={reporte.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reporte.nombre}</div>
                        <div className="text-sm text-gray-500">{reporte.formato.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {reporte.frecuencia}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reporte.proximaEjecucion.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reporte.destinatarios.length} destinatario(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleEstado(reporte.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reporte.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reporte.estado}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEliminarReporte(reporte.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Configuración de Reportes Tab
const ConfiguracionReportesTab: React.FC = () => {
  const [configuracion, setConfiguracion] = useState({
    logoPersonalizado: false,
    incluirFirmaDigital: true,
    formatoFechaDefault: 'dd/mm/yyyy',
    idiomaDefault: 'es',
    tiempoRetencion: '12',
    notificacionesEmail: true,
    compressionPDF: 'media',
    marcaAgua: false,
    encriptacionReportes: false,
    backupAutomatico: true
  });

  return (
    <div className="space-y-6">
      {/* Configuración General */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Fecha por Defecto
            </label>
            <select
              value={configuracion.formatoFechaDefault}
              onChange={(e) => setConfiguracion({...configuracion, formatoFechaDefault: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma por Defecto
            </label>
            <select
              value={configuracion.idiomaDefault}
              onChange={(e) => setConfiguracion({...configuracion, idiomaDefault: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="qu">Quechua</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo de Retención (meses)
            </label>
            <select
              value={configuracion.tiempoRetencion}
              onChange={(e) => setConfiguracion({...configuracion, tiempoRetencion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compresión PDF
            </label>
            <select
              value={configuracion.compressionPDF}
              onChange={(e) => setConfiguracion({...configuracion, compressionPDF: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="baja">Baja (mejor calidad)</option>
              <option value="media">Media (balanceado)</option>
              <option value="alta">Alta (menor tamaño)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuración de Seguridad */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Firma Digital</h4>
              <p className="text-sm text-gray-500">Incluir firma digital en los reportes PDF</p>
            </div>
            <button
              onClick={() => setConfiguracion({...configuracion, incluirFirmaDigital: !configuracion.incluirFirmaDigital})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                configuracion.incluirFirmaDigital ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  configuracion.incluirFirmaDigital ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Marca de Agua</h4>
              <p className="text-sm text-gray-500">Agregar marca de agua institucional</p>
            </div>
            <button
              onClick={() => setConfiguracion({...configuracion, marcaAgua: !configuracion.marcaAgua})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                configuracion.marcaAgua ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  configuracion.marcaAgua ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Encriptación de Reportes</h4>
              <p className="text-sm text-gray-500">Encriptar reportes sensibles automáticamente</p>
            </div>
            <button
              onClick={() => setConfiguracion({...configuracion, encriptacionReportes: !configuracion.encriptacionReportes})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                configuracion.encriptacionReportes ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  configuracion.encriptacionReportes ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Configuración de Notificaciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Notificaciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notificaciones por Email</h4>
              <p className="text-sm text-gray-500">Enviar notificaciones cuando se generen reportes</p>
            </div>
            <button
              onClick={() => setConfiguracion({...configuracion, notificacionesEmail: !configuracion.notificacionesEmail})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                configuracion.notificacionesEmail ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  configuracion.notificacionesEmail ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Backup Automático</h4>
              <p className="text-sm text-gray-500">Crear copias de seguridad automáticas de reportes</p>
            </div>
            <button
              onClick={() => setConfiguracion({...configuracion, backupAutomatico: !configuracion.backupAutomatico})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                configuracion.backupAutomatico ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  configuracion.backupAutomatico ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Guardar Configuración
        </button>
      </div>
    </div>
  );
};

// Modal Generador de Reporte
interface GeneradorReporteModalProps {
  selectedReporte: string;
  filtros: any;
  setFiltros: (filtros: any) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onClose: () => void;
  onGenerar: (formato: string) => void;
}

const GeneradorReporteModal: React.FC<GeneradorReporteModalProps> = ({
  selectedReporte,
  filtros,
  setFiltros,
  centrosAcopio,
  vacunas,
  onClose,
  onGenerar,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configurar y Generar Reporte
          </h2>
          
          <div className="space-y-6">
            {/* Información del Reporte */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Reporte Seleccionado</h3>
              <p className="text-blue-800">{selectedReporte}</p>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centro de Acopio
                </label>
                <select
                  value={filtros.centroAcopio}
                  onChange={(e) => setFiltros({...filtros, centroAcopio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los centros</option>
                  {centrosAcopio.map((centro) => (
                    <option key={centro.id} value={centro.id}>
                      {centro.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vacuna
                </label>
                <select
                  value={filtros.vacuna}
                  onChange={(e) => setFiltros({...filtros, vacuna: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas las vacunas</option>
                  {vacunas.map((vacuna) => (
                    <option key={vacuna.id} value={vacuna.id}>
                      {vacuna.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={filtros.tipoReporte}
                  onChange={(e) => setFiltros({...filtros, tipoReporte: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="detallado">Detallado</option>
                  <option value="resumen">Resumen</option>
                  <option value="ejecutivo">Ejecutivo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Salida
                </label>
                <select
                  value={filtros.formato}
                  onChange={(e) => setFiltros({...filtros, formato: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="word">Word</option>
                </select>
              </div>
            </div>

            {/* Opciones Avanzadas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Opciones Avanzadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input type="checkbox" id="incluir-graficos" className="mr-2" />
                  <label htmlFor="incluir-graficos" className="text-sm text-gray-700">
                    Incluir gráficos y visualizaciones
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="incluir-anexos" className="mr-2" />
                  <label htmlFor="incluir-anexos" className="text-sm text-gray-700">
                    Incluir anexos y tablas detalladas
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="firma-digital" className="mr-2" defaultChecked />
                  <label htmlFor="firma-digital" className="text-sm text-gray-700">
                    Incluir firma digital
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="marca-agua" className="mr-2" />
                  <label htmlFor="marca-agua" className="text-sm text-gray-700">
                    Agregar marca de agua
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => alert('Vista previa del reporte...')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Vista Previa
            </button>
            <button
              onClick={() => {
                onGenerar(filtros.formato);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Programar Reporte - Versión Simplificada
interface ProgramarReporteModalProps {
  onClose: () => void;
  onProgramar: (reporte: any) => void;
}

const ProgramarReporteModal: React.FC<ProgramarReporteModalProps> = ({
  onClose,
  onProgramar,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'inventario',
    frecuencia: 'mensual',
    destinatarios: '',
    formato: 'pdf',
    estado: 'activo'
  });

  const tiposReporte = [
    { id: 'inventario', nombre: 'Inventario' },
    { id: 'movimientos', nombre: 'Movimientos' },
    { id: 'planificacion', nombre: 'Planificación' },
    { id: 'ejecutivo', nombre: 'Ejecutivo' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proximaEjecucion = new Date();
    proximaEjecucion.setDate(proximaEjecucion.getDate() + 30); // Próximo mes

    onProgramar({
      ...formData,
      proximaEjecucion,
      destinatarios: formData.destinatarios.split(',').map(email => email.trim())
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full m-4 shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Programar Reporte Automático
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Reporte
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Reporte Mensual de Stock"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tiposReporte.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </label>
                <select
                  value={formData.frecuencia}
                  onChange={(e) => setFormData({...formData, frecuencia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinatarios (separados por comas)
              </label>
              <textarea
                required
                value={formData.destinatarios}
                onChange={(e) => setFormData({...formData, destinatarios: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={2}
                placeholder="coordinadora@saludapurimac.gob.pe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={formData.formato}
                onChange={(e) => setFormData({...formData, formato: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Programar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal para visualizar datos del reporte
interface VisualizarReporteModalProps {
  tipoReporte: string;
  datos: any;
  onClose: () => void;
}

const VisualizarReporteModal: React.FC<VisualizarReporteModalProps> = ({
  tipoReporte,
  datos,
  onClose
}) => {
  const renderStockCritico = () => {
    if (!datos.stockCritico || datos.stockCritico.length === 0) {
      return (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay vacunas con stock crítico</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vacuna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Crítico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción Recomendada
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datos.stockCritico.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-sm text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{item.stockTotal.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.stockMinimo.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.porcentajeCritico}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.nivelCriticidad === 'agotado'
                      ? 'bg-red-100 text-red-800'
                      : item.nivelCriticidad === 'critico'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.nivelCriticidad.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{item.recomendacionAccion}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStockActual = () => {
    if (!datos.stockActual || datos.stockActual.length === 0) {
      return (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos de stock actual</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vacuna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Lotes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lotes por Vencer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Actualización
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datos.stockActual.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-sm text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{item.stockTotal.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.totalLotes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.lotesPorVencer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(item.ultimaActualizacion).toLocaleDateString('es-PE')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVencimientos = () => {
    if (!datos.vencimientos || datos.vencimientos.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay lotes próximos a vencer</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lote
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vacuna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días para Vencer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Urgencia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datos.vencimientos.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.numeroLote}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.vacunaNombre}</div>
                  <div className="text-sm text-gray-500">{item.vacunaTipo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{item.cantidadActual.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(item.fechaVencimiento).toLocaleDateString('es-PE')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.diasParaVencer} días</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.nivelUrgencia === 'inmediato'
                      ? 'bg-red-100 text-red-800'
                      : item.nivelUrgencia === 'urgente'
                      ? 'bg-orange-100 text-orange-800'
                      : item.nivelUrgencia === 'atencion'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.nivelUrgencia.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLotesVencidos = () => {
    if (!datos.lotesVencidos || datos.lotesVencidos.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay lotes vencidos</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nº Lote
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vacuna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Vencimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días Vencido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criticidad
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {datos.lotesVencidos.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.numeroLote}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.vacunaNombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.vacunaTipo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.cantidadActual.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(item.fechaVencimiento).toLocaleDateString('es-PE')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-red-600">{item.diasVencido} días</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.nivelCriticidad === 'extremo'
                      ? 'bg-red-100 text-red-800'
                      : item.nivelCriticidad === 'muy_critico'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.nivelCriticidad.toUpperCase().replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getTitulo = () => {
    switch (tipoReporte) {
      case 'stock_critico':
        return 'Stock Crítico';
      case 'stock_actual':
        return 'Stock Actual';
      case 'vencimientos':
        return 'Próximos Vencimientos';
      case 'lotes_vencidos':
        return 'Lotes Vencidos';
      default:
        return 'Datos del Reporte';
    }
  };

  const renderContent = () => {
    switch (tipoReporte) {
      case 'stock_critico':
        return renderStockCritico();
      case 'stock_actual':
        return renderStockActual();
      case 'vencimientos':
        return renderVencimientos();
      case 'lotes_vencidos':
        return renderLotesVencidos();
      default:
        return <div className="text-center py-8"><p className="text-gray-500">Tipo de reporte no soportado</p></div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full m-4 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              📊 {getTitulo()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reportes;