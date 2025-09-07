import { useState, useCallback, useRef } from 'react';
import {
  PlanificacionReportesService,
  PlanificacionReportesFilters,
  PlanificacionReportesExportConfig,
  ProgramacionAnualData,
  CumplimientoMetasData,
  ProyeccionDemandaData,
  DistribucionGeograficaData
} from '../services/planificacionReportesService';

/**
 * Estados de los reportes de planificación
 */
export interface EstadoPlanificacionReportes {
  cargando: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
  reporteActivo: string | null;
}

/**
 * Datos de los reportes de planificación
 */
export interface ReportesPlanificacionData {
  programacionAnual: ProgramacionAnualData[];
  cumplimientoMetas: CumplimientoMetasData[];
  proyeccionDemanda: ProyeccionDemandaData[];
  distribucionGeografica: DistribucionGeograficaData[];
}

/**
 * Tipo de reporte de planificación
 */
export type TipoReportePlanificacion = 
  | 'programacion_anual' 
  | 'cumplimiento_metas' 
  | 'proyeccion_demanda' 
  | 'distribucion_geografica';

/**
 * Hook personalizado para gestión de reportes de planificación
 * Proporciona estado y funciones para generar, exportar y gestionar reportes
 */
export const usePlanificacionReportes = () => {
  // Estados principales
  const [reportes, setReportes] = useState<ReportesPlanificacionData>({
    programacionAnual: [],
    cumplimientoMetas: [],
    proyeccionDemanda: [],
    distribucionGeografica: []
  });

  const [estado, setEstado] = useState<EstadoPlanificacionReportes>({
    cargando: false,
    error: null,
    ultimaActualizacion: null,
    reporteActivo: null
  });

  const [filtros, setFiltros] = useState<PlanificacionReportesFilters>({
    anio: new Date().getFullYear(),
    vacunaId: undefined,
    centroAcopioId: undefined,
    establecimientoId: undefined,
    incluirInactivos: false
  });

  // Referencias para cancelar requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función auxiliar para manejar estados de carga
   */
  const ejecutarConCarga = useCallback(async <T>(
    operacion: () => Promise<T>,
    tipoReporte?: TipoReportePlanificacion
  ): Promise<T | null> => {
    try {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      setEstado(prev => ({
        ...prev,
        cargando: true,
        error: null,
        reporteActivo: tipoReporte || prev.reporteActivo
      }));

      const resultado = await operacion();

      setEstado(prev => ({
        ...prev,
        cargando: false,
        ultimaActualizacion: new Date(),
        reporteActivo: null
      }));

      return resultado;
    } catch (error: any) {
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: error.message || 'Error desconocido',
        reporteActivo: null
      }));
      return null;
    }
  }, []);

  /**
   * Generar reporte de programación anual
   */
  const generarProgramacionAnual = useCallback(async (
    filtrosCustom?: PlanificacionReportesFilters
  ) => {
    const filtrosFinales = { ...filtros, ...filtrosCustom };
    
    const resultado = await ejecutarConCarga(async () => {
      const datos = await PlanificacionReportesService.generarProgramacionAnual(filtrosFinales);
      setReportes(prev => ({ ...prev, programacionAnual: datos }));
      return datos;
    }, 'programacion_anual');

    return resultado;
  }, [filtros, ejecutarConCarga]);

  /**
   * Generar reporte de cumplimiento de metas
   */
  const generarCumplimientoMetas = useCallback(async (
    filtrosCustom?: PlanificacionReportesFilters
  ) => {
    const filtrosFinales = { ...filtros, ...filtrosCustom };
    
    const resultado = await ejecutarConCarga(async () => {
      const datos = await PlanificacionReportesService.generarCumplimientoMetas(filtrosFinales);
      setReportes(prev => ({ ...prev, cumplimientoMetas: datos }));
      return datos;
    }, 'cumplimiento_metas');

    return resultado;
  }, [filtros, ejecutarConCarga]);

  /**
   * Generar reporte de proyección de demanda
   */
  const generarProyeccionDemanda = useCallback(async (
    filtrosCustom?: PlanificacionReportesFilters
  ) => {
    const filtrosFinales = { ...filtros, ...filtrosCustom };
    
    const resultado = await ejecutarConCarga(async () => {
      const datos = await PlanificacionReportesService.generarProyeccionDemanda(filtrosFinales);
      setReportes(prev => ({ ...prev, proyeccionDemanda: datos }));
      return datos;
    }, 'proyeccion_demanda');

    return resultado;
  }, [filtros, ejecutarConCarga]);

  /**
   * Generar reporte de distribución geográfica
   */
  const generarDistribucionGeografica = useCallback(async (
    filtrosCustom?: PlanificacionReportesFilters
  ) => {
    const filtrosFinales = { ...filtros, ...filtrosCustom };
    
    const resultado = await ejecutarConCarga(async () => {
      const datos = await PlanificacionReportesService.generarDistribucionGeografica(filtrosFinales);
      setReportes(prev => ({ ...prev, distribucionGeografica: datos }));
      return datos;
    }, 'distribucion_geografica');

    return resultado;
  }, [filtros, ejecutarConCarga]);

  /**
   * Exportar reporte de programación anual a Excel
   */
  const exportarProgramacionAnual = useCallback(async (
    config: PlanificacionReportesExportConfig
  ) => {
    await ejecutarConCarga(async () => {
      await PlanificacionReportesService.exportarProgramacionAnual(config);
    });
  }, [ejecutarConCarga]);

  /**
   * Exportar reporte de cumplimiento de metas a Excel
   */
  const exportarCumplimientoMetas = useCallback(async (
    config: PlanificacionReportesExportConfig
  ) => {
    await ejecutarConCarga(async () => {
      await PlanificacionReportesService.exportarCumplimientoMetas(config);
    });
  }, [ejecutarConCarga]);

  /**
   * Exportar reporte de proyección de demanda a Excel
   */
  const exportarProyeccionDemanda = useCallback(async (
    config: PlanificacionReportesExportConfig
  ) => {
    await ejecutarConCarga(async () => {
      await PlanificacionReportesService.exportarProyeccionDemanda(config);
    });
  }, [ejecutarConCarga]);

  /**
   * Exportar reporte de distribución geográfica a Excel
   */
  const exportarDistribucionGeografica = useCallback(async (
    config: PlanificacionReportesExportConfig
  ) => {
    await ejecutarConCarga(async () => {
      await PlanificacionReportesService.exportarDistribucionGeografica(config);
    });
  }, [ejecutarConCarga]);

  /**
   * Limpiar todos los reportes
   */
  const limpiarReportes = useCallback(() => {
    setReportes({
      programacionAnual: [],
      cumplimientoMetas: [],
      proyeccionDemanda: [],
      distribucionGeografica: []
    });

    setEstado({
      cargando: false,
      error: null,
      ultimaActualizacion: null,
      reporteActivo: null
    });

    // Cancelar cualquier request en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Actualizar filtros
   */
  const actualizarFiltros = useCallback((nuevosFiltros: Partial<PlanificacionReportesFilters>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setEstado(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  /**
   * Verificar si hay datos disponibles para un tipo de reporte
   */
  const tieneDatos = useCallback((tipo: TipoReportePlanificacion): boolean => {
    switch (tipo) {
      case 'programacion_anual':
        return reportes.programacionAnual.length > 0;
      case 'cumplimiento_metas':
        return reportes.cumplimientoMetas.length > 0;
      case 'proyeccion_demanda':
        return reportes.proyeccionDemanda.length > 0;
      case 'distribucion_geografica':
        return reportes.distribucionGeografica.length > 0;
      default:
        return false;
    }
  }, [reportes]);

  return {
    // Estados
    reportes,
    estado,
    filtros,

    // Acciones principales
    generarProgramacionAnual,
    generarCumplimientoMetas,
    generarProyeccionDemanda,
    generarDistribucionGeografica,

    // Exportaciones
    exportarProgramacionAnual,
    exportarCumplimientoMetas,
    exportarProyeccionDemanda,
    exportarDistribucionGeografica,

    // Utilidades
    limpiarReportes,
    actualizarFiltros,
    limpiarError,
    tieneDatos
  };
};
