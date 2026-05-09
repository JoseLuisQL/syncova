import { apiClient, ApiResponse } from '../config/api';
import { ConfiguracionExportacion } from '../types/reportes';

/**
 * Interfaces para filtros de reportes
 */
export interface ReporteInventarioFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  incluirInactivos?: boolean;
}

export interface StockCriticoFilters extends ReporteInventarioFilters {
  porcentajeMinimo?: number;
  cantidadMinima?: number;
}

export interface VencimientosFilters extends ReporteInventarioFilters {
  diasAnticipacion?: number;
}

export interface KardexDetalladoFilters {
  tipo?: 'vacuna' | 'jeringa';
  itemId?: string;
  loteId?: string;
  establecimientoId?: string;
  tipoMovimiento?: 'ingreso' | 'salida' | 'transferencia' | 'ajuste';
  fechaInicio: string;
  fechaFin: string;
  incluirTrazabilidad?: boolean;
}

/**
 * Interfaces para filtros de reportes de movimientos
 */
export interface MovimientosMensualesFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  establecimientoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  mes?: number;
  anio?: number;
  incluirInactivos?: boolean;
  agruparPor?: 'mes' | 'vacuna' | 'establecimiento';
}

export interface ConsumoHistoricoFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  establecimientoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  periodoMeses?: number;
  incluirInactivos?: boolean;
  incluirProyecciones?: boolean;
}

export interface EntregasPorEstablecimientoFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  establecimientoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  incluirInactivos?: boolean;
  incluirDetalleVacunas?: boolean;
  ordenarPor?: 'establecimiento' | 'cantidad' | 'fecha';
}

export interface EficienciaDistribucionFilters {
  centroAcopioId?: string;
  vacunaId?: string;
  establecimientoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  incluirInactivos?: boolean;
  incluirIndicadores?: boolean;
  calcularTendencias?: boolean;
}

export interface MovimientosPorEESSFilters {
  fechaInicio: string;
  fechaFin: string;
  centroAcopioId?: string;
  /**
   * Si es true, la columna "Salidas" mostrará el acumulado desde enero
   * del año del fechaFin hasta el mes seleccionado (Year-To-Date).
   * Las columnas Entrega y Stock mantienen el valor del último mes del rango.
   */
  acumularSalidasDesdeInicioAnio?: boolean;
}

export interface StockVacunasEESSFilters {
  fechaInicio: string;
  fechaFin: string;
  centroAcopioId?: string;
  vacunaIds: string[];
}

/**
 * Interfaces para resultados de reportes
 */
export interface StockActualItem {
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  presentacion: string;
  stockTotal: number;
  totalLotes: number;
  lotesDisponibles: number;
  lotesPorVencer: number;
  valorInventario?: number;
  ultimaActualizacion: Date;
  lotes: {
    id: string;
    numero: string;
    cantidadActual: number;
    fechaVencimiento: Date;
    estado: string;
    diasParaVencer: number;
  }[];
}

export interface StockCriticoItem extends StockActualItem {
  stockMinimo: number;
  porcentajeCritico: number;
  nivelCriticidad: 'bajo' | 'critico' | 'agotado';
  recomendacionAccion: string;
}

export interface VencimientoItem {
  loteId: string;
  numeroLote: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  diasParaVencer: number;
  nivelUrgencia: 'inmediato' | 'urgente' | 'atencion' | 'normal';
  establecimientosAfectados: {
    id: string;
    nombre: string;
    cantidadAsignada: number;
  }[];
}

export interface LoteVencidoItem {
  loteId: string;
  numeroLote: string;
  vacunaId: string;
  vacunaNombre: string;
  vacunaTipo: string;
  cantidadActual: number;
  fechaVencimiento: Date;
  diasVencido: number;
  nivelCriticidad: 'critico' | 'muy_critico' | 'extremo';
  valorPerdido: number;
  establecimientosAfectados: {
    id: string;
    nombre: string;
    cantidadAsignada: number;
  }[];
}

export interface KardexDetalladoItem {
  id: string;
  fecha: Date;
  tipo: 'vacuna' | 'jeringa';
  itemNombre: string;
  loteNumero: string;
  tipoMovimiento: string;
  cantidad: number;
  saldoAnterior: number;
  saldoActual: number;
  establecimientoOrigen?: string;
  establecimientoDestino?: string;
  documento: string;
  numeroDocumento: string;
  observaciones?: string;
  usuario: string;
}

export interface EstadisticasReportes {
  totalVacunas: number;
  totalStock: number;
  vacunasCriticas: number;
  lotesProximosVencer: number;
  movimientosUltimoMes: number;
  ultimaActualizacion: Date;
}

/**
 * Interfaces para resultados de reportes de movimientos
 */
export interface MovimientoMensualItem {
  establecimientoId: string;
  establecimientoNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  mes: number;
  anio: number;
  saldoAnterior: number;
  transIngreso: number;
  salida: number;
  transSalida: number;
  entrega: number;
  saldoFinal: number;
  consumoTotal: number;
  eficienciaDistribucion: number;
  fechaUltimaActualizacion: Date;
}

export interface ConsumoHistoricoItem {
  vacunaId: string;
  vacunaNombre: string;
  establecimientoId: string;
  establecimientoNombre: string;
  periodoInicio: Date;
  periodoFin: Date;
  consumoPromedio: number;
  consumoTotal: number;
  tendencia: 'creciente' | 'decreciente' | 'estable';
  variabilidad: number;
  proyeccionProximoMes?: number;
  historialMensual: {
    mes: number;
    anio: number;
    consumo: number;
    fecha: Date;
  }[];
}

export interface EntregaPorEstablecimientoItem {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  totalEntregas: number;
  totalVacunas: number;
  fechaUltimaEntrega: Date;
  eficienciaEntrega: number;
  detalleVacunas: {
    vacunaId: string;
    vacunaNombre: string;
    cantidadEntregada: number;
    numeroEntregas: number;
    promedioEntrega: number;
  }[];
}

export interface EficienciaDistribucionItem {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  periodoAnalisis: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  indicadores: {
    tiempoPromedioEntrega: number;
    porcentajeCumplimiento: number;
    eficienciaStock: number;
    rotacionInventario: number;
  };
  tendencias: {
    mejoraMes: boolean;
    variacionPorcentual: number;
  };
  alertas: string[];
}

export interface MovimientosPorEESSItem {
  establecimientoId: string;
  establecimientoNombre: string;
  centroAcopioId: string;
  centroAcopioNombre: string;
  vacunas: {
    [vacunaId: string]: {
      vacunaId: string;
      vacunaNombre: string;
      totalEntrega: number;
      totalSalidas: number;
      stock: number;
    };
  };
}

/**
 * Configuración para exportación de reportes
 */
export interface ReporteExportConfig {
  incluirDetalles: boolean;
  incluirGraficos: boolean;
  incluirEstadisticas: boolean;
  formatoFecha: 'dd/mm/yyyy' | 'yyyy-mm-dd';
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Servicio para gestión de reportes de inventario
 * Maneja la comunicación con el backend para generar y exportar reportes
 */
export class ReportesService {
  private static readonly BASE_URL = '/reportes';

  /**
   * Generar reporte de stock actual
   */
  static async generarStockActual(
    filters: ReporteInventarioFilters = {}
  ): Promise<StockActualItem[]> {
    try {
      console.log('🔄 Generando reporte de stock actual:', filters);

      const response = await apiClient.get<ApiResponse<StockActualItem[]>>(
        `${this.BASE_URL}/stock-actual`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de stock actual');
      }

      console.log('✅ Reporte de stock actual generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de stock actual:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de stock crítico
   */
  static async generarStockCritico(
    filters: StockCriticoFilters = {}
  ): Promise<StockCriticoItem[]> {
    try {
      console.log('🔄 Generando reporte de stock crítico:', filters);

      const response = await apiClient.get<ApiResponse<StockCriticoItem[]>>(
        `${this.BASE_URL}/stock-critico`,
        { params: filters }
      );

      console.log('📡 Respuesta del servidor:', response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de stock crítico');
      }

      console.log('✅ Reporte de stock crítico generado exitosamente');
      console.log('📊 Datos recibidos:', response.data.data.length, 'elementos');
      console.log('🔍 Primer elemento:', response.data.data[0]);

      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de stock crítico:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de próximos vencimientos
   */
  static async generarProximosVencimientos(
    filters: VencimientosFilters = {}
  ): Promise<VencimientoItem[]> {
    try {
      console.log('🔄 Generando reporte de próximos vencimientos:', filters);

      const response = await apiClient.get<ApiResponse<VencimientoItem[]>>(
        `${this.BASE_URL}/proximos-vencimientos`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de próximos vencimientos');
      }

      console.log('✅ Reporte de próximos vencimientos generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de próximos vencimientos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de lotes vencidos
   */
  static async generarLotesVencidos(
    filters: ReporteInventarioFilters = {}
  ): Promise<LoteVencidoItem[]> {
    try {
      console.log('🔄 Generando reporte de lotes vencidos:', filters);

      const response = await apiClient.get<ApiResponse<LoteVencidoItem[]>>(
        `${this.BASE_URL}/lotes-vencidos`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de lotes vencidos');
      }

      console.log('✅ Reporte de lotes vencidos generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de lotes vencidos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de kardex detallado
   */
  static async generarKardexDetallado(
    filters: KardexDetalladoFilters
  ): Promise<KardexDetalladoItem[]> {
    try {
      console.log('🔄 Generando reporte de kardex detallado:', filters);

      const response = await apiClient.post<ApiResponse<KardexDetalladoItem[]>>(
        `${this.BASE_URL}/kardex-detallado`,
        filters
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de kardex detallado');
      }

      console.log('✅ Reporte de kardex detallado generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de kardex detallado:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas generales de reportes
   */
  static async obtenerEstadisticas(): Promise<EstadisticasReportes> {
    try {
      console.log('🔄 Obteniendo estadísticas de reportes');

      const response = await apiClient.get<ApiResponse<EstadisticasReportes>>(
        `${this.BASE_URL}/estadisticas`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }

      console.log('✅ Estadísticas obtenidas exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de stock actual a Excel
   */
  static async exportarStockActualExcel(
    filters: ReporteInventarioFilters = {},
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de stock actual a Excel');

      const response = await apiClient.post(
        `${this.BASE_URL}/stock-actual/export/excel`,
        { filters, config },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Stock_Actual_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de stock actual exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de stock actual:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de stock crítico a Excel
   */
  static async exportarStockCriticoExcel(
    filters: StockCriticoFilters = {},
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de stock crítico a Excel');

      const response = await apiClient.post(
        `${this.BASE_URL}/stock-critico/export/excel`,
        { filters, config },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Stock_Critico_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de stock crítico exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de stock crítico:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de próximos vencimientos a Excel
   */
  static async exportarProximosVencimientosExcel(
    filters: VencimientosFilters = {},
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de próximos vencimientos a Excel');

      const response = await apiClient.post(
        `${this.BASE_URL}/proximos-vencimientos/export/excel`,
        { filters, config },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Proximos_Vencimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de próximos vencimientos exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de próximos vencimientos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de lotes vencidos a Excel
   */
  static async exportarLotesVencidosExcel(
    filters: ReporteInventarioFilters = {},
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de lotes vencidos a Excel');

      const response = await apiClient.post(
        `${this.BASE_URL}/lotes-vencidos/export/excel`,
        { filters, config },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Lotes_Vencidos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de lotes vencidos exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de lotes vencidos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de kardex detallado a Excel
   */
  static async exportarKardexDetalladoExcel(
    filters: KardexDetalladoFilters,
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de kardex detallado a Excel:', filters);

      const response = await apiClient.post(
        `${this.BASE_URL}/kardex-detallado/export/excel`,
        { filters, config },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generar nombre de archivo descriptivo
      const fechaInicio = filters.fechaInicio ? new Date(filters.fechaInicio).toLocaleDateString('es-PE').replace(/\//g, '-') : '';
      const fechaFin = filters.fechaFin ? new Date(filters.fechaFin).toLocaleDateString('es-PE').replace(/\//g, '-') : '';
      const rangoFechas = fechaInicio && fechaFin ? `_${fechaInicio}_al_${fechaFin}` : `_${new Date().toISOString().split('T')[0]}`;
      const tipoFiltro = filters.tipo ? `_${filters.tipo}` : '';

      link.download = `Kardex_Detallado${tipoFiltro}${rangoFechas}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de kardex detallado exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de kardex detallado:', error);
      throw this.handleError(error);
    }
  }

  // =====================================================
  // MÉTODOS PARA REPORTES DE MOVIMIENTOS
  // =====================================================

  /**
   * Generar reporte de movimientos mensuales
   */
  static async generarMovimientosMensuales(
    filters: MovimientosMensualesFilters = {}
  ): Promise<MovimientoMensualItem[]> {
    try {
      console.log('🔄 Generando reporte de movimientos mensuales:', filters);

      const response = await apiClient.get<ApiResponse<MovimientoMensualItem[]>>(
        `${this.BASE_URL}/movimientos-mensuales`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de movimientos mensuales');
      }

      console.log('✅ Reporte de movimientos mensuales generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de movimientos mensuales:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de consumo histórico
   */
  static async generarConsumoHistorico(
    filters: ConsumoHistoricoFilters = {}
  ): Promise<ConsumoHistoricoItem[]> {
    try {
      console.log('🔄 Generando reporte de consumo histórico:', filters);

      const response = await apiClient.get<ApiResponse<ConsumoHistoricoItem[]>>(
        `${this.BASE_URL}/consumo-historico`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de consumo histórico');
      }

      console.log('✅ Reporte de consumo histórico generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de consumo histórico:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de entregas por establecimiento
   */
  static async generarEntregasPorEstablecimiento(
    filters: EntregasPorEstablecimientoFilters = {}
  ): Promise<EntregaPorEstablecimientoItem[]> {
    try {
      console.log('🔄 Generando reporte de entregas por establecimiento:', filters);

      const response = await apiClient.get<ApiResponse<EntregaPorEstablecimientoItem[]>>(
        `${this.BASE_URL}/entregas-por-establecimiento`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de entregas por establecimiento');
      }

      console.log('✅ Reporte de entregas por establecimiento generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de entregas por establecimiento:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de eficiencia de distribución
   */
  static async generarEficienciaDistribucion(
    filters: EficienciaDistribucionFilters = {}
  ): Promise<EficienciaDistribucionItem[]> {
    try {
      console.log('🔄 Generando reporte de eficiencia de distribución:', filters);

      const response = await apiClient.get<ApiResponse<EficienciaDistribucionItem[]>>(
        `${this.BASE_URL}/eficiencia-distribucion`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de eficiencia de distribución');
      }

      console.log('✅ Reporte de eficiencia de distribución generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de eficiencia de distribución:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de movimientos mensuales a Excel
   */
  static async exportarMovimientosMensuales(
    filtros: MovimientosMensualesFilters = {},
    config: ConfiguracionExportacion
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de movimientos mensuales a Excel:', filtros);

      const response = await apiClient.post(
        `${this.BASE_URL}/movimientos-mensuales/exportar`,
        { filtros, config },
        { responseType: 'blob' }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `movimientos_mensuales_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de movimientos mensuales exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de movimientos mensuales:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de consumo histórico a Excel
   */
  static async exportarConsumoHistorico(
    filtros: ConsumoHistoricoFilters = {},
    config: ConfiguracionExportacion
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de consumo histórico a Excel:', filtros);

      const response = await apiClient.post(
        `${this.BASE_URL}/consumo-historico/exportar`,
        { filtros, config },
        { responseType: 'blob' }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consumo_historico_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de consumo histórico exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de consumo histórico:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de entregas por establecimiento a Excel
   */
  static async exportarEntregasPorEstablecimiento(
    filtros: EntregasPorEstablecimientoFilters = {},
    config: ConfiguracionExportacion
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de entregas por establecimiento a Excel:', filtros);

      const response = await apiClient.post(
        `${this.BASE_URL}/entregas-por-establecimiento/exportar`,
        { filtros, config },
        { responseType: 'blob' }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `entregas_por_establecimiento_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de entregas por establecimiento exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de entregas por establecimiento:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de eficiencia de distribución a Excel
   */
  static async exportarEficienciaDistribucion(
    filtros: EficienciaDistribucionFilters = {},
    config: ConfiguracionExportacion
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de eficiencia de distribución a Excel:', filtros);

      const response = await apiClient.post(
        `${this.BASE_URL}/eficiencia-distribucion/exportar`,
        { filtros, config },
        { responseType: 'blob' }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eficiencia_distribucion_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de eficiencia de distribución exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de eficiencia de distribución:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar reporte de movimientos por EESS
   */
  static async generarMovimientosPorEESS(
    filters: MovimientosPorEESSFilters
  ): Promise<MovimientosPorEESSItem[]> {
    try {
      console.log('🔄 Generando reporte de movimientos por EESS:', filters);

      const response = await apiClient.post<ApiResponse<MovimientosPorEESSItem[]>>(
        `${this.BASE_URL}/movimientos-por-eess`,
        filters
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al generar reporte de movimientos por EESS');
      }

      console.log('✅ Reporte de movimientos por EESS generado exitosamente');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al generar reporte de movimientos por EESS:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de movimientos por EESS a Excel
   */
  static async exportarMovimientosPorEESS(
    filtros: MovimientosPorEESSFilters,
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de movimientos por EESS a Excel:', filtros);

      const response = await apiClient.post(
        `${this.BASE_URL}/movimientos-por-eess/exportar`,
        { filtros, config },
        { responseType: 'blob' }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `movimientos_por_eess_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de movimientos por EESS exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de movimientos por EESS:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar reporte de stock de vacunas por EESS a Excel
   */
  static async exportarStockVacunasEESS(
    filtros: StockVacunasEESSFilters,
    config: ReporteExportConfig
  ): Promise<void> {
    try {
      console.log('🔄 Exportando reporte de stock de vacunas por EESS a Excel:', filtros);

      const response = await apiClient.post(
        `${this.BASE_URL}/stock-vacunas-eess/exportar`,
        { filtros, config },
        { responseType: 'blob' }
      );

      // Crear y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock_vacunas_eess_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Reporte de stock de vacunas por EESS exportado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte de stock de vacunas por EESS:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo de errores
   */
  private static handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        return new Error(axiosError.response.data.message);
      }
    }

    return new Error('Error desconocido en el servicio de reportes');
  }

  /**
   * Obtener configuración por defecto para exportación
   */
  static getConfiguracionPorDefecto(responsable: string): ReporteExportConfig {
    return {
      incluirDetalles: true,
      incluirGraficos: false,
      incluirEstadisticas: true,
      formatoFecha: 'dd/mm/yyyy',
      responsableReporte: responsable,
      observaciones: undefined
    };
  }
}
