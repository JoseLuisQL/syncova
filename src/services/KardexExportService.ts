import { KardexFilters } from './KardexService';

/**
 * Configuración para exportación del kardex
 */
export interface KardexExportConfig {
  incluirDetalleCompleto: boolean;
  incluirTrazabilidad: boolean;
  incluirEstadisticas: boolean;
  formatoExportacion: 'excel' | 'pdf' | 'csv';
  filtros?: KardexFilters;
}

/**
 * Estadísticas de exportación
 */
export interface KardexExportStats {
  totalMovimientos: number;
  totalIngresos: number;
  totalSalidas: number;
  totalTransferencias: number;
  totalAjustes: number;
  itemsUnicos: number;
  lotesUnicos: number;
  establecimientosUnicos: number;
}

/**
 * Servicio para exportación del Kardex desde el frontend
 */
export class KardexExportService {
  private static readonly API_BASE = '/api/kardex';

  /**
   * Exportar kardex a Excel
   */
  static async exportToExcel(config: KardexExportConfig): Promise<void> {
    try {
      console.log('🔄 Iniciando exportación de Kardex a Excel');
      console.log('📋 Configuración:', JSON.stringify(config, null, 2));

      // Validar que se hayan proporcionado fechas
      if (!config.filtros?.fechaInicio || !config.filtros?.fechaFin) {
        throw new Error('Las fechas de inicio y fin son requeridas para la exportación');
      }

      const response = await fetch(`${this.API_BASE}/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'kardex_export.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Exportación de Kardex completada exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar Kardex:', error);
      throw error;
    }
  }

  /**
   * Exportar kardex a PDF
   */
  static async exportToPDF(config: KardexExportConfig): Promise<void> {
    try {
      console.log('🔄 Iniciando exportación de Kardex a PDF');

      const response = await fetch(`${this.API_BASE}/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'kardex_export.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Exportación de Kardex a PDF completada exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar Kardex a PDF:', error);
      throw error;
    }
  }

  /**
   * Exportar kardex a CSV
   */
  static async exportToCSV(config: KardexExportConfig): Promise<void> {
    try {
      console.log('🔄 Iniciando exportación de Kardex a CSV');

      const response = await fetch(`${this.API_BASE}/export/csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      // Obtener el nombre del archivo desde los headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'kardex_export.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Exportación de Kardex a CSV completada exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar Kardex a CSV:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de exportación
   */
  static async getExportStats(filtros?: KardexFilters): Promise<KardexExportStats> {
    try {
      const params = new URLSearchParams();
      
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'fechaInicio' || key === 'fechaFin') {
              params.append(key, (value as Date).toISOString());
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.API_BASE}/export/stats?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de exportación:', error);
      throw error;
    }
  }

  /**
   * Validar si la exportación está habilitada
   */
  static isExportEnabled(filtros?: KardexFilters): boolean {
    return !!(filtros?.fechaInicio && filtros?.fechaFin);
  }

  /**
   * Obtener mensaje de validación para exportación
   */
  static getValidationMessage(filtros?: KardexFilters): string {
    if (!filtros?.fechaInicio || !filtros?.fechaFin) {
      return 'Debe seleccionar las fechas de inicio y fin para habilitar la exportación';
    }
    return '';
  }
}
