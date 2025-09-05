import { apiClient } from '../config/api';
import { ApiResponse } from '../types/api';

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

  /**
   * Manejo de errores
   */
  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
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
