import { useState, useCallback, useRef } from 'react';
import { ReportesService } from '../services/reportesService';
import {
  ItemStockActual,
  ItemStockCritico,
  ItemVencimiento,
  ItemKardexDetallado,
  EstadisticasReportes,
  FiltrosReporteBase,
  FiltrosStockCritico,
  FiltrosVencimientos,
  FiltrosKardexDetallado,
  ConfiguracionExportacion,
  TipoReporte,
  EstadoReportes,
  EstadoFiltros,
  UseReportesReturn
} from '../types/reportes';

/**
 * Hook personalizado para gestión de reportes de inventario
 * Proporciona estado y funciones para generar, exportar y gestionar reportes
 */
export const useReportes = (): UseReportesReturn => {
  // Estados principales
  const [reportes, setReportes] = useState({
    stockActual: [] as ItemStockActual[],
    stockCritico: [] as ItemStockCritico[],
    vencimientos: [] as ItemVencimiento[],
    kardexDetallado: [] as ItemKardexDetallado[]
  });

  const [estadisticas, setEstadisticas] = useState<EstadisticasReportes | null>(null);

  const [estado, setEstado] = useState<EstadoReportes>({
    cargando: false,
    error: null,
    ultimaActualizacion: null,
    reporteActivo: null
  });

  const [filtros, setFiltros] = useState<EstadoFiltros>({
    stockActual: {},
    stockCritico: {},
    vencimientos: {},
    kardexDetallado: null
  });

  // Referencias para cancelar requests
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Función auxiliar para manejar estados de carga
   */
  const ejecutarConCarga = useCallback(async <T>(
    operacion: () => Promise<T>,
    tipoReporte?: TipoReporte
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
        ultimaActualizacion: new Date()
      }));

      return resultado;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: mensaje
      }));

      console.error('Error en operación de reportes:', error);
      return null;
    }
  }, []);

  /**
   * Generar reporte de stock actual
   */
  const generarStockActual = useCallback(async (filtrosReporte: FiltrosReporteBase = {}) => {
    const resultado = await ejecutarConCarga(
      () => ReportesService.generarStockActual(filtrosReporte),
      'stock-actual'
    );

    if (resultado) {
      setReportes(prev => ({
        ...prev,
        stockActual: resultado
      }));

      setFiltros(prev => ({
        ...prev,
        stockActual: filtrosReporte
      }));
    }
  }, [ejecutarConCarga]);

  /**
   * Generar reporte de stock crítico
   */
  const generarStockCritico = useCallback(async (filtrosReporte: FiltrosStockCritico = {}) => {
    const resultado = await ejecutarConCarga(
      () => ReportesService.generarStockCritico(filtrosReporte),
      'stock-critico'
    );

    if (resultado) {
      setReportes(prev => ({
        ...prev,
        stockCritico: resultado
      }));

      setFiltros(prev => ({
        ...prev,
        stockCritico: filtrosReporte
      }));
    }
  }, [ejecutarConCarga]);

  /**
   * Generar reporte de próximos vencimientos
   */
  const generarVencimientos = useCallback(async (filtrosReporte: FiltrosVencimientos = {}) => {
    const resultado = await ejecutarConCarga(
      () => ReportesService.generarProximosVencimientos(filtrosReporte),
      'vencimientos'
    );

    if (resultado) {
      setReportes(prev => ({
        ...prev,
        vencimientos: resultado
      }));

      setFiltros(prev => ({
        ...prev,
        vencimientos: filtrosReporte
      }));
    }
  }, [ejecutarConCarga]);

  /**
   * Generar reporte de kardex detallado
   */
  const generarKardexDetallado = useCallback(async (filtrosReporte: FiltrosKardexDetallado) => {
    const resultado = await ejecutarConCarga(
      () => ReportesService.generarKardexDetallado(filtrosReporte),
      'kardex-detallado'
    );

    if (resultado) {
      setReportes(prev => ({
        ...prev,
        kardexDetallado: resultado
      }));

      setFiltros(prev => ({
        ...prev,
        kardexDetallado: filtrosReporte
      }));
    }
  }, [ejecutarConCarga]);

  /**
   * Obtener estadísticas generales
   */
  const obtenerEstadisticas = useCallback(async () => {
    const resultado = await ejecutarConCarga(
      () => ReportesService.obtenerEstadisticas()
    );

    if (resultado) {
      setEstadisticas(resultado);
    }
  }, [ejecutarConCarga]);

  /**
   * Exportar reporte a Excel
   */
  const exportarExcel = useCallback(async (
    tipo: TipoReporte,
    config: ConfiguracionExportacion
  ) => {
    await ejecutarConCarga(async () => {
      switch (tipo) {
        case 'stock-actual':
        case 'stock_actual':
          await ReportesService.exportarStockActualExcel(filtros.stockActual, config);
          break;
        case 'stock-critico':
        case 'stock_critico':
          await ReportesService.exportarStockCriticoExcel(filtros.stockCritico, config);
          break;
        case 'vencimientos':
        case 'proximos_vencimientos':
          await ReportesService.exportarProximosVencimientosExcel(filtros.vencimientos, config);
          break;
        case 'kardex-detallado':
        case 'kardex_detallado':
          if (!filtros.kardexDetallado) {
            throw new Error('Filtros de kardex detallado no configurados');
          }
          await ReportesService.exportarKardexDetalladoExcel(filtros.kardexDetallado, config);
        default:
          throw new Error(`Tipo de reporte no soportado: ${tipo}`);
      }
    });
  }, [ejecutarConCarga]);

  /**
   * Exportar kardex detallado a Excel
   */
  const exportarKardexDetallado = useCallback(async (
    filtrosKardex: FiltrosKardexDetallado,
    config: ConfiguracionExportacion
  ) => {
    await ejecutarConCarga(async () => {
      await ReportesService.exportarKardexDetalladoExcel(filtrosKardex, config);
    });
  }, [filtros]);

  /**
   * Limpiar todos los reportes
   */
  const limpiarReportes = useCallback(() => {
    setReportes({
      stockActual: [],
      stockCritico: [],
      vencimientos: [],
      kardexDetallado: []
    });

    setEstadisticas(null);

    setEstado({
      cargando: false,
      error: null,
      ultimaActualizacion: null,
      reporteActivo: null
    });

    setFiltros({
      stockActual: {},
      stockCritico: {},
      vencimientos: {},
      kardexDetallado: null
    });

    // Cancelar cualquier request en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Actualizar filtros para un tipo de reporte específico
   */
  const actualizarFiltros = useCallback((tipo: TipoReporte, nuevosFiltros: any) => {
    setFiltros(prev => ({
      ...prev,
      [tipo === 'stock-actual' ? 'stockActual' : 
       tipo === 'stock-critico' ? 'stockCritico' :
       tipo === 'vencimientos' ? 'vencimientos' : 'kardexDetallado']: nuevosFiltros
    }));
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
   * Obtener datos del reporte activo
   */
  const obtenerDatosReporteActivo = useCallback(() => {
    if (!estado.reporteActivo) return [];

    switch (estado.reporteActivo) {
      case 'stock-actual':
        return reportes.stockActual;
      case 'stock-critico':
        return reportes.stockCritico;
      case 'vencimientos':
        return reportes.vencimientos;
      case 'kardex-detallado':
        return reportes.kardexDetallado;
      default:
        return [];
    }
  }, [estado.reporteActivo, reportes]);

  /**
   * Verificar si hay datos disponibles para un tipo de reporte
   */
  const tieneDatos = useCallback((tipo: TipoReporte): boolean => {
    switch (tipo) {
      case 'stock-actual':
        return reportes.stockActual.length > 0;
      case 'stock-critico':
        return reportes.stockCritico.length > 0;
      case 'vencimientos':
        return reportes.vencimientos.length > 0;
      case 'kardex-detallado':
        return reportes.kardexDetallado.length > 0;
      default:
        return false;
    }
  }, [reportes]);

  return {
    // Estados
    reportes,
    estadisticas,
    estado,
    filtros,

    // Acciones principales
    generarStockActual,
    generarStockCritico,
    generarVencimientos,
    generarKardexDetallado,
    obtenerEstadisticas,
    exportarExcel,
    exportarKardexDetallado,
    limpiarReportes,
    actualizarFiltros,

    // Utilidades adicionales
    limpiarError,
    obtenerDatosReporteActivo,
    tieneDatos
  };
};
