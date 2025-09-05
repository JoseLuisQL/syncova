import { apiClient } from '../config/api';
import { ApiResponse } from '../types/api';

/**
 * Configuración para exportación de planificación
 */
export interface PlanificacionExportConfig {
  anio: number;
  vacunaId?: string; // Si no se especifica, exporta todas las vacunas
  centroAcopioId?: string; // Filtro por centro de acopio
  incluirEstablecimientosSinProgramacion: boolean;
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Respuesta del servicio de exportación
 */
export interface PlanificacionExportResponse {
  filename: string;
  contentType: string;
  size: number;
  downloadUrl?: string;
}

/**
 * Servicio para exportación de Planificación
 * Maneja la generación de archivos Excel con configuraciones personalizadas
 */
export class PlanificacionExportService {
  private static readonly BASE_URL = '/planificacion';

  /**
   * Exportar planificación por vacuna específica a Excel
   */
  static async exportarPorVacuna(
    vacunaId: string,
    config: PlanificacionExportConfig
  ): Promise<Blob> {
    try {
      console.log('🔄 Exportando planificación por vacuna a Excel:', { vacunaId, config });

      const response = await apiClient.post(
        `${this.BASE_URL}/exportar/vacuna/${vacunaId}`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Planificación por vacuna exportada a Excel exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al exportar planificación por vacuna a Excel:', error);
      throw this.handleExportError(error);
    }
  }

  /**
   * Exportar todas las vacunas a Excel (hojas separadas)
   */
  static async exportarTodasVacunas(
    config: PlanificacionExportConfig
  ): Promise<Blob> {
    try {
      console.log('🔄 Exportando todas las vacunas a Excel:', config);

      const response = await apiClient.post(
        `${this.BASE_URL}/exportar/todas-vacunas`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Todas las vacunas exportadas a Excel exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al exportar todas las vacunas a Excel:', error);
      throw this.handleExportError(error);
    }
  }

  /**
   * Exportar y descargar planificación por vacuna
   */
  static async exportarYDescargarPorVacuna(
    vacunaId: string,
    config: PlanificacionExportConfig,
    nombreVacuna?: string
  ): Promise<void> {
    // Validar configuración
    const errores = this.validarConfiguracion(config);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    try {
      // Exportar
      const blob = await this.exportarPorVacuna(vacunaId, config);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivoPorVacuna(nombreVacuna || 'Vacuna', config);

      // Descargar archivo
      this.descargarArchivo(blob, filename);

    } catch (error) {
      console.error('❌ Error en exportación completa por vacuna:', error);
      throw error;
    }
  }

  /**
   * Exportar y descargar todas las vacunas
   */
  static async exportarYDescargarTodasVacunas(
    config: PlanificacionExportConfig
  ): Promise<void> {
    // Validar configuración
    const errores = this.validarConfiguracion(config);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    try {
      // Exportar
      const blob = await this.exportarTodasVacunas(config);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivoCompleto(config);

      // Descargar archivo
      this.descargarArchivo(blob, filename);

    } catch (error) {
      console.error('❌ Error en exportación completa de todas las vacunas:', error);
      throw error;
    }
  }

  /**
   * Validar configuración de exportación
   */
  private static validarConfiguracion(config: PlanificacionExportConfig): string[] {
    const errores: string[] = [];

    if (!config.anio || config.anio < 2020 || config.anio > 2050) {
      errores.push('El año debe estar entre 2020 y 2050');
    }

    if (!config.responsableReporte || config.responsableReporte.trim() === '') {
      errores.push('El responsable del reporte es requerido');
    }

    return errores;
  }

  /**
   * Descargar archivo blob
   */
  private static descargarArchivo(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Agregar al DOM temporalmente para hacer clic
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Archivo descargado: ${filename}`);
    } catch (error) {
      console.error('❌ Error al descargar archivo:', error);
      throw new Error('Error al descargar el archivo');
    }
  }

  /**
   * Generar nombre de archivo para vacuna específica
   */
  private static generarNombreArchivoPorVacuna(nombreVacuna: string, config: PlanificacionExportConfig): string {
    const fecha = new Date().toISOString().split('T')[0];
    const nombreLimpio = nombreVacuna.replace(/[^a-zA-Z0-9]/g, '_');
    return `Programacion_${nombreLimpio}_${config.anio}_${fecha}.xlsx`;
  }

  /**
   * Generar nombre de archivo para exportación completa
   */
  private static generarNombreArchivoCompleto(config: PlanificacionExportConfig): string {
    const fecha = new Date().toISOString().split('T')[0];
    return `Programacion_Completa_${config.anio}_${fecha}.xlsx`;
  }

  /**
   * Manejar errores de exportación
   */
  private static handleExportError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      if (status === 400) {
        return new Error(`Error de validación: ${message}`);
      } else if (status === 404) {
        return new Error('Recurso no encontrado');
      } else if (status === 500) {
        return new Error('Error interno del servidor');
      } else {
        return new Error(`Error del servidor (${status}): ${message}`);
      }
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifique su conexión a internet.');
    } else {
      // Error de configuración
      return new Error(error.message || 'Error desconocido en la exportación');
    }
  }

  /**
   * Obtener configuración por defecto
   */
  static getConfiguracionPorDefecto(): PlanificacionExportConfig {
    const currentYear = new Date().getFullYear();
    
    return {
      anio: currentYear,
      incluirEstablecimientosSinProgramacion: true,
      responsableReporte: 'Usuario del Sistema'
    };
  }

  /**
   * Crear configuración desde filtros de la interfaz
   */
  static crearConfiguracionDesdeFiltros(
    anio: number,
    vacunaId?: string,
    centroAcopioId?: string,
    responsableReporte?: string,
    observaciones?: string
  ): PlanificacionExportConfig {
    return {
      anio,
      vacunaId,
      centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
      incluirEstablecimientosSinProgramacion: true,
      responsableReporte: responsableReporte || 'Usuario del Sistema',
      observaciones
    };
  }
}
