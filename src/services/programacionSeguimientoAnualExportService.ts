import { apiClient } from '../config/api';
/**
 * Configuración para exportación de Programación y Seguimiento Anual
 */
export interface ProgramacionSeguimientoAnualExportConfig {
  anio: number;
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Respuesta del servicio de exportación
 */
export interface ProgramacionSeguimientoAnualExportResponse {
  filename: string;
  contentType: string;
  size: number;
  downloadUrl?: string;
}

/**
 * Servicio para exportación de Programación y Seguimiento Anual
 * Sigue los mismos patrones profesionales que PlanificacionExportService
 */
export class ProgramacionSeguimientoAnualExportService {
  
  /**
   * Exportar y descargar reporte de Programación y Seguimiento Anual
   */
  static async exportarYDescargar(
    config: ProgramacionSeguimientoAnualExportConfig,
    nombreArchivo?: string
  ): Promise<void> {
    try {
      console.log('🔄 Iniciando exportación de Programación y Seguimiento Anual:', config);

      // Realizar petición al backend
      const response = await apiClient.post('/programacion-anual-cenares/exportar', config, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Verificar que la respuesta sea exitosa
      if (response.status !== 200) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // Obtener el blob de la respuesta
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('El archivo exportado está vacío');
      }

      // Obtener el nombre del archivo desde los headers o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = nombreArchivo || `Programacion_Seguimiento_Anual_CENARES_${config.anio}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga temporal
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL temporal
      window.URL.revokeObjectURL(url);

      console.log('✅ Exportación de Programación y Seguimiento Anual completada exitosamente');

    } catch (error: any) {
      console.error('❌ Error al exportar Programación y Seguimiento Anual:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Error de respuesta del servidor
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText || 'Error del servidor';
        
        if (status === 400) {
          throw new Error(`Datos inválidos: ${message}`);
        } else if (status === 404) {
          throw new Error('No se encontraron datos para exportar');
        } else if (status === 500) {
          throw new Error(`Error interno del servidor: ${message}`);
        } else {
          throw new Error(`Error del servidor (${status}): ${message}`);
        }
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
      } else {
        // Error de configuración u otro
        throw new Error(error.message || 'Error inesperado al exportar el reporte');
      }
    }
  }

  /**
   * Crear configuración desde filtros de la interfaz
   */
  static crearConfiguracionDesdeFiltros(
    anio: number,
    responsableReporte: string,
    observaciones?: string
  ): ProgramacionSeguimientoAnualExportConfig {
    return {
      anio,
      responsableReporte: responsableReporte.trim(),
      observaciones: observaciones?.trim()
    };
  }

  /**
   * Validar configuración de exportación
   */
  static validarConfiguracion(config: ProgramacionSeguimientoAnualExportConfig): string[] {
    const errores: string[] = [];

    // Validar año
    if (!config.anio || isNaN(config.anio)) {
      errores.push('El año es requerido y debe ser un número válido');
    } else if (config.anio < 2020 || config.anio > 2050) {
      errores.push('El año debe estar entre 2020 y 2050');
    }

    // Validar responsable
    if (!config.responsableReporte || typeof config.responsableReporte !== 'string') {
      errores.push('El responsable del reporte es requerido');
    } else if (config.responsableReporte.trim().length === 0) {
      errores.push('El responsable del reporte no puede estar vacío');
    } else if (config.responsableReporte.trim().length > 100) {
      errores.push('El nombre del responsable no puede exceder 100 caracteres');
    }

    // Validar observaciones (opcional)
    if (config.observaciones && typeof config.observaciones !== 'string') {
      errores.push('Las observaciones deben ser texto');
    } else if (config.observaciones && config.observaciones.trim().length > 500) {
      errores.push('Las observaciones no pueden exceder 500 caracteres');
    }

    return errores;
  }

  /**
   * Obtener información del reporte
   */
  static obtenerInformacionReporte(config: ProgramacionSeguimientoAnualExportConfig): {
    titulo: string;
    descripcion: string;
    filename: string;
  } {
    const fecha = new Date().toISOString().split('T')[0];
    
    return {
      titulo: `Programación y Seguimiento Anual CENARES ${config.anio}`,
      descripcion: `Reporte completo de programación y seguimiento anual CENARES para el año ${config.anio}`,
      filename: `Programacion_Seguimiento_Anual_CENARES_${config.anio}_${fecha}.xlsx`
    };
  }

  /**
   * Verificar disponibilidad del servicio
   */
  static async verificarDisponibilidad(): Promise<boolean> {
    try {
      // Hacer una petición simple para verificar que el servicio esté disponible
      const response = await apiClient.get('/programacion-anual-cenares', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Servicio de exportación no disponible:', error);
      return false;
    }
  }
}

export default ProgramacionSeguimientoAnualExportService;
