import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ValeService } from './ValeService';
import { ConfiguracionJeringaVacunaService } from './ConfiguracionJeringaVacunaService';
import { ServiceResult } from '@/types';

/**
 * Configuración para exportación de vales
 */
export interface ValeExportConfig {
  incluirEntregasBase: boolean;
  incluirEntregasAdicionales: boolean;
  entregasAdicionalesSeleccionadas: number[];
  responsableRecojo: string;
  formatoExportacion: 'excel' | 'pdf';
}

/**
 * Resultado de exportación Excel
 */
export interface ExcelExportResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Resultado de exportación PDF
 */
export interface PDFExportResult {
  buffer: Buffer;
  filename: string;
  size: number;
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
class ValeExportService {

  /**
   * Exportar vale a Excel
   */
  static async exportarExcel(
    valeId: string,
    config: ValeExportConfig
  ): Promise<ServiceResult<ExcelExportResult>> {
    try {
      console.log('🔄 Generando exportación Excel para vale:', valeId);

      // Obtener vale con detalles
      const valeResult = await ValeService.getValeById(valeId);
      if (!valeResult.success || !valeResult.data) {
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      const vale = valeResult.data;

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Vale de Entrega');

      // Configurar columnas con anchos optimizados para jeringas
      worksheet.columns = [
        { header: 'Nº', key: 'numero', width: 5 },
        { header: 'Establecimiento', key: 'establecimiento', width: 30 },
        { header: 'Código', key: 'codigo', width: 12 },
        { header: 'Vacuna', key: 'vacuna', width: 25 },
        { header: 'Presentación', key: 'presentacion', width: 15 },
        { header: 'Cantidad Base', key: 'cantidadBase', width: 12 },
        { header: 'Cantidad Adicional', key: 'cantidadAdicional', width: 15 },
        { header: 'Total', key: 'total', width: 10 }
      ];

      // Agregar encabezado del vale
      this.agregarEncabezadoExcel(worksheet, vale, config);

      // Procesar y agregar datos
      const datosParaExportar = await this.procesarDatosParaExportacion(vale, config);
      this.agregarDatosExcel(worksheet, datosParaExportar, config);

      // Aplicar estilos
      this.aplicarEstilosExcel(worksheet);

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo(vale, 'excel');

      console.log('✅ Exportación Excel generada exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error al generar exportación Excel:', error);
      return {
        success: false,
        error: `Error al generar Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Exportar múltiples vales combinados a Excel
   * NUEVA FUNCIÓN para exportación global con agregación correcta
   */
  static async exportarValesCombinados(
    valeIds: string[],
    config: ValeExportConfig
  ): Promise<ServiceResult<ExcelExportResult>> {
    const startTime = Date.now();
    try {
      console.log(`🔄 Generando exportación Excel combinada para ${valeIds.length} vales`);

      // Obtener todos los vales con detalles
      const vales: any[] = [];
      for (const valeId of valeIds) {
        const valeResult = await ValeService.getValeById(valeId);
        if (valeResult.success && valeResult.data) {
          vales.push(valeResult.data);
        } else {
          console.warn(`⚠️ Vale no encontrado: ${valeId}`);
        }
      }

      if (vales.length === 0) {
        return {
          success: false,
          error: 'No se encontraron vales válidos para exportar'
        };
      }

      console.log(`📋 Procesando ${vales.length} vales para combinación`);

      // Crear vale virtual combinado
      const valeCombinado = this.combinarValesParaExportacion(vales);

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Vales Combinados');

      // Configurar columnas
      worksheet.columns = [
        { header: 'Nº', key: 'numero', width: 5 },
        { header: 'Establecimiento', key: 'establecimiento', width: 30 },
        { header: 'Código', key: 'codigo', width: 12 },
        { header: 'Vacuna', key: 'vacuna', width: 25 },
        { header: 'Presentación', key: 'presentacion', width: 15 },
        { header: 'Cantidad Base', key: 'cantidadBase', width: 12 },
        { header: 'Cantidad Adicional', key: 'cantidadAdicional', width: 15 },
        { header: 'Total', key: 'total', width: 10 }
      ];

      // Agregar encabezado del vale combinado
      this.agregarEncabezadoExcel(worksheet, valeCombinado, config);

      // Procesar y agregar datos combinados
      const datosParaExportar = await this.procesarDatosParaExportacion(valeCombinado, config);
      this.agregarDatosExcel(worksheet, datosParaExportar, config);

      // Aplicar estilos
      this.aplicarEstilosExcel(worksheet);

      // Generar nombre de archivo especial
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Vales_Combinados_${vales.length}_vales_${fecha}.xlsx`;

      const endTime = Date.now();
      console.log(`✅ Exportación Excel combinada completada en ${endTime - startTime}ms`);

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error al generar exportación Excel combinada:', error);
      return {
        success: false,
        error: `Error al generar Excel combinado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Exportar vale a PDF
   */
  static async exportarPDF(
    valeId: string,
    config: ValeExportConfig
  ): Promise<ServiceResult<PDFExportResult>> {
    try {
      console.log('🔄 Generando exportación PDF para vale:', valeId);

      // Obtener vale con detalles
      const valeResult = await ValeService.getValeById(valeId);
      if (!valeResult.success || !valeResult.data) {
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      const vale = valeResult.data;

      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));

      // Agregar contenido al PDF
      this.agregarEncabezadoPDF(doc, vale, config);

      // Procesar y agregar datos
      const datosParaExportar = await this.procesarDatosParaExportacion(vale, config);
      this.agregarDatosPDF(doc, datosParaExportar, config);

      // Finalizar documento
      doc.end();

      // Esperar a que se complete la generación
      const buffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
      });

      // Generar nombre de archivo
      const filename = this.generarNombreArchivo(vale, 'pdf');

      console.log('✅ Exportación PDF generada exitosamente');

      return {
        success: true,
        data: {
          buffer,
          filename,
          size: buffer.length
        }
      };

    } catch (error) {
      console.error('❌ Error al generar exportación PDF:', error);
      return {
        success: false,
        error: `Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Obtener vista previa de exportación
   */
  static async getExportPreview(
    valeId: string,
    config: Omit<ValeExportConfig, 'formatoExportacion'>
  ): Promise<ServiceResult<ValeExportStats>> {
    try {
      // Obtener vale con detalles
      const valeResult = await ValeService.getValeById(valeId);
      if (!valeResult.success || !valeResult.data) {
        return {
          success: false,
          error: 'Vale no encontrado'
        };
      }

      const vale = valeResult.data;
      const configCompleta: ValeExportConfig = {
        ...config,
        formatoExportacion: 'excel' // Valor temporal para el cálculo
      };

      // Calcular estadísticas
      const stats = this.calcularEstadisticas(vale, configCompleta);

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('❌ Error al generar vista previa:', error);
      return {
        success: false,
        error: `Error al generar vista previa: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Validar configuración de exportación
   */
  static validarConfiguracion(config: any): string[] {
    const errores: string[] = [];

    console.log('🔍 Validando configuración:', JSON.stringify(config, null, 2));

    // Verificar que la configuración existe
    if (!config || typeof config !== 'object') {
      errores.push('Configuración de exportación inválida');
      return errores;
    }

    // Validar campos obligatorios con valores por defecto
    const incluirEntregasBase = config.incluirEntregasBase === true;
    const entregasAdicionalesSeleccionadas = Array.isArray(config.entregasAdicionalesSeleccionadas)
      ? config.entregasAdicionalesSeleccionadas
      : [];
    const tieneEntregasAdicionales = entregasAdicionalesSeleccionadas.length > 0;

    console.log('🔍 Análisis de entregas:', {
      incluirEntregasBase,
      entregasAdicionalesSeleccionadas,
      tieneEntregasAdicionales
    });

    // Debe tener al menos un tipo de entrega
    if (!incluirEntregasBase && !tieneEntregasAdicionales) {
      errores.push('Debe seleccionar al menos un tipo de entrega para exportar');
    }

    // Validar responsable
    if (!config.responsableRecojo || typeof config.responsableRecojo !== 'string' || config.responsableRecojo.trim().length === 0) {
      errores.push('Debe especificar un responsable de recojo');
    } else if (config.responsableRecojo.trim().length < 3) {
      errores.push('El nombre del responsable debe tener al menos 3 caracteres');
    }

    // Validar formato
    if (!config.formatoExportacion || !['excel', 'pdf'].includes(config.formatoExportacion)) {
      errores.push('Debe seleccionar un formato de exportación válido');
    }

    console.log('🔍 Errores encontrados:', errores);
    return errores;
  }

  /**
   * Calcular estadísticas de exportación
   */
  private static calcularEstadisticas(vale: any, config: ValeExportConfig): ValeExportStats {
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

    vale.detalles.forEach((detalle: any) => {
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
   * Combinar múltiples vales en uno virtual para exportación
   */
  private static combinarValesParaExportacion(vales: any[]): any {
    if (vales.length === 0) {
      throw new Error('No hay vales para combinar');
    }

    if (vales.length === 1) {
      return vales[0];
    }

    console.log('🔄 Combinando', vales.length, 'vales para exportación');

    // Usar el primer vale como base
    const valeBase = vales[0];

    // Mapas para agregar datos por establecimiento y vacuna
    const detallesCombinados = new Map<string, any>();
    let totalVacunasCombinado = 0;
    const establecimientosSet = new Set<string>();

    // Procesar todos los vales
    vales.forEach((vale, valeIndex) => {
      console.log(`📋 Procesando vale ${valeIndex + 1}/${vales.length}: ${vale.numero}`);

      if (vale.detalles) {
        totalVacunasCombinado += vale.totalVacunas || 0;

        vale.detalles.forEach((detalle: any) => {
          establecimientosSet.add(detalle.establecimientoId);

          // Debug: Log detalle que se está procesando
          if (detalle.cantidadAdicional > 0) {
            console.log(`  📋 Detalle con entrega adicional: ${detalle.vacuna.nombre} - ${detalle.establecimiento.nombre}`, {
              cantidadProgramada: detalle.cantidadProgramada,
              cantidadAdicional: detalle.cantidadAdicional,
              numeroEntregaAdicional: detalle.numeroEntregaAdicional
            });
          }

          // Crear clave única para establecimiento + vacuna
          const claveDetalle = `${detalle.establecimientoId}-${detalle.vacunaId}`;

          if (!detallesCombinados.has(claveDetalle)) {
            // Crear nuevo detalle combinado PRESERVANDO toda la información
            detallesCombinados.set(claveDetalle, {
              ...detalle,
              cantidadProgramada: 0,
              cantidadAdicional: 0,
              cantidadTotal: 0,
              // ✅ CORRECCIÓN: Preservar información de entregas adicionales
              numeroEntregaAdicional: detalle.numeroEntregaAdicional || null,
              cantidadJeringaProgramada: 0,
              cantidadJeringaAdicional: 0
            });
          }

          const detalleCombinado = detallesCombinados.get(claveDetalle);

          // Sumar cantidades
          const cantidadProgramada = Number(detalle.cantidadProgramada) || 0;
          const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
          const cantidadTotal = Number(detalle.cantidadTotal) || (cantidadProgramada + cantidadAdicional);

          detalleCombinado.cantidadProgramada += cantidadProgramada;
          detalleCombinado.cantidadAdicional += cantidadAdicional;
          detalleCombinado.cantidadTotal += cantidadTotal;

          // ✅ CORRECCIÓN: Preservar el número de entrega adicional si existe
          if (detalle.numeroEntregaAdicional && !detalleCombinado.numeroEntregaAdicional) {
            detalleCombinado.numeroEntregaAdicional = detalle.numeroEntregaAdicional;
          }

          // Sumar jeringas también
          detalleCombinado.cantidadJeringaProgramada += Number(detalle.cantidadJeringaProgramada) || 0;
          detalleCombinado.cantidadJeringaAdicional += Number(detalle.cantidadJeringaAdicional) || 0;

          console.log(`  ✅ ${detalle.vacuna.nombre}: +${cantidadTotal} (Total acumulado: ${detalleCombinado.cantidadTotal})`);
        });
      }
    });

    // Convertir el mapa a array de detalles
    const detallesFinales = Array.from(detallesCombinados.values());

    // Debug: Verificar entregas adicionales en detalles finales
    const detallesConEntregasAdicionales = detallesFinales.filter(d => d.cantidadAdicional > 0);
    console.log('📊 Resumen de combinación:');
    console.log(`  - Vales combinados: ${vales.length}`);
    console.log(`  - Detalles únicos: ${detallesFinales.length}`);
    console.log(`  - Total vacunas: ${totalVacunasCombinado}`);
    console.log(`  - Establecimientos únicos: ${establecimientosSet.size}`);
    console.log(`  - Detalles con entregas adicionales: ${detallesConEntregasAdicionales.length}`);

    if (detallesConEntregasAdicionales.length > 0) {
      console.log('📋 Entregas adicionales preservadas:');
      detallesConEntregasAdicionales.forEach(detalle => {
        console.log(`  ✅ ${detalle.vacuna.nombre} - ${detalle.establecimiento.nombre}: +${detalle.cantidadAdicional} (entrega #${detalle.numeroEntregaAdicional})`);
      });
    }

    // Crear vale combinado
    const valeCombinado = {
      ...valeBase,
      numero: `COMBINADO-${vales.length}-VALES`,
      detalles: detallesFinales,
      totalVacunas: totalVacunasCombinado,
      totalEstablecimientos: establecimientosSet.size,
      observaciones: `Vale combinado de ${vales.length} vales de entrega. Cantidades agregadas por tipo de vacuna y establecimiento.`
    };

    return valeCombinado;
  }

  /**
   * Verificar si existe configuración de jeringas para las vacunas del vale
   */
  private static async verificarConfiguracionJeringas(vale: any): Promise<boolean> {
    try {
      // Obtener todas las vacunas únicas del vale
      const vacunasUnicas = [...new Set(vale.detalles.map((detalle: any) => detalle.vacunaId))] as string[];

      // Verificar si al menos una vacuna tiene configuración de jeringas
      for (const vacunaId of vacunasUnicas) {
        const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
          vacunaId,
          1, // Cantidad mínima para verificar
          vale.centroAcopioId,
          false // NO usar fallback automático
        );

        if (configResult.success && configResult.data && configResult.data.length > 0) {
          console.log(`✅ [ValeExportService] Configuración de jeringas encontrada para vacuna: ${vacunaId}`);
          return true; // Al menos una vacuna tiene configuración
        }
      }

      console.log(`⚠️ [ValeExportService] No se encontró configuración de jeringas para ninguna vacuna del vale`);
      return false;
    } catch (error) {
      console.error('❌ [ValeExportService] Error al verificar configuración de jeringas:', error);
      return false; // En caso de error, no incluir jeringas
    }
  }

  /**
   * Obtener configuración de jeringas para todas las vacunas del vale
   */
  private static async obtenerConfiguracionJeringasVale(vale: any): Promise<{ [vacunaId: string]: any[] }> {
    try {
      const configuraciones: { [vacunaId: string]: any[] } = {};

      // Obtener vacunas únicas del vale con sus cantidades totales
      const vacunasMap = new Map<string, number>();

      vale.detalles.forEach((detalle: any) => {
        const vacunaId = detalle.vacunaId;
        const cantidadBase = Number(detalle.cantidadProgramada) || 0;
        const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;
        const cantidadTotal = cantidadBase + cantidadAdicional;

        if (vacunasMap.has(vacunaId)) {
          vacunasMap.set(vacunaId, vacunasMap.get(vacunaId)! + cantidadTotal);
        } else {
          vacunasMap.set(vacunaId, cantidadTotal);
        }
      });

      // Obtener configuración para cada vacuna
      for (const [vacunaId, cantidad] of vacunasMap.entries()) {
        const configResult = await ConfiguracionJeringaVacunaService.calcularJeringasNecesarias(
          vacunaId,
          cantidad,
          vale.centroAcopioId,
          false // NO usar fallback automático para exportación
        );

        if (configResult.success && configResult.data) {
          configuraciones[vacunaId] = configResult.data;
        } else {
          configuraciones[vacunaId] = [];
        }
      }

      return configuraciones;
    } catch (error) {
      console.error('❌ [ValeExportService] Error al obtener configuraciones de jeringas:', error);
      return {};
    }
  }

  /**
   * Procesar datos para exportación con estructura profesional
   */
  private static async procesarDatosParaExportacion(vale: any, config: ValeExportConfig) {
    if (!vale.detalles) return { consolidado: [], establecimientos: [], jeringasEstandar: [] };

    console.log('🔄 Procesando datos para exportación:', {
      totalDetalles: vale.detalles.length,
      incluirEntregasBase: config.incluirEntregasBase,
      incluirEntregasAdicionales: config.incluirEntregasAdicionales,
      entregasAdicionalesSeleccionadas: config.entregasAdicionalesSeleccionadas
    });

    // Verificar si existe configuración de jeringas para este vale
    const tieneConfiguracionJeringas = await this.verificarConfiguracionJeringas(vale);
    console.log(`🔍 [ValeExportService] Configuración de jeringas: ${tieneConfiguracionJeringas ? 'ENCONTRADA' : 'NO ENCONTRADA'}`);

    // Obtener configuración de jeringas para todas las vacunas del vale
    const configuracionJeringas = await this.obtenerConfiguracionJeringasVale(vale);
    console.log(`📋 [ValeExportService] Configuraciones obtenidas:`, Object.keys(configuracionJeringas).length);

    // Debug: Analizar entregas adicionales disponibles en el vale
    const entregasAdicionalesEnVale = new Set<number>();
    vale.detalles.forEach((detalle: any) => {
      if (detalle.numeroEntregaAdicional && detalle.cantidadAdicional > 0) {
        entregasAdicionalesEnVale.add(detalle.numeroEntregaAdicional);
      }
    });
    console.log('📋 Entregas adicionales encontradas en vale:', Array.from(entregasAdicionalesEnVale));

    // Lista estándar de jeringas (mantener para jeringas)
    // Lista estándar de jeringas removida - ahora se usan nombres dinámicos

    // Agrupar datos por establecimiento
    const establecimientosMap = new Map();
    const consolidadoMap = new Map();

    vale.detalles.forEach((detalle: any) => {
      const estId = detalle.establecimientoId;
      const vacunaId = detalle.vacunaId;
      const vacunaNombre = detalle.vacuna.nombre;

      // Inicializar establecimiento si no existe
      if (!establecimientosMap.has(estId)) {
        establecimientosMap.set(estId, {
          id: estId,
          nombre: detalle.establecimiento.nombre,
          codigo: detalle.establecimiento.codigo,
          vacunas: new Map(),
          jeringas: new Map()
        });
      }

      const estData = establecimientosMap.get(estId);

      // Procesar vacunas
      if (!estData.vacunas.has(vacunaId)) {
        estData.vacunas.set(vacunaId, {
          nombre: vacunaNombre,
          cantidad: 0
        });
      }

      // Procesar jeringas SOLO si existe configuración para esta vacuna
      const configJeringas = configuracionJeringas[vacunaId] || [];
      if (tieneConfiguracionJeringas && configJeringas.length > 0) {
        configJeringas.forEach((config: any) => {
          const jeringaId = config.jeringaId;
          if (!estData.jeringas.has(jeringaId)) {
            estData.jeringas.set(jeringaId, {
              nombre: `${config.jeringa?.tipo || 'Jeringa'} ${config.jeringa?.capacidad || ''}`.trim(),
              cantidad: 0
            });
          }
        });
      }

      // Sumar cantidades según configuración de exportación
      let cantidadVacuna = 0;

      if (config.incluirEntregasBase) {
        const cantidadBase = Number(detalle.cantidadProgramada) || 0;
        cantidadVacuna += cantidadBase;
        console.log(`📊 [ValeExportService] Entrega base - Vacuna: ${vacunaNombre}, Cantidad: ${cantidadBase}`);
      }

      // Debug detallado para entregas adicionales
      if (config.incluirEntregasAdicionales && detalle.numeroEntregaAdicional) {
        const numeroEntrega = detalle.numeroEntregaAdicional;
        const cantidadAdicional = Number(detalle.cantidadAdicional) || 0;

        // CORRECCIÓN: Si no hay entregas específicamente seleccionadas, incluir todas
        const hayEntregasSeleccionadas = config.entregasAdicionalesSeleccionadas && config.entregasAdicionalesSeleccionadas.length > 0;
        const estaSeleccionada = !hayEntregasSeleccionadas || config.entregasAdicionalesSeleccionadas.includes(numeroEntrega);

        console.log(`🔍 Debug entrega adicional - ${vacunaNombre}:`, {
          numeroEntrega,
          cantidadAdicional,
          entregasSeleccionadas: config.entregasAdicionalesSeleccionadas,
          hayEntregasSeleccionadas,
          estaSeleccionada,
          seIncluira: estaSeleccionada && cantidadAdicional > 0
        });

        if (estaSeleccionada && cantidadAdicional > 0) {
          cantidadVacuna += cantidadAdicional;
          console.log(`  ✅ Agregando ${cantidadAdicional} unidades adicionales de ${vacunaNombre} (entrega #${numeroEntrega})`);
        } else {
          console.log(`  ❌ No se incluye entrega adicional #${numeroEntrega} (${!estaSeleccionada ? 'no seleccionada' : 'cantidad 0'})`);
        }
      }

      // Actualizar cantidades de vacunas
      console.log(`📊 [ValeExportService] Actualizando vacuna ${vacunaNombre}: +${cantidadVacuna} unidades`);
      estData.vacunas.get(vacunaId).cantidad += cantidadVacuna;

      // Actualizar cantidades de jeringas según configuración específica
      if (tieneConfiguracionJeringas && configJeringas.length > 0 && cantidadVacuna > 0) {
        console.log(`💉 [ValeExportService] Calculando jeringas para ${cantidadVacuna} unidades de ${vacunaNombre}`);
        configJeringas.forEach((configJeringa: any) => {
          const jeringaId = configJeringa.jeringaId;
          const cantidadJeringaEspecifica = Math.ceil(cantidadVacuna * configJeringa.multiplicador);

          console.log(`  - Jeringa ${configJeringa.jeringa?.tipo}: ${cantidadJeringaEspecifica} unidades (${cantidadVacuna} × ${configJeringa.multiplicador})`);

          if (estData.jeringas.has(jeringaId)) {
            estData.jeringas.get(jeringaId).cantidad += cantidadJeringaEspecifica;
          }
        });
      }

      // Actualizar consolidado de vacunas
      if (!consolidadoMap.has(vacunaId)) {
        consolidadoMap.set(vacunaId, {
          nombre: vacunaNombre,
          cantidad: 0
        });
      }
      const cantidadAnterior = consolidadoMap.get(vacunaId).cantidad;
      consolidadoMap.get(vacunaId).cantidad += cantidadVacuna;
      console.log(`📈 [ValeExportService] Consolidado ${vacunaNombre}: ${cantidadAnterior} + ${cantidadVacuna} = ${consolidadoMap.get(vacunaId).cantidad}`);
    });

    // CAMBIO PRINCIPAL: Usar solo las vacunas que tienen cantidad > 0
    // Obtener todas las vacunas que realmente tienen datos en el vale
    const vacunasEncontradas = Array.from(consolidadoMap.values())
      .filter(v => v.cantidad > 0) // Solo vacunas con cantidad
      .map(v => v.nombre)
      .sort(); // Ordenar alfabéticamente

    console.log(`📋 Procesando ${vacunasEncontradas.length} tipos de vacunas con cantidad > 0`);

    // Consolidar jeringas de todos los establecimientos
    const jeringasConsolidadoMap = new Map<string, number>();
    Array.from(establecimientosMap.values()).forEach(estData => {
      Array.from(estData.jeringas.values()).forEach((jeringaData: any) => {
        const nombre = jeringaData.nombre;
        if (!jeringasConsolidadoMap.has(nombre)) {
          jeringasConsolidadoMap.set(nombre, 0);
        }
        jeringasConsolidadoMap.set(nombre, jeringasConsolidadoMap.get(nombre)! + jeringaData.cantidad);
      });
    });

    const jeringasEncontradas = Array.from(jeringasConsolidadoMap.entries())
      .filter(([, cantidad]) => cantidad > 0) // Solo jeringas con cantidad > 0
      .map(([nombre]) => nombre)
      .sort();
    console.log(`📋 Procesando ${jeringasEncontradas.length} tipos de jeringas con cantidad > 0`);

    // Generar estructura de consolidado usando TODAS las vacunas encontradas
    const consolidado = vacunasEncontradas.map((vacunaNombre, index) => {
      // Buscar la vacuna en el consolidadoMap por nombre
      let cantidad = 0;
      for (const [, vacunaData] of consolidadoMap.entries()) {
        if (vacunaData.nombre === vacunaNombre) {
          cantidad = vacunaData.cantidad;
          break;
        }
      }

      console.log(`📊 [ValeExportService] Consolidado - ${vacunaNombre}: ${cantidad} unidades`);

      return {
        numero: index + 1,
        biologico: vacunaNombre,
        cantidad: cantidad
      };
    });

    // Debug: Mostrar resumen del consolidado
    console.log('📊 Resumen del consolidado generado:');
    console.log('📋 Datos del consolidadoMap:', Array.from(consolidadoMap.entries()));
    console.log('📋 Vacunas encontradas:', vacunasEncontradas);
    console.log('📋 Jeringas consolidadas:', jeringasConsolidadoMap);

    consolidado.forEach(item => {
      console.log(`  📊 ${item.biologico}: ${item.cantidad} unidades (${item.cantidad > 0 ? '✅' : '❌'})`);
    });

    console.log('💉 Resumen de jeringas consolidadas:');
    Array.from(jeringasConsolidadoMap.entries()).forEach(([nombre, cantidad]) => {
      console.log(`  💉 ${nombre}: ${cantidad} unidades (${cantidad > 0 ? '✅' : '❌'})`);
    });

    // Generar estructura de establecimientos usando vacunas dinámicas
    const establecimientos = Array.from(establecimientosMap.values()).map(estData => {
      const vacunas = vacunasEncontradas.map((vacunaNombre, index) => {
        const vacunaData = Array.from(estData.vacunas.values()).find((v: any) => v.nombre === vacunaNombre);
        const cantidad = vacunaData ? (vacunaData as any).cantidad : 0;
        return {
          numero: index + 1,
          biologico: vacunaNombre,
          cantidad: cantidad
        };
      });

      const jeringas = jeringasEncontradas.map(jeringaNombre => {
        const jeringaData = Array.from(estData.jeringas.values()).find((j: any) => j.nombre === jeringaNombre);
        return {
          nombre: jeringaNombre,
          cantidad: jeringaData ? (jeringaData as any).cantidad : 0
        };
      });

      return {
        id: estData.id,
        nombre: estData.nombre,
        codigo: estData.codigo,
        vacunas,
        jeringas
      };
    });

    // Generar consolidado de jeringas (solo las que tienen cantidad > 0)
    const jeringasConsolidado = jeringasEncontradas.map(nombre => ({
      nombre,
      cantidad: jeringasConsolidadoMap.get(nombre) || 0
    })).filter(jeringa => jeringa.cantidad > 0);

    return {
      consolidado,
      establecimientos,
      jeringasConsolidado,
      jeringasEstandar: jeringasEncontradas // Para compatibilidad con código existente
    };
  }

  /**
   * Generar nombre de archivo
   */
  private static generarNombreArchivo(vale: any, formato: 'excel' | 'pdf'): string {
    const fecha = new Date().toISOString().split('T')[0];
    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    const centroAcopio = vale.centroAcopio.codigo || vale.centroAcopio.nombre.replace(/\s+/g, '_');
    
    return `Vale_${vale.numero}_${centroAcopio}_${fecha}.${extension}`;
  }

  /**
   * Limpiar texto para PDF - remover caracteres problemáticos
   */
  private static limpiarTexto(texto: string): string {
    if (!texto) return '';

    return texto
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ÁÀÄÂ]/g, 'A')
      .replace(/[ÉÈËÊ]/g, 'E')
      .replace(/[ÍÌÏÎ]/g, 'I')
      .replace(/[ÓÒÖÔ]/g, 'O')
      .replace(/[ÚÙÜÛ]/g, 'U')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N')
      .replace(/[^\x00-\x7F]/g, '') // Remover caracteres no ASCII
      .trim();
  }

  // ============================================================================
  // PALETA DE COLORES PROFESIONAL - CONSISTENTE CON SIVAC (teal/cyan)
  // ============================================================================
  private static readonly COLORS = {
    // Colores primarios del sistema (teal)
    primary: 'FF0D9488',      // teal-600
    primaryDark: 'FF0F766E',  // teal-700
    primaryLight: 'FFCCFBF1', // teal-100
    
    // Colores secundarios (cyan)
    secondary: 'FF0891B2',    // cyan-600
    secondaryLight: 'FFCFFAFE', // cyan-100
    
    // Colores institucionales
    institutional: 'FF115E59', // teal-800 para headers institucionales
    institutionalLight: 'FF14B8A6', // teal-500
    
    // Colores de estado
    success: 'FF059669',      // emerald-600
    successLight: 'FFECFDF5', // emerald-50
    
    // Colores neutros
    white: 'FFFFFFFF',
    gray50: 'FFF9FAFB',
    gray100: 'FFF3F4F6',
    gray200: 'FFE5E7EB',
    gray400: 'FF9CA3AF',
    gray500: 'FF6B7280',
    gray700: 'FF374151',
    gray800: 'FF1F2937',
    gray900: 'FF111827',
  };

  // Métodos auxiliares para Excel y PDF con estructura profesional
  private static agregarEncabezadoExcel(worksheet: ExcelJS.Worksheet, vale: any, config: ValeExportConfig) {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 90
    }];

    // Configurar ancho de columnas optimizado
    worksheet.columns = [
      { width: 5 },   // A - Nº
      { width: 24 },  // B - Biológicos
      { width: 10 },  // C - Cantidad
      { width: 2 },   // D - Separador
      { width: 36 },  // E - Jeringas
      { width: 10 },  // F - Cantidad
      { width: 3 },   // G - Separador central
      { width: 5 },   // H - Nº
      { width: 24 },  // I - Biológicos
      { width: 10 },  // J - Cantidad
      { width: 2 },   // K - Separador
      { width: 36 },  // L - Jeringas
      { width: 10 }   // M - Cantidad
    ];

    // ENCABEZADO INSTITUCIONAL PROFESIONAL (SIN EMOJIS)
    // Fondo para encabezado
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 13; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.COLORS.gray50 }
        };
      }
    }

    // Encabezado institucional
    worksheet.mergeCells('A1:M1');
    const headerCell1 = worksheet.getCell('A1');
    headerCell1.value = 'GOBIERNO REGIONAL DE APURÍMAC';
    headerCell1.font = {
      bold: true,
      size: 14,
      color: { argb: this.COLORS.institutional },
      name: 'Calibri'
    };
    headerCell1.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.primaryLight }
    };

    worksheet.mergeCells('A2:M2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS';
    headerCell2.font = {
      bold: true,
      size: 11,
      color: { argb: this.COLORS.primaryDark },
      name: 'Calibri'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray50 }
    };

    worksheet.mergeCells('A3:M3');
    const headerCell3 = worksheet.getCell('A3');
    headerCell3.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRÍO';
    headerCell3.font = {
      bold: true,
      size: 10,
      color: { argb: this.COLORS.primary },
      name: 'Calibri'
    };
    headerCell3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:M4');
    const headerCell4 = worksheet.getCell('A4');
    headerCell4.value = '"Año de la Universalización de la Salud"';
    headerCell4.font = {
      italic: true,
      size: 9,
      color: { argb: this.COLORS.gray500 },
      name: 'Calibri'
    };
    headerCell4.alignment = { horizontal: 'center', vertical: 'middle' };

    // Título principal profesional
    worksheet.mergeCells('A6:M6');
    const titleCell = worksheet.getCell('A6');
    titleCell.value = 'VALE DE ENTREGA DE VACUNAS Y JERINGAS';
    titleCell.font = {
      bold: true,
      size: 14,
      color: { argb: this.COLORS.white },
      name: 'Calibri'
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.primary }
    };

    // Información del vale
    worksheet.mergeCells('A8:F8');
    const infoCell1 = worksheet.getCell('A8');
    infoCell1.value = `Centro de Acopio: ${vale.centroAcopio.nombre}`;
    infoCell1.font = {
      bold: true,
      size: 10,
      color: { argb: this.COLORS.gray800 },
      name: 'Calibri'
    };
    infoCell1.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray100 }
    };

    worksheet.mergeCells('H8:M8');
    const infoCell2 = worksheet.getCell('H8');
    infoCell2.value = `Responsable: ${config.responsableRecojo}`;
    infoCell2.font = {
      bold: true,
      size: 10,
      color: { argb: this.COLORS.gray800 },
      name: 'Calibri'
    };
    infoCell2.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray100 }
    };

    worksheet.mergeCells('A9:F9');
    const infoCell3 = worksheet.getCell('A9');
    infoCell3.value = `Fecha: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    infoCell3.font = {
      bold: false,
      size: 10,
      color: { argb: this.COLORS.gray700 },
      name: 'Calibri'
    };
    infoCell3.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell3.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray100 }
    };

    // Número de vale
    worksheet.mergeCells('H9:M9');
    const infoCell4 = worksheet.getCell('H9');
    infoCell4.value = `N° Vale: ${vale.numero || 'S/N'}`;
    infoCell4.font = {
      bold: true,
      size: 10,
      color: { argb: this.COLORS.primary },
      name: 'Calibri'
    };
    infoCell4.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell4.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray100 }
    };

    // Aplicar bordes sutiles
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 13; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
          left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
          bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
          right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
        };
      }
    }

    // Ajustar altura de filas
    worksheet.getRow(1).height = 24;
    worksheet.getRow(2).height = 18;
    worksheet.getRow(3).height = 16;
    worksheet.getRow(4).height = 14;
    worksheet.getRow(6).height = 26;
    worksheet.getRow(8).height = 20;
    worksheet.getRow(9).height = 20;
  }

  private static agregarDatosExcel(worksheet: ExcelJS.Worksheet, datos: any, _config: ValeExportConfig) {
    let filaActual = 12;

    // SECCIÓN CONSOLIDADO GENERAL - DISEÑO PROFESIONAL
    worksheet.mergeCells(`A${filaActual}:F${filaActual}`);
    const consolidadoHeader = worksheet.getCell(`A${filaActual}`);
    consolidadoHeader.value = 'CONSOLIDADO GENERAL';
    consolidadoHeader.font = {
      bold: true,
      size: 12,
      color: { argb: this.COLORS.white },
      name: 'Calibri'
    };
    consolidadoHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    consolidadoHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.primary }
    };

    // Headers del consolidado
    filaActual++;
    const headerConsolidado = [
      { col: 'A', text: 'N°' },
      { col: 'B', text: 'Biológicos' },
      { col: 'C', text: 'Cant.' },
      { col: 'E', text: 'Jeringas' },
      { col: 'F', text: 'Cant.' }
    ];

    headerConsolidado.forEach(header => {
      const cell = worksheet.getCell(`${header.col}${filaActual}`);
      cell.value = header.text;
      cell.font = {
        bold: true,
        size: 10,
        color: { argb: this.COLORS.white },
        name: 'Calibri'
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.COLORS.primaryDark }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: this.COLORS.primary } },
        left: { style: 'thin', color: { argb: this.COLORS.primary } },
        bottom: { style: 'thin', color: { argb: this.COLORS.primary } },
        right: { style: 'thin', color: { argb: this.COLORS.primary } }
      };
    });

    worksheet.getRow(filaActual - 1).height = 22;
    worksheet.getRow(filaActual).height = 18;

    // Datos del consolidado - SOLO VACUNAS CON CANTIDAD > 0
    filaActual++;
    const consolidadoConDatos = datos.consolidado.filter((item: any) => item.cantidad > 0);
    
    consolidadoConDatos.forEach((item: any, index: number) => {
      const isEvenRow = index % 2 === 0;
      const rowColor = isEvenRow ? this.COLORS.gray50 : this.COLORS.white;

      const cellA = worksheet.getCell(`A${filaActual}`);
      cellA.value = index + 1;
      cellA.font = { size: 9, name: 'Calibri', color: { argb: this.COLORS.gray500 } };
      cellA.alignment = { horizontal: 'center', vertical: 'middle' };

      const cellB = worksheet.getCell(`B${filaActual}`);
      cellB.value = item.biologico;
      cellB.font = { size: 9, name: 'Calibri', bold: true, color: { argb: this.COLORS.gray700 } };
      cellB.alignment = { horizontal: 'left', vertical: 'middle' };

      const cellC = worksheet.getCell(`C${filaActual}`);
      cellC.value = item.cantidad;
      cellC.font = {
        size: 10,
        name: 'Calibri',
        bold: true,
        color: { argb: this.COLORS.success }
      };
      cellC.alignment = { horizontal: 'center', vertical: 'middle' };

      // Jeringas consolidadas
      if (index < datos.jeringasConsolidado.length) {
        const jeringaData = datos.jeringasConsolidado[index];

        const cellE = worksheet.getCell(`E${filaActual}`);
        cellE.value = jeringaData.nombre;
        cellE.font = { size: 9, name: 'Calibri', color: { argb: this.COLORS.gray700 } };
        cellE.alignment = { horizontal: 'left', vertical: 'middle' };

        const cellF = worksheet.getCell(`F${filaActual}`);
        cellF.value = jeringaData.cantidad;
        cellF.font = {
          size: 10,
          name: 'Calibri',
          bold: jeringaData.cantidad > 0,
          color: { argb: jeringaData.cantidad > 0 ? this.COLORS.success : this.COLORS.gray400 }
        };
        cellF.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Aplicar estilos
      ['A', 'B', 'C', 'E', 'F'].forEach(col => {
        const cell = worksheet.getCell(`${col}${filaActual}`);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
          left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
          bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
          right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
        };
      });

      worksheet.getRow(filaActual).height = 16;
      filaActual++;
    });

    // Observaciones para consolidado
    filaActual++;
    worksheet.getCell(`A${filaActual}`).value = 'Observaciones:';
    worksheet.getCell(`A${filaActual}`).font = { bold: true, size: 9, name: 'Calibri', color: { argb: this.COLORS.gray700 } };

    // Agregar establecimientos (2 por fila)
    filaActual += 2;
    const establecimientosPorFila = 2;
    const totalEstablecimientos = datos.establecimientos.length;

    for (let i = 0; i < totalEstablecimientos; i += establecimientosPorFila) {

      // Procesar hasta 2 establecimientos por fila
      for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
        const establecimiento = datos.establecimientos[i + j];
        const colInicio = j === 0 ? 'A' : 'H';
        const colFin = j === 0 ? 'F' : 'M';

        // Header del establecimiento - PROFESIONAL SIN EMOJIS
        const rangoHeader = `${colInicio}${filaActual}:${colFin}${filaActual}`;
        worksheet.mergeCells(rangoHeader);
        const headerCell = worksheet.getCell(`${colInicio}${filaActual}`);
        headerCell.value = establecimiento.nombre.toUpperCase();
        headerCell.font = {
          bold: true,
          size: 10,
          color: { argb: this.COLORS.white },
          name: 'Calibri'
        };
        headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
        headerCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.COLORS.secondary }
        };
        headerCell.border = {
          top: { style: 'thin', color: { argb: this.COLORS.primaryDark } },
          left: { style: 'thin', color: { argb: this.COLORS.primaryDark } },
          bottom: { style: 'thin', color: { argb: this.COLORS.primaryDark } },
          right: { style: 'thin', color: { argb: this.COLORS.primaryDark } }
        };
      }

      filaActual++;
      worksheet.getRow(filaActual - 1).height = 20;

      // Headers de las columnas para ambos establecimientos
      for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
        const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
        if (j === 1) cols.forEach((_, idx) => cols[idx] = String.fromCharCode(72 + idx));

        const headerTexts = ['N°', 'Biológicos', 'Cant.', '', 'Jeringas', 'Cant.'];
        [cols[0], cols[1], cols[2], cols[4], cols[5]].forEach((col, idx) => {
          const cell = worksheet.getCell((col || 'A') + filaActual);
          cell.value = [headerTexts[0], headerTexts[1], headerTexts[2], headerTexts[4], headerTexts[5]][idx];
          cell.font = {
            bold: true,
            size: 9,
            color: { argb: this.COLORS.white },
            name: 'Calibri'
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: this.COLORS.primary }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: this.COLORS.primaryDark } },
            left: { style: 'thin', color: { argb: this.COLORS.primaryDark } },
            bottom: { style: 'thin', color: { argb: this.COLORS.primaryDark } },
            right: { style: 'thin', color: { argb: this.COLORS.primaryDark } }
          };
        });
      }

      filaActual++;
      worksheet.getRow(filaActual - 1).height = 16;

      // DATOS DINÁMICOS - Solo filas con datos reales
      const maxVacunas = Math.max(
        ...datos.establecimientos.slice(i, i + establecimientosPorFila).map((est: any) => 
          est.vacunas.filter((v: any) => v.cantidad > 0).length
        )
      );
      const maxJeringas = Math.max(
        ...datos.establecimientos.slice(i, i + establecimientosPorFila).map((est: any) => 
          est.jeringas.filter((j: any) => j.cantidad > 0).length
        )
      );
      const filasNecesarias = Math.max(maxVacunas, maxJeringas, 1);

      for (let fila = 0; fila < filasNecesarias; fila++) {
        for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
          const establecimiento = datos.establecimientos[i + j];
          const cols = j === 0 ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['H', 'I', 'J', 'K', 'L', 'M'];

          const isEvenRow = fila % 2 === 0;
          const rowColor = isEvenRow ? this.COLORS.gray50 : this.COLORS.white;

          // Filtrar vacunas con cantidad > 0
          const vacunasConDatos = establecimiento.vacunas.filter((v: any) => v.cantidad > 0);

          if (fila < vacunasConDatos.length) {
            const vacuna = vacunasConDatos[fila];

            const cellNum = worksheet.getCell((cols[0] || 'A') + filaActual);
            cellNum.value = fila + 1;
            cellNum.font = { size: 8, name: 'Calibri', color: { argb: this.COLORS.gray500 } };
            cellNum.alignment = { horizontal: 'center', vertical: 'middle' };

            const cellBio = worksheet.getCell((cols[1] || 'B') + filaActual);
            cellBio.value = vacuna.biologico;
            cellBio.font = {
              size: 8,
              name: 'Calibri',
              color: { argb: this.COLORS.gray700 },
              bold: true
            };
            cellBio.alignment = { horizontal: 'left', vertical: 'middle' };

            const cellCant = worksheet.getCell((cols[2] || 'C') + filaActual);
            cellCant.value = vacuna.cantidad;
            cellCant.font = {
              size: 9,
              name: 'Calibri',
              bold: true,
              color: { argb: this.COLORS.success }
            };
            cellCant.alignment = { horizontal: 'center', vertical: 'middle' };
          }

          // Jeringas con cantidad > 0
          const jeringasConDatos = establecimiento.jeringas.filter((jer: any) => jer.cantidad > 0);
          if (fila < jeringasConDatos.length) {
            const jeringa = jeringasConDatos[fila];

            const cellJer = worksheet.getCell((cols[4] || 'E') + filaActual);
            cellJer.value = jeringa.nombre;
            cellJer.font = { size: 8, name: 'Calibri', color: { argb: this.COLORS.gray700 } };
            cellJer.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

            const cellJerCant = worksheet.getCell((cols[5] || 'F') + filaActual);
            cellJerCant.value = jeringa.cantidad;
            cellJerCant.font = {
              size: 9,
              name: 'Calibri',
              bold: true,
              color: { argb: this.COLORS.success }
            };
            cellJerCant.alignment = { horizontal: 'center', vertical: 'middle' };
          }

          // Aplicar estilos
          [cols[0], cols[1], cols[2], cols[4], cols[5]].forEach(col => {
            const cell = worksheet.getCell((col || 'A') + filaActual);
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: rowColor }
            };
            cell.border = {
              top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
              left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
              bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
              right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
            };
          });

          worksheet.getRow(filaActual).height = 15;
        }
        filaActual++;
      }

      // Observaciones por establecimiento
      for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
        const cols = j === 0 ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['H', 'I', 'J', 'K', 'L', 'M'];
        const cellObs = worksheet.getCell((cols[0] || 'A') + filaActual);
        cellObs.value = 'Obs:';
        cellObs.font = { bold: true, size: 8, name: 'Calibri', color: { argb: this.COLORS.gray500 } };
      }
      filaActual++;

      filaActual += 1; // Espacio entre grupos
    }

    // SECCIÓN DE FIRMAS - PROFESIONAL
    filaActual += 3;

    // Línea separadora
    worksheet.mergeCells(`A${filaActual}:M${filaActual}`);
    const separatorCell = worksheet.getCell(`A${filaActual}`);
    separatorCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray200 }
    };
    worksheet.getRow(filaActual).height = 4;

    filaActual += 2;

    // Responsable de Entrega
    worksheet.mergeCells(`A${filaActual}:F${filaActual}`);
    const firmaEntrega = worksheet.getCell(`A${filaActual}`);
    firmaEntrega.value = 'RESPONSABLE DE ENTREGA';
    firmaEntrega.font = {
      bold: true,
      size: 11,
      color: { argb: this.COLORS.gray800 },
      name: 'Calibri'
    };
    firmaEntrega.alignment = { horizontal: 'center', vertical: 'middle' };
    firmaEntrega.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray100 }
    };
    firmaEntrega.border = {
      top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
    };

    // Responsable de Recepción
    worksheet.mergeCells(`H${filaActual}:M${filaActual}`);
    const firmaRecepcion = worksheet.getCell(`H${filaActual}`);
    firmaRecepcion.value = 'RESPONSABLE DE RECEPCIÓN';
    firmaRecepcion.font = {
      bold: true,
      size: 11,
      color: { argb: this.COLORS.gray800 },
      name: 'Calibri'
    };
    firmaRecepcion.alignment = { horizontal: 'center', vertical: 'middle' };
    firmaRecepcion.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.gray100 }
    };
    firmaRecepcion.border = {
      top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
    };

    worksheet.getRow(filaActual).height = 22;

    // Espacios para firmas
    filaActual += 2;
    worksheet.mergeCells(`A${filaActual}:F${filaActual + 2}`);
    const espacioEntrega = worksheet.getCell(`A${filaActual}`);
    espacioEntrega.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEFEFE' }
    };
    espacioEntrega.border = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
    };

    worksheet.mergeCells(`H${filaActual}:M${filaActual + 2}`);
    const espacioRecepcion = worksheet.getCell(`H${filaActual}`);
    espacioRecepcion.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEFEFE' }
    };
    espacioRecepcion.border = {
      top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
    };

    // Ajustar alturas
    worksheet.getRow(filaActual - 2).height = 25;
    worksheet.getRow(filaActual).height = 20;
    worksheet.getRow(filaActual + 1).height = 20;
    worksheet.getRow(filaActual + 2).height = 20;
  }

  private static aplicarEstilosExcel(worksheet: ExcelJS.Worksheet) {
    // CONFIGURACIÓN FINAL DE LA HOJA PROFESIONAL

    // Configurar márgenes para impresión A4
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      },
      printArea: 'A1:M200',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };

    // Configurar encabezados y pies de página
    worksheet.headerFooter = {
      firstHeader: '&C&"Segoe UI,Bold"&14VALE DE ENTREGA DE VACUNAS Y JERINGAS',
      firstFooter: '&L&"Segoe UI"&10Generado: &D &T&R&"Segoe UI"&10Página &P de &N'
    };

    // Proteger la hoja (opcional)
    // worksheet.protect('password', {
    //   selectLockedCells: false,
    //   selectUnlockedCells: true
    // });

    // Configurar zoom y vista
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85,
      state: 'normal'
    }];
  }

  private static agregarEncabezadoPDF(doc: PDFKit.PDFDocument, vale: any, config: ValeExportConfig) {
    const pageWidth = doc.page.width;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Fondo sutil para el encabezado
    doc.rect(margin - 5, 25, contentWidth + 10, 95)
       .fillAndStroke('#F0FDFA', '#CCFBF1');

    // ENCABEZADO INSTITUCIONAL - Colores teal consistentes
    doc.fontSize(13)
       .fillColor('#115E59')
       .font('Helvetica-Bold')
       .text('GOBIERNO REGIONAL DE APURIMAC', margin, 35, {
         align: 'center',
         width: contentWidth
       });

    doc.fontSize(10)
       .fillColor('#0F766E')
       .font('Helvetica-Bold')
       .text('DIRECCION SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS', margin, 52, {
         align: 'center',
         width: contentWidth
       });

    doc.fontSize(9)
       .fillColor('#0D9488')
       .font('Helvetica-Bold')
       .text('ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRIO', margin, 67, {
         align: 'center',
         width: contentWidth
       });

    doc.fontSize(8)
       .fillColor('#6B7280')
       .font('Helvetica-Oblique')
       .text('"Ano de la Universalizacion de la Salud"', margin, 82, {
         align: 'center',
         width: contentWidth
       });

    // TÍTULO PRINCIPAL - Color teal
    doc.rect(margin - 5, 100, contentWidth + 10, 22)
       .fillAndStroke('#0D9488', '#0F766E');

    doc.fontSize(12)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('VALE DE ENTREGA DE VACUNAS Y JERINGAS', margin, 106, {
         align: 'center',
         width: contentWidth
       });

    // INFORMACIÓN DEL VALE
    const infoY = 130;
    doc.rect(margin - 5, infoY, contentWidth + 10, 42)
       .fillAndStroke('#F9FAFB', '#E5E7EB');

    doc.fontSize(9)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text(`Centro de Acopio: ${this.limpiarTexto(vale.centroAcopio.nombre)}`, margin, infoY + 6);

    doc.font('Helvetica')
       .text(`Responsable: ${this.limpiarTexto(config.responsableRecojo)}`, margin + contentWidth/2, infoY + 6);

    const fechaCorta = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.text(`Fecha: ${this.limpiarTexto(fechaCorta)}`, margin, infoY + 20);
    
    doc.font('Helvetica-Bold')
       .fillColor('#0D9488')
       .text(`N° Vale: ${vale.numero || 'S/N'}`, margin + contentWidth/2, infoY + 20);

    return 180;
  }

  private static agregarDatosPDF(doc: PDFKit.PDFDocument, datos: any, _config: ValeExportConfig) {
    const margin = 40;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 185;

    // Filtrar solo datos con cantidad > 0
    const consolidadoConDatos = datos.consolidado.filter((item: any) => item.cantidad > 0);
    const jeringasConDatos = datos.jeringasConsolidado?.filter((j: any) => j.cantidad > 0) || [];

    // SECCIÓN CONSOLIDADO GENERAL
    doc.rect(margin - 3, currentY - 3, contentWidth + 6, 18)
       .fillAndStroke('#0D9488', '#0F766E');

    doc.fontSize(11)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('CONSOLIDADO GENERAL', margin, currentY, {
         align: 'center',
         width: contentWidth
       });

    currentY += 22;

    // Headers del consolidado - ancho completo
    const colVacunaWidth = contentWidth * 0.55;
    const colJeringaWidth = contentWidth * 0.45;

    doc.rect(margin - 2, currentY - 2, colVacunaWidth, 14)
       .fillAndStroke('#0F766E', '#115E59');
    doc.rect(margin + colVacunaWidth + 4, currentY - 2, colJeringaWidth - 4, 14)
       .fillAndStroke('#0F766E', '#115E59');

    doc.fontSize(8)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('N°', margin + 2, currentY, { width: 20 })
       .text('Biologico', margin + 22, currentY, { width: 100 })
       .text('Cant.', margin + colVacunaWidth - 35, currentY, { width: 30, align: 'right' });

    doc.text('Jeringa', margin + colVacunaWidth + 8, currentY, { width: 120 })
       .text('Cant.', margin + contentWidth - 30, currentY, { width: 28, align: 'right' });

    currentY += 16;

    // Datos del consolidado - DINÁMICO
    const maxFilasConsolidado = Math.max(consolidadoConDatos.length, jeringasConDatos.length);
    
    for (let i = 0; i < maxFilasConsolidado; i++) {
      const isEvenRow = i % 2 === 0;
      const bgColor = isEvenRow ? '#F0FDFA' : '#FFFFFF';

      // Fondo vacunas
      if (i < consolidadoConDatos.length) {
        doc.rect(margin - 2, currentY - 1, colVacunaWidth, 11)
           .fillAndStroke(bgColor, bgColor);
      }
      // Fondo jeringas
      if (i < jeringasConDatos.length) {
        doc.rect(margin + colVacunaWidth + 4, currentY - 1, colJeringaWidth - 4, 11)
           .fillAndStroke(bgColor, bgColor);
      }

      // Datos vacuna
      if (i < consolidadoConDatos.length) {
        const item = consolidadoConDatos[i];
        doc.fontSize(7)
           .fillColor('#6B7280')
           .font('Helvetica')
           .text((i + 1).toString(), margin + 2, currentY, { width: 18 });

        doc.fillColor('#374151')
           .font('Helvetica-Bold')
           .text(this.limpiarTexto(item.biologico), margin + 22, currentY, { width: 100 });

        doc.fillColor('#059669')
           .text(item.cantidad.toString(), margin + colVacunaWidth - 35, currentY, { width: 30, align: 'right' });
      }

      // Datos jeringa
      if (i < jeringasConDatos.length) {
        const jeringa = jeringasConDatos[i];
        doc.fontSize(7)
           .fillColor('#374151')
           .font('Helvetica')
           .text(this.limpiarTexto(jeringa.nombre), margin + colVacunaWidth + 8, currentY, { width: 120 });

        doc.fillColor('#059669')
           .font('Helvetica-Bold')
           .text(jeringa.cantidad.toString(), margin + contentWidth - 30, currentY, { width: 28, align: 'right' });
      }

      currentY += 11;
    }

    // Línea de observaciones
    currentY += 5;
    doc.fontSize(7)
       .fillColor('#6B7280')
       .font('Helvetica')
       .text('Observaciones: _______________________________________________', margin, currentY);

    currentY += 20;

    // ESTABLECIMIENTOS - Layout vertical (uno debajo del otro)
    datos.establecimientos.forEach((establecimiento: any, estIndex: number) => {
      // Filtrar vacunas y jeringas con cantidad > 0
      const vacunasConDatos = establecimiento.vacunas.filter((v: any) => v.cantidad > 0);
      const jeringasEstConDatos = establecimiento.jeringas.filter((j: any) => j.cantidad > 0);
      
      if (vacunasConDatos.length === 0 && jeringasEstConDatos.length === 0) return;

      const filasNecesarias = Math.max(vacunasConDatos.length, jeringasEstConDatos.length);
      const alturaEstablecimiento = 20 + 14 + (filasNecesarias * 10) + 15;

      // Nueva página si no hay espacio
      if (currentY + alturaEstablecimiento > 750) {
        doc.addPage();
        currentY = 40;
      }

      // Header del establecimiento
      doc.rect(margin - 3, currentY - 2, contentWidth + 6, 16)
         .fillAndStroke('#0891B2', '#0E7490');

      doc.fontSize(9)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text(this.limpiarTexto(establecimiento.nombre).toUpperCase(), margin, currentY + 1, {
           width: contentWidth,
           align: 'center'
         });

      currentY += 18;

      // Headers de columnas
      doc.rect(margin - 2, currentY - 1, colVacunaWidth, 12)
         .fillAndStroke('#0D9488', '#0F766E');
      doc.rect(margin + colVacunaWidth + 4, currentY - 1, colJeringaWidth - 4, 12)
         .fillAndStroke('#0D9488', '#0F766E');

      doc.fontSize(7)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('N°', margin + 2, currentY + 1, { width: 15 })
         .text('Biologico', margin + 18, currentY + 1, { width: 90 })
         .text('Cant.', margin + colVacunaWidth - 32, currentY + 1, { width: 28, align: 'right' });

      doc.text('Jeringa', margin + colVacunaWidth + 8, currentY + 1, { width: 110 })
         .text('Cant.', margin + contentWidth - 28, currentY + 1, { width: 26, align: 'right' });

      currentY += 13;

      // Datos del establecimiento
      for (let i = 0; i < filasNecesarias; i++) {
        const isEvenRow = i % 2 === 0;
        const bgColor = isEvenRow ? '#F0FDFA' : '#FFFFFF';

        doc.rect(margin - 2, currentY - 1, colVacunaWidth, 10)
           .fillAndStroke(bgColor, bgColor);
        doc.rect(margin + colVacunaWidth + 4, currentY - 1, colJeringaWidth - 4, 10)
           .fillAndStroke(bgColor, bgColor);

        // Vacuna
        if (i < vacunasConDatos.length) {
          const vacuna = vacunasConDatos[i];
          doc.fontSize(6)
             .fillColor('#6B7280')
             .font('Helvetica')
             .text((i + 1).toString(), margin + 2, currentY, { width: 14 });

          doc.fillColor('#374151')
             .font('Helvetica-Bold')
             .text(this.limpiarTexto(vacuna.biologico), margin + 18, currentY, { width: 90 });

          doc.fillColor('#059669')
             .text(vacuna.cantidad.toString(), margin + colVacunaWidth - 32, currentY, { width: 28, align: 'right' });
        }

        // Jeringa
        if (i < jeringasEstConDatos.length) {
          const jeringa = jeringasEstConDatos[i];
          doc.fontSize(6)
             .fillColor('#374151')
             .font('Helvetica')
             .text(this.limpiarTexto(jeringa.nombre), margin + colVacunaWidth + 8, currentY, { width: 110 });

          doc.fillColor('#059669')
             .font('Helvetica-Bold')
             .text(jeringa.cantidad.toString(), margin + contentWidth - 28, currentY, { width: 26, align: 'right' });
        }

        currentY += 10;
      }

      // Observaciones por establecimiento
      doc.fontSize(6)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text('Obs: _____________________', margin, currentY + 2);

      currentY += 18;
    });

    // SECCIÓN DE FIRMAS
    if (currentY > 680) {
      doc.addPage();
      currentY = 40;
    } else {
      currentY += 25;
    }

    // Línea separadora
    doc.moveTo(margin, currentY)
       .lineTo(margin + contentWidth, currentY)
       .lineWidth(1)
       .strokeColor('#E5E7EB')
       .stroke();

    currentY += 15;

    const firmaWidth = contentWidth / 2 - 15;

    // Responsable de Entrega
    doc.rect(margin, currentY, firmaWidth, 18)
       .fillAndStroke('#F0FDFA', '#CCFBF1');

    doc.fontSize(9)
       .fillColor('#115E59')
       .font('Helvetica-Bold')
       .text('RESPONSABLE DE ENTREGA', margin, currentY + 4, {
         width: firmaWidth,
         align: 'center'
       });

    // Responsable de Recepción
    doc.rect(margin + contentWidth / 2 + 15, currentY, firmaWidth, 18)
       .fillAndStroke('#F0FDFA', '#CCFBF1');

    doc.fontSize(9)
       .fillColor('#115E59')
       .font('Helvetica-Bold')
       .text('RESPONSABLE DE RECEPCION', margin + contentWidth / 2 + 15, currentY + 4, {
         width: firmaWidth,
         align: 'center'
       });

    currentY += 28;

    // Espacios para firmas
    doc.rect(margin + 15, currentY, firmaWidth - 30, 40)
       .stroke('#E5E7EB');

    doc.rect(margin + contentWidth / 2 + 30, currentY, firmaWidth - 30, 40)
       .stroke('#E5E7EB');

    currentY += 45;

    // Líneas de firma
    doc.lineWidth(0.5)
       .strokeColor('#9CA3AF')
       .moveTo(margin + 25, currentY)
       .lineTo(margin + firmaWidth - 5, currentY)
       .stroke();

    doc.moveTo(margin + contentWidth / 2 + 40, currentY)
       .lineTo(margin + contentWidth - 10, currentY)
       .stroke();

    currentY += 8;

    doc.fontSize(7)
       .fillColor('#6B7280')
       .font('Helvetica')
       .text('Firma y Sello', margin, currentY, { width: firmaWidth, align: 'center' })
       .text('Firma y Sello', margin + contentWidth / 2 + 15, currentY, { width: firmaWidth, align: 'center' });
  }
}

export { ValeExportService };
