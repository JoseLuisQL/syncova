import { apiClient } from '../config/api';
import { ApiResponse } from '../types/api';
import { ValeEntrega } from './valesService';

/**
 * Configuración para exportación de vales
 */
export interface ValeExportConfig {
  incluirEntregasBase: boolean;
  incluirEntregasAdicionales: boolean;
  entregasAdicionalesSeleccionadas: number[]; // Array de números de entregas adicionales seleccionadas
  responsableRecojo: string;
  formatoExportacion: 'excel' | 'pdf';
}

/**
 * Respuesta del servicio de exportación
 */
export interface ValeExportResponse {
  filename: string;
  contentType: string;
  size: number;
  downloadUrl?: string;
}

/**
 * Estadísticas de exportación
 */
export interface ValeExportStats {
  totalVacunas: number;
  totalEstablecimientos: number;
  totalEntregas: number;
  entregasBase: number;
  entregasAdicionales: number;
}

/**
 * Servicio para exportación de Vales de Entrega
 * Maneja la generación de archivos Excel y PDF con configuraciones personalizadas
 */
export class ValeExportService {
  private static readonly BASE_URL = '/vales';

  /**
   * Exportar vale a Excel
   */
  static async exportarExcel(
    valeId: string, 
    config: ValeExportConfig
  ): Promise<Blob> {
    try {
      console.log('🔄 Exportando vale a Excel:', { valeId, config });

      const response = await apiClient.post(
        `${this.BASE_URL}/${valeId}/export/excel`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Vale exportado a Excel exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al exportar vale a Excel:', error);
      throw this.handleExportError(error);
    }
  }

  /**
   * Exportar vale a PDF
   */
  static async exportarPDF(
    valeId: string,
    config: ValeExportConfig
  ): Promise<Blob> {
    try {
      console.log('🔄 Exportando vale a PDF:', { valeId, config });

      const response = await apiClient.post(
        `${this.BASE_URL}/${valeId}/export/pdf`,
        config,
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Vale exportado a PDF exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al exportar vale a PDF:', error);
      throw this.handleExportError(error);
    }
  }

  /**
   * Exportar múltiples vales combinados a Excel
   * NUEVA FUNCIÓN para exportación global con agregación correcta
   * OPTIMIZADO: Timeout extendido para procesamiento de múltiples vales
   */
  static async exportarValesCombinados(
    valeIds: string[],
    config: ValeExportConfig
  ): Promise<Blob> {
    try {
      console.log('🔄 Exportando vales combinados a Excel:', {
        cantidadVales: valeIds.length,
        incluirEntregasBase: config.incluirEntregasBase,
        incluirEntregasAdicionales: config.incluirEntregasAdicionales
      });

      // Timeout extendido para exportación de múltiples vales
      const timeoutMs = Math.max(60000, valeIds.length * 15000); // Mínimo 60s, +15s por vale
      console.log(`⏱️ Timeout configurado: ${timeoutMs}ms (${timeoutMs/1000}s) para ${valeIds.length} vales`);

      const response = await apiClient.post(
        `${this.BASE_URL}/export/combined/excel`,
        {
          valeIds,
          config
        },
        {
          responseType: 'blob',
          timeout: timeoutMs, // Timeout dinámico
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Vales combinados exportados a Excel exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al exportar vales combinados a Excel:', error);
      throw this.handleExportError(error);
    }
  }

  /**
   * Obtener estadísticas de exportación
   */
  static calcularEstadisticas(
    vale: ValeEntrega,
    config: ValeExportConfig
  ): ValeExportStats {
    if (!vale.detalles || vale.detalles.length === 0) {
      return {
        totalVacunas: 0,
        totalEstablecimientos: 0,
        totalEntregas: 0,
        entregasBase: 0,
        entregasAdicionales: 0
      };
    }

    let totalVacunas = 0;
    let entregasBase = 0;
    let entregasAdicionales = 0;
    const establecimientosSet = new Set<string>();

    vale.detalles.forEach(detalle => {
      establecimientosSet.add(detalle.establecimientoId);

      if (config.incluirEntregasBase) {
        const cantidadBase = Number(detalle.cantidadProgramada) || 0;
        totalVacunas += cantidadBase;
        if (cantidadBase > 0) entregasBase++;
      }

      // Entregas adicionales específicas
      if (config.incluirEntregasAdicionales &&
          detalle.numeroEntregaAdicional &&
          config.entregasAdicionalesSeleccionadas.includes(detalle.numeroEntregaAdicional)) {
        const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
        totalVacunas += cantidadAdicional;
        if (cantidadAdicional > 0) entregasAdicionales++;
      }
    });

    return {
      totalVacunas,
      totalEstablecimientos: establecimientosSet.size,
      totalEntregas: entregasBase + entregasAdicionales,
      entregasBase,
      entregasAdicionales
    };
  }

  /**
   * Calcular estadísticas de exportación para múltiples vales (exportación global)
   * NUEVA FUNCIÓN para calcular estadísticas combinadas de todos los vales
   */
  static calcularEstadisticasGlobal(
    vales: ValeEntrega[],
    config: ValeExportConfig
  ): ValeExportStats {
    if (!vales || vales.length === 0) {
      return {
        totalVacunas: 0,
        totalEstablecimientos: 0,
        totalEntregas: 0,
        entregasBase: 0,
        entregasAdicionales: 0
      };
    }

    console.log('📊 Calculando estadísticas globales para', vales.length, 'vales');

    let totalVacunas = 0;
    let entregasBase = 0;
    let entregasAdicionales = 0;
    const establecimientosSet = new Set<string>();

    // Procesar todos los vales
    vales.forEach((vale, valeIndex) => {
      console.log(`📋 Procesando estadísticas del vale ${valeIndex + 1}/${vales.length}: ${vale.numero}`);

      if (!vale.detalles) {
        console.log(`  ⚠️ Vale ${vale.numero} no tiene detalles`);
        return;
      }

      vale.detalles.forEach(detalle => {
        establecimientosSet.add(detalle.establecimientoId);

        if (config.incluirEntregasBase) {
          const cantidadBase = Number(detalle.cantidadProgramada) || 0;
          totalVacunas += cantidadBase;
          if (cantidadBase > 0) entregasBase++;
        }

        if (config.incluirEntregasAdicionales &&
            detalle.numeroEntregaAdicional &&
            config.entregasAdicionalesSeleccionadas.includes(detalle.numeroEntregaAdicional)) {
          const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
          totalVacunas += cantidadAdicional;
          if (cantidadAdicional > 0) entregasAdicionales++;
        }
      });
    });

    const estadisticasFinales = {
      totalVacunas,
      totalEstablecimientos: establecimientosSet.size,
      totalEntregas: entregasBase + entregasAdicionales,
      entregasBase,
      entregasAdicionales
    };

    console.log('📊 Estadísticas globales calculadas:', estadisticasFinales);
    return estadisticasFinales;
  }

  /**
   * Validar configuración de exportación
   */
  static validarConfiguracion(config: ValeExportConfig): string[] {
    const errores: string[] = [];

    // Validación simplificada: debe tener al menos entregas base O entregas adicionales seleccionadas
    const tieneEntregasBase = config.incluirEntregasBase;
    const tieneEntregasAdicionales = config.entregasAdicionalesSeleccionadas && config.entregasAdicionalesSeleccionadas.length > 0;

    if (!tieneEntregasBase && !tieneEntregasAdicionales) {
      errores.push('Debe seleccionar al menos un tipo de entrega para exportar');
    }

    if (!config.responsableRecojo || config.responsableRecojo.trim().length === 0) {
      errores.push('Debe especificar un responsable de recojo');
    }

    if (config.responsableRecojo && config.responsableRecojo.trim().length < 3) {
      errores.push('El nombre del responsable debe tener al menos 3 caracteres');
    }

    if (!config.formatoExportacion || !['excel', 'pdf'].includes(config.formatoExportacion)) {
      errores.push('Debe seleccionar un formato de exportación válido');
    }

    return errores;
  }

  /**
   * Generar nombre de archivo para descarga
   */
  static generarNombreArchivo(
    vale: ValeEntrega, 
    formato: 'excel' | 'pdf'
  ): string {
    const fecha = new Date().toISOString().split('T')[0];
    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    const centroAcopio = vale.centroAcopio.codigo || vale.centroAcopio.nombre.replace(/\s+/g, '_');
    
    return `Vale_${vale.numero}_${centroAcopio}_${fecha}.${extension}`;
  }

  /**
   * Descargar archivo blob
   */
  static descargarArchivo(blob: Blob, filename: string): void {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Archivo descargado:', filename);
    } catch (error) {
      console.error('❌ Error al descargar archivo:', error);
      throw new Error('Error al descargar el archivo');
    }
  }

  /**
   * Exportar y descargar vale
   */
  static async exportarYDescargar(
    vale: ValeEntrega,
    config: ValeExportConfig
  ): Promise<void> {
    // Validar configuración
    const errores = this.validarConfiguracion(config);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    try {
      let blob: Blob;

      // Exportar según el formato
      if (config.formatoExportacion === 'excel') {
        blob = await this.exportarExcel(vale.id, config);
      } else {
        blob = await this.exportarPDF(vale.id, config);
      }

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo(vale, config.formatoExportacion);

      // Descargar archivo
      this.descargarArchivo(blob, filename);

    } catch (error) {
      console.error('❌ Error en exportación completa:', error);
      throw error;
    }
  }

  /**
   * Exportar y descargar múltiples vales combinados
   * NUEVA FUNCIÓN para manejar exportación global con agregación correcta
   */
  static async exportarYDescargarGlobal(
    vales: ValeEntrega[],
    config: ValeExportConfig
  ): Promise<void> {
    if (vales.length === 0) {
      throw new Error('No hay vales para exportar');
    }

    // Validar configuración
    const errores = this.validarConfiguracion(config);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    try {
      console.log('🔄 Iniciando exportación global de', vales.length, 'vales');
      console.log('📋 Vales a combinar:', vales.map(v => `${v.numero} (${v.totalVacunas} vacunas)`).join(', '));

      // Si solo hay un vale, usar la función normal
      if (vales.length === 1) {
        return await this.exportarYDescargar(vales[0], config);
      }

      // SOLUCIÓN DEFINITIVA: Usar el nuevo endpoint de exportación combinada
      console.log('🔄 Usando endpoint de exportación combinada');

      const valeIds = vales.map(vale => vale.id);

      let blob: Blob;
      if (config.formatoExportacion === 'excel') {
        // Usar el nuevo endpoint para exportación combinada
        blob = await this.exportarValesCombinados(valeIds, config);
      } else {
        // Para PDF, usar el primer vale como representativo por ahora
        console.log('⚠️ PDF combinado no implementado, usando primer vale como representativo');
        const valeRepresentativo = vales[0];
        blob = await this.exportarPDF(valeRepresentativo.id, config);
      }

      // Generar nombre de archivo especial para exportación global
      const fecha = new Date().toISOString().split('T')[0];
      const extension = config.formatoExportacion === 'excel' ? 'xlsx' : 'pdf';
      const filename = `Vales_Combinados_${vales.length}_vales_${fecha}.${extension}`;

      // Descargar archivo
      this.descargarArchivo(blob, filename);

      console.log(`✅ Exportación global completada: ${filename}`);

    } catch (error) {
      console.error('❌ Error en exportación global:', error);
      throw error;
    }
  }

  /**
   * Obtener vista previa de exportación
   */
  static async obtenerVistaPrevia(
    valeId: string,
    config: Omit<ValeExportConfig, 'formatoExportacion'>
  ): Promise<ApiResponse<ValeExportStats>> {
    try {
      const response = await apiClient.post<ApiResponse<ValeExportStats>>(
        `${this.BASE_URL}/${valeId}/export/preview`,
        config
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener vista previa:', error);
      throw this.handleExportError(error);
    }
  }

  /**
   * Manejar errores de exportación
   */
  private static handleExportError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      switch (status) {
        case 400:
          return new Error(message || 'Configuración de exportación inválida');
        case 404:
          return new Error('Vale no encontrado');
        case 422:
          return new Error(message || 'Datos de exportación inválidos');
        case 500:
          return new Error('Error interno del servidor al generar exportación');
        default:
          return new Error(message || 'Error desconocido en la exportación');
      }
    }
    
    if (error.request) {
      return new Error('Error de conexión al servidor de exportación');
    }
    
    return new Error(error.message || 'Error desconocido en la exportación');
  }

  /**
   * Obtener configuración por defecto
   */
  static getConfiguracionPorDefecto(vale: ValeEntrega): ValeExportConfig {
    return {
      incluirEntregasBase: true,
      incluirEntregasAdicionales: false,
      entregasAdicionalesSeleccionadas: [],
      responsableRecojo: `${vale.usuario.nombres} ${vale.usuario.apellidos}`,
      formatoExportacion: 'excel'
    };
  }

  /**
   * Verificar si el vale tiene entregas adicionales
   */
  static tieneEntregasAdicionales(vale: ValeEntrega): boolean {
    if (!vale.detalles) return false;

    return vale.detalles.some(detalle =>
      detalle.cantidadAdicional && Number(detalle.cantidadAdicional) > 0
    );
  }

  /**
   * Obtener lista de entregas adicionales disponibles en el vale
   */
  static obtenerEntregasAdicionalesDisponibles(vale: ValeEntrega): Array<{
    numero: number;
    descripcion: string;
    totalVacunas: number;
    totalEstablecimientos: number;
  }> {
    if (!vale.detalles) return [];

    const entregasMap = new Map<number, {
      numero: number;
      totalVacunas: number;
      establecimientos: Set<string>;
    }>();

    vale.detalles.forEach(detalle => {
      if (detalle.numeroEntregaAdicional && detalle.cantidadAdicional > 0) {
        const numero = detalle.numeroEntregaAdicional;

        if (!entregasMap.has(numero)) {
          entregasMap.set(numero, {
            numero,
            totalVacunas: 0,
            establecimientos: new Set()
          });
        }

        const entrega = entregasMap.get(numero)!;
        entrega.totalVacunas += Number(detalle.cantidadAdicional) || 0;
        entrega.establecimientos.add(detalle.establecimientoId);
      }
    });

    return Array.from(entregasMap.values())
      .map(entrega => ({
        numero: entrega.numero,
        descripcion: `Entrega Adicional #${entrega.numero}`,
        totalVacunas: entrega.totalVacunas,
        totalEstablecimientos: entrega.establecimientos.size
      }))
      .sort((a, b) => a.numero - b.numero);
  }

  /**
   * Obtener lista de entregas adicionales disponibles de múltiples vales (para exportación global)
   * NUEVA FUNCIÓN para analizar todos los vales y obtener todas las entregas adicionales disponibles
   */
  static obtenerEntregasAdicionalesDisponiblesGlobal(vales: ValeEntrega[]): Array<{
    numero: number;
    descripcion: string;
    totalVacunas: number;
    totalEstablecimientos: number;
  }> {
    if (!vales || vales.length === 0) return [];

    console.log('🔍 Analizando entregas adicionales globales de', vales.length, 'vales');

    const entregasMap = new Map<number, {
      numero: number;
      totalVacunas: number;
      establecimientos: Set<string>;
      valesConEstaEntrega: Set<string>;
    }>();

    // Procesar todos los vales
    vales.forEach((vale, valeIndex) => {
      console.log(`📋 Procesando vale ${valeIndex + 1}/${vales.length}: ${vale.numero}`);

      if (!vale.detalles) {
        console.log(`  ⚠️ Vale ${vale.numero} no tiene detalles`);
        return;
      }

      vale.detalles.forEach(detalle => {
        if (detalle.numeroEntregaAdicional && detalle.cantidadAdicional > 0) {
          const numero = detalle.numeroEntregaAdicional;

          if (!entregasMap.has(numero)) {
            entregasMap.set(numero, {
              numero,
              totalVacunas: 0,
              establecimientos: new Set(),
              valesConEstaEntrega: new Set()
            });
            console.log(`  ✨ Nueva entrega adicional encontrada: #${numero}`);
          }

          const entrega = entregasMap.get(numero)!;
          const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;

          entrega.totalVacunas += cantidadAdicional;
          entrega.establecimientos.add(detalle.establecimientoId);
          entrega.valesConEstaEntrega.add(vale.numero);

          console.log(`    ✅ Entrega #${numero}: +${cantidadAdicional} vacunas (Total: ${entrega.totalVacunas})`);
        }
      });
    });

    const entregasFinales = Array.from(entregasMap.values())
      .map(entrega => ({
        numero: entrega.numero,
        descripcion: `Entrega Adicional #${entrega.numero} (${entrega.valesConEstaEntrega.size} vales)`,
        totalVacunas: entrega.totalVacunas,
        totalEstablecimientos: entrega.establecimientos.size
      }))
      .sort((a, b) => a.numero - b.numero);

    console.log('📊 Resumen de entregas adicionales globales:');
    entregasFinales.forEach(entrega => {
      console.log(`  - ${entrega.descripcion}: ${entrega.totalVacunas} vacunas, ${entrega.totalEstablecimientos} establecimientos`);
    });

    return entregasFinales;
  }

  /**
   * Obtener resumen de contenido para exportación
   */
  static obtenerResumenContenido(
    vale: ValeEntrega,
    config: ValeExportConfig
  ): {
    descripcion: string;
    detalles: string[];
  } {
    const stats = this.calcularEstadisticas(vale, config);
    // const tieneAdicionales = this.tieneEntregasAdicionales(vale); // Comentado por ahora
    
    let descripcion = '';
    const detalles: string[] = [];
    
    if (config.incluirEntregasBase && config.incluirEntregasAdicionales) {
      descripcion = 'Exportación completa (entregas base + adicionales)';
    } else if (config.incluirEntregasBase) {
      descripcion = 'Solo entregas base (programadas)';
    } else {
      descripcion = 'Solo entregas adicionales';
    }
    
    detalles.push(`${stats.totalVacunas.toLocaleString()} vacunas`);
    detalles.push(`${stats.totalEstablecimientos} establecimientos`);
    detalles.push(`${stats.totalEntregas} entregas`);
    
    if (config.incluirEntregasBase && stats.entregasBase > 0) {
      detalles.push(`${stats.entregasBase} entregas base`);
    }
    
    if (config.incluirEntregasAdicionales && stats.entregasAdicionales > 0) {
      detalles.push(`${stats.entregasAdicionales} entregas adicionales`);
    }
    
    return { descripcion, detalles };
  }
}

export default ValeExportService;
