import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  Eye,
  TrendingUp,
  Target,
  BarChart3,
  Package,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Clock
} from 'lucide-react';
import { Establecimiento, Vacuna } from '../../types';
import { FiltrosReporteBase, ConfiguracionExportacion } from '../../types/reportes';

interface ProgramacionSeguimientoAnualTabProps {
  filtros: FiltrosReporteBase;
  setFiltros: (filtros: FiltrosReporteBase) => void;
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
  onGenerarReporte: (tipo: string) => void;
}

interface ReporteProgramacionSeguimiento {
  id: string;
  nombre: string;
  descripcion: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  datos: any[];
  generar: () => void;
  exportar: () => void;
}

const ProgramacionSeguimientoAnualTab: React.FC<ProgramacionSeguimientoAnualTabProps> = ({
  filtros,
  setFiltros,
  centrosAcopio,
  vacunas,
  onGenerarReporte
}) => {
  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleGenerarReporte = async (tipoReporte: string) => {
    setReporteActivo(tipoReporte);
    setCargando(true);
    
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 2000));
      onGenerarReporte(tipoReporte);
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setCargando(false);
      setReporteActivo(null);
    }
  };

  const handleExportarReporte = (tipoReporte: string) => {
    console.log('Exportando reporte:', tipoReporte);
    // Aquí se implementaría la lógica de exportación
  };

  const reportesProgramacionSeguimiento: ReporteProgramacionSeguimiento[] = [
    {
      id: 'programacion_anual_cenares',
      nombre: 'Programación Anual CENARES',
      descripcion: 'Plan anual de entregas programadas por CENARES',
      icon: Calendar,
      color: 'blue',
      datos: [], // Se cargarían desde el backend
      generar: () => handleGenerarReporte('programacion_anual_cenares'),
      exportar: () => handleExportarReporte('programacion_anual_cenares')
    },
    {
      id: 'seguimiento_entregas',
      nombre: 'Seguimiento de Entregas',
      descripcion: 'Monitoreo del cumplimiento de entregas programadas',
      icon: TrendingUp,
      color: 'green',
      datos: [],
      generar: () => handleGenerarReporte('seguimiento_entregas'),
      exportar: () => handleExportarReporte('seguimiento_entregas')
    },
    {
      id: 'cumplimiento_cronograma',
      nombre: 'Cumplimiento de Cronograma',
      descripcion: 'Análisis de cumplimiento vs programación',
      icon: CheckCircle,
      color: 'purple',
      datos: [],
      generar: () => handleGenerarReporte('cumplimiento_cronograma'),
      exportar: () => handleExportarReporte('cumplimiento_cronograma')
    },
    {
      id: 'proyeccion_necesidades',
      nombre: 'Proyección de Necesidades',
      descripción: 'Estimación de necesidades futuras basada en tendencias',
      icon: Target,
      color: 'orange',
      datos: [],
      generar: () => handleGenerarReporte('proyeccion_necesidades'),
      exportar: () => handleExportarReporte('proyeccion_necesidades')
    }
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
    green: { bg: 'bg-green-100', text: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">Programación y Seguimiento Anual</h2>
            <p className="text-gray-600">Gestión y monitoreo de entregas CENARES</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.año || new Date().getFullYear()}
              onChange={(e) => setFiltros({ ...filtros, año: parseInt(e.target.value) })}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Centro de Acopio
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.centroAcopio || ''}
              onChange={(e) => setFiltros({ ...filtros, centroAcopio: e.target.value })}
            >
              <option value="">Todos los centros</option>
              {centrosAcopio.map(centro => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vacuna
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filtros.vacuna || ''}
              onChange={(e) => setFiltros({ ...filtros, vacuna: e.target.value })}
            >
              <option value="">Todas las vacunas</option>
              {vacunas.map(vacuna => (
                <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportesProgramacionSeguimiento.map((reporte) => {
          const Icon = reporte.icon;
          const colors = colorClasses[reporte.color as keyof typeof colorClasses] || colorClasses.blue;
          const isGenerating = reporteActivo === reporte.id;

          return (
            <div key={reporte.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`${colors.bg} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                    {reporte.datos && reporte.datos.length > 0 && (
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
                  disabled={isGenerating || cargando}
                  className={`flex-1 flex items-center justify-center px-4 py-2 ${colors.button} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Reporte
                    </>
                  )}
                </button>
                
                <button
                  onClick={reporte.exportar}
                  disabled={cargando}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-blue-900 mb-2">Información sobre Reportes CENARES</h4>
            <p className="text-blue-800 text-sm mb-2">
              Los reportes de Programación y Seguimiento Anual permiten monitorear el cumplimiento 
              de las entregas programadas por CENARES y realizar proyecciones basadas en tendencias históricas.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Programación Anual: Plan detallado de entregas por período</li>
              <li>• Seguimiento: Monitoreo en tiempo real del cumplimiento</li>
              <li>• Cumplimiento: Análisis comparativo programado vs ejecutado</li>
              <li>• Proyección: Estimaciones futuras basadas en datos históricos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionSeguimientoAnualTab;
