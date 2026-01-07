import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Establecimiento, Vacuna } from '../../../../types';
import { usePlanificacionReportes } from '../../../../hooks/usePlanificacionReportes';
import { useToastContext } from '../../../../contexts/ToastContext';
import { COMPONENT_STYLES } from '../../constants';
import { ReporteCard } from '..';

interface PlanificacionTabProps {
  centrosAcopio: Establecimiento[];
  vacunas: Vacuna[];
}

const PlanificacionTab: React.FC<PlanificacionTabProps> = ({
  centrosAcopio,
  vacunas,
}) => {
  const {
    reportes,
    estado,
    filtros: filtrosPlanificacion,
    generarProgramacionAnual,
    generarCumplimientoMetas,
    generarProyeccionDemanda,
    generarDistribucionGeografica,
    exportarProgramacionAnual,
    exportarCumplimientoMetas,
    exportarProyeccionDemanda,
    exportarDistribucionGeografica,
    actualizarFiltros,
    limpiarError
  } = usePlanificacionReportes();

  const { toast } = useToastContext();
  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [filtrosLocales, setFiltrosLocales] = useState({
    vacuna: 'todas',
    centroAcopio: 'todos'
  });

  useEffect(() => {
    actualizarFiltros({
      anio: new Date().getFullYear(),
      vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
      centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined
    });
  }, [filtrosLocales.vacuna, filtrosLocales.centroAcopio, actualizarFiltros]);

  const handleGenerarReporte = useCallback(async (tipoReporte: string) => {
    try {
      setReporteActivo(tipoReporte);

      const filtros = {
        anio: filtrosPlanificacion.anio || new Date().getFullYear(),
        vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
        centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
        incluirInactivos: false
      };

      let resultado: unknown[] | null = null;

      switch (tipoReporte) {
        case 'programacion_anual':
          resultado = await generarProgramacionAnual(filtros);
          break;
        case 'cumplimiento_metas':
          resultado = await generarCumplimientoMetas(filtros);
          break;
        case 'proyeccion_demanda':
          resultado = await generarProyeccionDemanda(filtros);
          break;
        case 'distribucion_geografica':
          resultado = await generarDistribucionGeografica(filtros);
          break;
      }

      if (resultado && Array.isArray(resultado) && resultado.length === 0) {
        toast.warning('Sin datos disponibles', 'No hay datos para los filtros seleccionados', { duration: 4000 });
      } else if (resultado && resultado.length > 0) {
        toast.success('Reporte generado', `Se generaron ${resultado.length} registros`, { duration: 3000 });
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar reporte', 'Ocurrio un error. Intentalo nuevamente.', { duration: 5000 });
    } finally {
      setReporteActivo(null);
    }
  }, [filtrosPlanificacion.anio, filtrosLocales, generarProgramacionAnual, generarCumplimientoMetas, generarProyeccionDemanda, generarDistribucionGeografica, toast]);

  const handleExportarReporte = useCallback(async (tipoReporte: string) => {
    try {
      const config = {
        anio: filtrosPlanificacion.anio || new Date().getFullYear(),
        vacunaId: filtrosLocales.vacuna !== 'todas' ? filtrosLocales.vacuna : undefined,
        centroAcopioId: filtrosLocales.centroAcopio !== 'todos' ? filtrosLocales.centroAcopio : undefined,
        responsableReporte: 'Usuario del Sistema',
        observaciones: `Reporte generado - Año ${filtrosPlanificacion.anio || new Date().getFullYear()}`
      };

      switch (tipoReporte) {
        case 'programacion_anual':
          await exportarProgramacionAnual(config);
          break;
        case 'cumplimiento_metas':
          await exportarCumplimientoMetas(config);
          break;
        case 'proyeccion_demanda':
          await exportarProyeccionDemanda(config);
          break;
        case 'distribucion_geografica':
          await exportarDistribucionGeografica(config);
          break;
      }

      toast.success('Exportacion exitosa', 'El archivo Excel se ha descargado', { duration: 3000 });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar', 'Ocurrio un error. Intentalo nuevamente.', { duration: 5000 });
    }
  }, [filtrosPlanificacion.anio, filtrosLocales, exportarProgramacionAnual, exportarCumplimientoMetas, exportarProyeccionDemanda, exportarDistribucionGeografica, toast]);

  const reportesPlanificacion = [
    { id: 'programacion_anual', nombre: 'Programacion Anual', descripcion: 'Plan anual por vacuna', icon: Target, color: 'teal' as const, datos: reportes.programacionAnual },
    { id: 'cumplimiento_metas', nombre: 'Cumplimiento de Metas', descripcion: 'Avance vs programado', icon: CheckCircle, color: 'emerald' as const, datos: reportes.cumplimientoMetas },
    { id: 'proyeccion_demanda', nombre: 'Proyeccion de Demanda', descripcion: 'Estimacion de necesidades', icon: TrendingUp, color: 'amber' as const, datos: reportes.proyeccionDemanda },
    { id: 'distribucion_geografica', nombre: 'Distribucion Geografica', descripcion: 'Analisis por zonas', icon: BarChart3, color: 'cyan' as const, datos: reportes.distribucionGeografica },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Reportes de Planificacion</h2>

      {/* Filtros */}
      <div className={COMPONENT_STYLES.filter.container}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={COMPONENT_STYLES.input.label}>Año</label>
            <select
              value={filtrosPlanificacion.anio || new Date().getFullYear()}
              onChange={(e) => actualizarFiltros({ anio: parseInt(e.target.value) })}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Vacuna</label>
            <select
              value={filtrosLocales.vacuna}
              onChange={(e) => setFiltrosLocales(prev => ({ ...prev, vacuna: e.target.value }))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todas">Todas</option>
              {vacunas.map((vacuna) => (
                <option key={vacuna.id} value={vacuna.id}>{vacuna.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={COMPONENT_STYLES.input.label}>Centro de Acopio</label>
            <select
              value={filtrosLocales.centroAcopio}
              onChange={(e) => setFiltrosLocales(prev => ({ ...prev, centroAcopio: e.target.value }))}
              className={`${COMPONENT_STYLES.select.base} ${COMPONENT_STYLES.select.normal}`}
            >
              <option value="todos">Todos</option>
              {centrosAcopio.map((centro) => (
                <option key={centro.id} value={centro.id}>{centro.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {estado.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-rose-800">{estado.error}</p>
            <button onClick={limpiarError} className="text-rose-600 hover:text-rose-800">&times;</button>
          </div>
        </div>
      )}

      {/* Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportesPlanificacion.map((reporte) => (
          <ReporteCard
            key={reporte.id}
            id={reporte.id}
            nombre={reporte.nombre}
            descripcion={reporte.descripcion}
            icon={reporte.icon}
            color={reporte.color}
            registros={reporte.datos?.length || 0}
            isLoading={estado.cargando && reporteActivo === reporte.id}
            hasData={(reporte.datos?.length || 0) > 0}
            onGenerar={() => handleGenerarReporte(reporte.id)}
            onExportar={() => handleExportarReporte(reporte.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(PlanificacionTab);
