import {
  apiClient,
  ApiResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Interfaces para filtros de reportes de planificación
 */
export interface PlanificacionReportesFilters {
  anio?: number;
  vacunaId?: string;
  centroAcopioId?: string;
  establecimientoId?: string;
  incluirInactivos?: boolean;
}

/**
 * Configuración para exportación de reportes de planificación
 */
export interface PlanificacionReportesExportConfig {
  anio: number;
  vacunaId?: string;
  centroAcopioId?: string;
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Datos de programación anual
 */
export interface ProgramacionAnualData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  metaAnual: number;
  distribucionMensual: number[];
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  observaciones?: string;
}

/**
 * Datos de cumplimiento de metas
 */
export interface CumplimientoMetasData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  metaAnual: number;
  programadoAcumulado: number;
  entregadoAcumulado: number;
  porcentajeCumplimiento: number;
  diferencia: number;
  tendencia: 'positiva' | 'negativa' | 'estable';
  proyeccionAnual: number;
  alertas: string[];
}

/**
 * Datos de proyección de demanda
 */
export interface ProyeccionDemandaData {
  establecimiento: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
    centroAcopio?: string;
  };
  vacuna: {
    id: string;
    nombre: string;
    tipo: string;
    presentacion: string;
  };
  consumoHistorico: number[];
  promedioMensual: number;
  tendenciaConsumo: number;
  proyeccionProximoAnio: number;
  factorEstacionalidad: number;
  recomendacionStock: number;
  nivelRiesgo: 'bajo' | 'medio' | 'alto';
}

/**
 * Datos de distribución geográfica
 */
export interface DistribucionGeograficaData {
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
    tipo: string;
  };
  totalEstablecimientos: number;
  establecimientosActivos: number;
  vacunas: Array<{
    id: string;
    nombre: string;
    metaTotal: number;
    entregadoTotal: number;
    porcentajeCobertura: number;
  }>;
  indicadores: {
    coberturaPoblacional: number;
    eficienciaDistribucion: number;
    tiempoPromedioEntrega: number;
    satisfaccionUsuarios: number;
  };
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
}

/**
 * Servicio para reportes de planificación
 * Conecta el frontend con el backend API
 */
export class PlanificacionReportesService {
  private static readonly BASE_PATH = '/reportes/planificacion';

  /**
   * Generar reporte de programación anual
   */
  static async generarProgramacionAnual(
    filters: PlanificacionReportesFilters
  ): Promise<ProgramacionAnualData[]> {
    try {
      logger.debug('Generando reporte de programación anual:', filters);

      const queryParams = buildQueryParams(filters);
      const response = await apiClient.get<ApiResponse<ProgramacionAnualData[]>>(
        `${this.BASE_PATH}/programacion-anual${queryParams}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al generar reporte de programación anual');
      }

      logger.debug('Reporte de programación anual generado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al generar reporte de programación anual:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar reporte de cumplimiento de metas
   */
  static async generarCumplimientoMetas(
    filters: PlanificacionReportesFilters
  ): Promise<CumplimientoMetasData[]> {
    try {
      logger.debug('Generando reporte de cumplimiento de metas:', filters);

      const queryParams = buildQueryParams(filters);
      const response = await apiClient.get<ApiResponse<CumplimientoMetasData[]>>(
        `${this.BASE_PATH}/cumplimiento-metas${queryParams}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al generar reporte de cumplimiento de metas');
      }

      logger.debug('Reporte de cumplimiento de metas generado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al generar reporte de cumplimiento de metas:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar reporte de proyección de demanda
   */
  static async generarProyeccionDemanda(
    filters: PlanificacionReportesFilters
  ): Promise<ProyeccionDemandaData[]> {
    try {
      logger.debug('Generando reporte de proyección de demanda:', filters);

      const queryParams = buildQueryParams(filters);
      const response = await apiClient.get<ApiResponse<ProyeccionDemandaData[]>>(
        `${this.BASE_PATH}/proyeccion-demanda${queryParams}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al generar reporte de proyección de demanda');
      }

      logger.debug('Reporte de proyección de demanda generado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al generar reporte de proyección de demanda:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar reporte de distribución geográfica
   */
  static async generarDistribucionGeografica(
    filters: PlanificacionReportesFilters
  ): Promise<DistribucionGeograficaData[]> {
    try {
      logger.debug('Generando reporte de distribución geográfica:', filters);

      const queryParams = buildQueryParams(filters);
      const response = await apiClient.get<ApiResponse<DistribucionGeograficaData[]>>(
        `${this.BASE_PATH}/distribucion-geografica${queryParams}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al generar reporte de distribución geográfica');
      }

      logger.debug('Reporte de distribución geográfica generado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al generar reporte de distribución geográfica:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Exportar reporte de programación anual a Excel
   */
  static async exportarProgramacionAnual(
    config: PlanificacionReportesExportConfig
  ): Promise<void> {
    try {
      logger.debug('Exportando reporte de programación anual:', config);

      const response = await apiClient.post(
        `${this.BASE_PATH}/programacion-anual/exportar`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );

      // Crear URL para descarga
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-planificacion-programacion-anual-${config.anio}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL
      window.URL.revokeObjectURL(url);

      logger.debug('Reporte de programación anual exportado exitosamente');
    } catch (error) {
      logger.error('Error al exportar reporte de programación anual:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Exportar reporte de cumplimiento de metas a Excel
   */
  static async exportarCumplimientoMetas(
    config: PlanificacionReportesExportConfig
  ): Promise<void> {
    try {
      logger.debug('Exportando reporte de cumplimiento de metas:', config);

      const response = await apiClient.post(
        `${this.BASE_PATH}/cumplimiento-metas/exportar`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );

      // Crear URL para descarga
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-planificacion-cumplimiento-metas-${config.anio}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL
      window.URL.revokeObjectURL(url);

      logger.debug('Reporte de cumplimiento de metas exportado exitosamente');
    } catch (error) {
      logger.error('Error al exportar reporte de cumplimiento de metas:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Exportar reporte de proyección de demanda a Excel
   */
  static async exportarProyeccionDemanda(
    config: PlanificacionReportesExportConfig
  ): Promise<void> {
    try {
      logger.debug('Exportando reporte de proyección de demanda:', config);

      const response = await apiClient.post(
        `${this.BASE_PATH}/proyeccion-demanda/exportar`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );

      // Crear URL para descarga
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-planificacion-proyeccion-demanda-${config.anio}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL
      window.URL.revokeObjectURL(url);

      logger.debug('Reporte de proyección de demanda exportado exitosamente');
    } catch (error) {
      logger.error('Error al exportar reporte de proyección de demanda:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Exportar reporte de distribución geográfica a Excel
   */
  static async exportarDistribucionGeografica(
    config: PlanificacionReportesExportConfig
  ): Promise<void> {
    try {
      logger.debug('Exportando reporte de distribución geográfica:', config);

      const response = await apiClient.post(
        `${this.BASE_PATH}/distribucion-geografica/exportar`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );

      // Crear URL para descarga
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-planificacion-distribucion-geografica-${config.anio}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar URL
      window.URL.revokeObjectURL(url);

      logger.debug('Reporte de distribución geográfica exportado exitosamente');
    } catch (error) {
      logger.error('Error al exportar reporte de distribución geográfica:', error);
      throw handleApiError(error as AxiosError);
    }
  }
}
