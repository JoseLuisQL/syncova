import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3, PieChart, TrendingUp, Building2, Package, Users, AlertTriangle, CheckCircle, Clock, Target, Activity, FileSpreadsheet, File as FilePdf, Printer, Settings, Eye, RefreshCw, Search, Plus, Edit, Trash2, Share2, Mail, Database, LineChart, DollarSign, Percent, Calendar as CalendarIcon, MapPin, Layers, Grid, List, BookOpen, Archive, Star, Bookmark } from 'lucide-react';
import { mockEstablecimientos, mockVacunas, mockLotes, mockMovimientos } from '../../data/mockData';
import { Establecimiento, Vacuna, Lote, MovimientoVacuna } from '../../types';

const Reportes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generador' | 'programados' | 'configuracion'>('dashboard');
  const [selectedReporte, setSelectedReporte] = useState<string>('');
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    centroAcopio: 'todos',
    vacuna: 'todas',
    establecimiento: 'todos',
    tipoReporte: 'detallado',
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard de Reportes', icon: BarChart3 },
    { id: 'generador', label: 'Generador de Reportes', icon: FileText },
    { id: 'programados', label: 'Reportes Programados', icon: Clock },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const tiposReporte = [
    {
      id: 'inventario',
      nombre: 'Inventario y Stock',
      descripcion: 'Reportes de inventario actual, stock por vacuna y alertas',
      icono: Package,
      color: 'bg-blue-500',
      reportes: [
        { id: 'stock_actual', nombre: 'Stock Actual por Vacuna', descripcion: 'Estado actual del inventario' },
        { id: 'stock_critico', nombre: 'Stock Crítico', descripcion: 'Vacunas con stock bajo' },
        { id: 'vencimientos', nombre: 'Próximos Vencimientos', descripcion: 'Lotes próximos a vencer' },
        { id: 'kardex_detallado', nombre: 'Kardex Detallado', descripcion: 'Movimientos detallados por período' }
      ]
    },
    {
      id: 'movimientos',
      nombre: 'Movimientos y Distribución',
      descripcion: 'Análisis de entregas, recepciones y transferencias',
      icono: TrendingUp,
      color: 'bg-green-500',
      reportes: [
        { id: 'movimientos_mensual', nombre: 'Movimientos Mensuales', descripcion: 'Resumen de movimientos del mes' },
        { id: 'entregas_establecimiento', nombre: 'Entregas por Establecimiento', descripcion: 'Detalle de entregas realizadas' },
        { id: 'consumo_historico', nombre: 'Consumo Histórico', descripcion: 'Análisis de tendencias de consumo' },
        { id: 'eficiencia_distribucion', nombre: 'Eficiencia de Distribución', descripcion: 'Métricas de eficiencia' }
      ]
    },
    {
      id: 'planificacion',
      nombre: 'Planificación y Programación',
      descripcion: 'Reportes de programación anual y cumplimiento de metas',
      icono: Target,
      color: 'bg-purple-500',
      reportes: [
        { id: 'programacion_anual', nombre: 'Programación Anual', descripcion: 'Plan anual por vacuna' },
        { id: 'cumplimiento_metas', nombre: 'Cumplimiento de Metas', descripcion: 'Avance vs programado' },
        { id: 'proyeccion_demanda', nombre: 'Proyección de Demanda', descripcion: 'Estimación de necesidades futuras' },
        { id: 'distribucion_geografica', nombre: 'Distribución Geográfica', descripción: 'Análisis por zonas geográficas' }
      ]
    },
    {
      id: 'operacional',
      nombre: 'Operacional y Logística',
      descripcion: 'Reportes operacionales y de gestión logística',
      icono: Activity,
      color: 'bg-orange-500',
      reportes: [
        { id: 'cadena_frio', nombre: 'Cadena de Frío', descripcion: 'Control de temperatura y almacenamiento' },
        { id: 'establecimientos_activos', nombre: 'Establecimientos Activos', descripcion: 'Estado de establecimientos' },
        { id: 'usuarios_sistema', nombre: 'Usuarios del Sistema', descripcion: 'Actividad de usuarios' },
        { id: 'alertas_sistema', nombre: 'Alertas del Sistema', descripcion: 'Resumen de alertas generadas' }
      ]
    },
    {
      id: 'ejecutivo',
      nombre: 'Ejecutivo y Estratégico',
      descripcion: 'Reportes ejecutivos para toma de decisiones estratégicas',
      icono: Star,
      color: 'bg-red-500',
      reportes: [
        { id: 'dashboard_ejecutivo', nombre: 'Dashboard Ejecutivo', descripcion: 'Métricas clave consolidadas' },
        { id: 'analisis_costo', nombre: 'Análisis de Costos', descripcion: 'Análisis económico del programa' },
        { id: 'indicadores_kpi', nombre: 'Indicadores KPI', descripcion: 'Indicadores clave de rendimiento' },
        { id: 'reporte_ministerial', nombre: 'Reporte Ministerial', descripcion: 'Formato oficial para MINSA' }
      ]
    }
  ];

  const centrosAcopio = mockEstablecimientos.filter(e => e.tipo === 'centro_acopio');

  const handleGenerarReporte = (tipoReporte: string, subReporte: string) => {
    setSelectedReporte(`${tipoReporte}_${subReporte}`);
    setShowModalGenerador(true);
  };

  const handleProgramarReporte = () => {
    setShowModalProgramar(true);
  };

  const handleExportarReporte = (formato: string) => {
    alert(`Generando reporte en formato ${formato.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sistema de Reportes Avanzados</h2>
          <p className="text-gray-600 mt-1">Generación de reportes profesionales y análisis estadístico avanzado</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleProgramarReporte}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Clock className="h-4 w-4 mr-2" />
            Programar Reporte
          </button>
          <button
            onClick={() => setShowModalGenerador(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <DashboardReportesTab 
          tiposReporte={tiposReporte}
          onGenerarReporte={handleGenerarReporte}
        />
      )}
      
      {activeTab === 'generador' && (
        <GeneradorReportesTab 
          tiposReporte={tiposReporte}
          filtros={filtros}
          setFiltros={setFiltros}
          centrosAcopio={centrosAcopio}
          vacunas={mockVacunas}
          onGenerarReporte={handleExportarReporte}
        />
      )}
      
      {activeTab === 'programados' && (
        <ReportesProgramadosTab 
          reportesProgramados={reportesProgramados}
          setReportesProgramados={setReportesProgramados}
        />
      )}
      
      {activeTab === 'configuracion' && (
        <ConfiguracionReportesTab />
      )}

      {/* Modal Generador de Reportes */}
      {showModalGenerador && (
        <GeneradorReporteModal
          selectedReporte={selectedReporte}
          filtros={filtros}
          setFiltros={setFiltros}
          centrosAcopio={centrosAcopio}
          vacunas={mockVacunas}
          onClose={() => setShowModalGenerador(false)}
          onGenerar={handleExportarReporte}
        />
      )}

      {/* Modal Programar Reporte */}
      {showModalProgramar && (
        <ProgramarReporteModal
          tiposReporte={tiposReporte}
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

// Dashboard de Reportes Tab
interface DashboardReportesTabProps {
  tiposReporte: any[];
  onGenerarReporte: (tipo: string, subReporte: string) => void;
}

const DashboardReportesTab: React.FC<DashboardReportesTabProps> = ({
  tiposReporte,
  onGenerarReporte,
}) => {
  const estadisticas = [
    {
      label: 'Reportes Generados',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Reportes Programados',
      value: '23',
      change: '+3',
      trend: 'up',
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      label: 'Usuarios Activos',
      value: '45',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      label: 'Tiempo Promedio',
      value: '2.3s',
      change: '-15%',
      trend: 'down',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  const reportesRecientes = [
    {
      nombre: 'Stock Actual por Vacuna',
      tipo: 'Inventario',
      fecha: new Date('2024-12-15T10:30:00'),
      usuario: 'María Rodríguez',
      estado: 'completado',
      formato: 'PDF'
    },
    {
      nombre: 'Movimientos Mensuales',
      tipo: 'Movimientos',
      fecha: new Date('2024-12-14T16:45:00'),
      usuario: 'Carlos Mendoza',
      estado: 'completado',
      formato: 'Excel'
    },
    {
      nombre: 'Programación Anual BCG',
      tipo: 'Planificación',
      fecha: new Date('2024-12-14T09:15:00'),
      usuario: 'Ana García',
      estado: 'completado',
      formato: 'PDF'
    },
    {
      nombre: 'Dashboard Ejecutivo',
      tipo: 'Ejecutivo',
      fecha: new Date('2024-12-13T14:20:00'),
      usuario: 'José Huamán',
      estado: 'completado',
      formato: 'PDF'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
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

      {/* Tipos de Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tiposReporte.map((tipo) => {
          const Icon = tipo.icono;
          return (
            <div key={tipo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className={`${tipo.color} p-4`}>
                <div className="flex items-center text-white">
                  <Icon className="h-6 w-6 mr-3" />
                  <div>
                    <h3 className="font-semibold text-lg">{tipo.nombre}</h3>
                    <p className="text-sm opacity-90">{tipo.descripcion}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {tipo.reportes.map((reporte: any) => (
                    <div key={reporte.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reporte.nombre}</p>
                        <p className="text-xs text-gray-500">{reporte.descripcion}</p>
                      </div>
                      <button
                        onClick={() => onGenerarReporte(tipo.id, reporte.id)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reportes Recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reportes Generados Recientemente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
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
              {reportesRecientes.map((reporte, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reporte.nombre}</div>
                        <div className="text-sm text-gray-500">{reporte.formato}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {reporte.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reporte.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reporte.fecha.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {reporte.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded">
                        <Share2 className="h-4 w-4" />
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

// Generador de Reportes Tab
interface GeneradorReportesTabProps {
  tiposReporte: any[];
  filtros: any;
  setFiltros: (filtros: any) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onGenerarReporte: (formato: string) => void;
}

const GeneradorReportesTab: React.FC<GeneradorReportesTabProps> = ({
  tiposReporte,
  filtros,
  setFiltros,
  centrosAcopio,
  vacunas,
  onGenerarReporte,
}) => {
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedSubReporte, setSelectedSubReporte] = useState('');

  const tipoSeleccionado = tiposReporte.find(t => t.id === selectedTipo);

  return (
    <div className="space-y-6">
      {/* Selector de Tipo de Reporte */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Tipo de Reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiposReporte.map((tipo) => {
            const Icon = tipo.icono;
            return (
              <button
                key={tipo.id}
                onClick={() => {
                  setSelectedTipo(tipo.id);
                  setSelectedSubReporte('');
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedTipo === tipo.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`${tipo.color} p-2 rounded-lg mr-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900">{tipo.nombre}</h4>
                </div>
                <p className="text-sm text-gray-600">{tipo.descripcion}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Sub-reporte */}
      {tipoSeleccionado && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Reporte Específico</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tipoSeleccionado.reportes.map((reporte: any) => (
              <button
                key={reporte.id}
                onClick={() => setSelectedSubReporte(reporte.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedSubReporte === reporte.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h4 className="font-medium text-gray-900 mb-1">{reporte.nombre}</h4>
                <p className="text-sm text-gray-600">{reporte.descripcion}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Configuración de Filtros */}
      {selectedSubReporte && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurar Filtros y Parámetros</h3>
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
        </div>
      )}

      {/* Botones de Acción */}
      {selectedSubReporte && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Generar Reporte</h4>
              <p className="text-sm text-gray-600 mt-1">
                {tipoSeleccionado?.reportes.find((r: any) => r.id === selectedSubReporte)?.nombre}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => alert('Vista previa del reporte...')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </button>
              <button
                onClick={() => onGenerarReporte(filtros.formato)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
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

// Modal Programar Reporte
interface ProgramarReporteModalProps {
  tiposReporte: any[];
  onClose: () => void;
  onProgramar: (reporte: any) => void;
}

const ProgramarReporteModal: React.FC<ProgramarReporteModalProps> = ({
  tiposReporte,
  onClose,
  onProgramar,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    subTipo: '',
    frecuencia: 'mensual',
    diaEjecucion: '1',
    horaEjecucion: '08:00',
    destinatarios: '',
    formato: 'pdf',
    estado: 'activo'
  });

  const tipoSeleccionado = tiposReporte.find(t => t.id === formData.tipo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proximaEjecucion = new Date();
    proximaEjecucion.setDate(parseInt(formData.diaEjecucion));
    if (proximaEjecucion < new Date()) {
      proximaEjecucion.setMonth(proximaEjecucion.getMonth() + 1);
    }

    onProgramar({
      ...formData,
      proximaEjecucion,
      destinatarios: formData.destinatarios.split(',').map(email => email.trim())
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full m-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Programar Reporte Automático
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Reporte *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Reporte Mensual de Stock"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Reporte *
                </label>
                <select
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value, subTipo: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposReporte.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {tipoSeleccionado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reporte Específico *
                  </label>
                  <select
                    required
                    value={formData.subTipo}
                    onChange={(e) => setFormData({...formData, subTipo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar reporte</option>
                    {tipoSeleccionado.reportes.map((reporte: any) => (
                      <option key={reporte.id} value={reporte.id}>
                        {reporte.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia *
                </label>
                <select
                  required
                  value={formData.frecuencia}
                  onChange={(e) => setFormData({...formData, frecuencia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de Ejecución
                </label>
                <select
                  value={formData.diaEjecucion}
                  onChange={(e) => setFormData({...formData, diaEjecucion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day.toString()}>
                      Día {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Ejecución
                </label>
                <input
                  type="time"
                  value={formData.horaEjecucion}
                  onChange={(e) => setFormData({...formData, horaEjecucion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinatarios (emails separados por comas) *
              </label>
              <textarea
                required
                value={formData.destinatarios}
                onChange={(e) => setFormData({...formData, destinatarios: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="coordinadora@saludapurimac.gob.pe, admin@saludapurimac.gob.pe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formato de Salida
              </label>
              <select
                value={formData.formato}
                onChange={(e) => setFormData({...formData, formato: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Programar Reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reportes;