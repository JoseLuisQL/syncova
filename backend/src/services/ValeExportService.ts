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

  // Métodos auxiliares para Excel y PDF con estructura profesional
  private static agregarEncabezadoExcel(worksheet: ExcelJS.Worksheet, vale: any, config: ValeExportConfig) {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    // Eliminar líneas de cuadrícula para diseño moderno
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];

    // Configurar ancho de columnas optimizado para diseño profesional
    worksheet.columns = [
      { width: 5 },   // A - Nº
      { width: 22 },  // B - Biológicos
      { width: 10 },  // C - Cantidad
      { width: 2 },   // D - Separador
      { width: 38 },  // E - Jeringas (incrementado para nombres completos)
      { width: 10 },  // F - Cantidad
      { width: 3 },   // G - Separador central
      { width: 5 },   // H - Nº
      { width: 22 },  // I - Biológicos
      { width: 10 },  // J - Cantidad
      { width: 2 },   // K - Separador
      { width: 38 },  // L - Jeringas (incrementado para nombres completos)
      { width: 10 }   // M - Cantidad
    ];

    // ENCABEZADO INSTITUCIONAL MODERNO
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 13; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal
    worksheet.mergeCells('A1:M1');
    const headerCell1 = worksheet.getCell('A1');
    headerCell1.value = '🏛️ GOBIERNO REGIONAL DE APURÍMAC';
    headerCell1.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF1E3A8A' },
      name: 'Segoe UI'
    };
    headerCell1.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDBEAFE' }
    };

    worksheet.mergeCells('A2:M2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS';
    headerCell2.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1E40AF' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:M3');
    const headerCell3 = worksheet.getCell('A3');
    headerCell3.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRÍO';
    headerCell3.font = {
      bold: true,
      size: 10,
      color: { argb: 'FF2563EB' },
      name: 'Segoe UI'
    };
    headerCell3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:M4');
    const headerCell4 = worksheet.getCell('A4');
    headerCell4.value = '"Año de la Universalización de la Salud"';
    headerCell4.font = {
      italic: true,
      size: 9,
      color: { argb: 'FF3B82F6' },
      name: 'Segoe UI'
    };
    headerCell4.alignment = { horizontal: 'center', vertical: 'middle' };

    // Título principal con diseño moderno
    worksheet.mergeCells('A6:M6');
    const titleCell = worksheet.getCell('A6');
    titleCell.value = '📋 VALE DE ENTREGA DE VACUNAS Y JERINGAS';
    titleCell.font = {
      bold: true,
      size: 16,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI'
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };

    // Información del vale con diseño moderno
    worksheet.mergeCells('A8:F8');
    const infoCell1 = worksheet.getCell('A8');
    infoCell1.value = `🏢 Centro de Acopio: ${vale.centroAcopio.nombre}`;
    infoCell1.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    infoCell1.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    worksheet.mergeCells('H8:M8');
    const infoCell2 = worksheet.getCell('H8');
    infoCell2.value = `👤 Responsable: ${config.responsableRecojo}`;
    infoCell2.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    infoCell2.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    worksheet.mergeCells('A9:F9');
    const infoCell3 = worksheet.getCell('A9');
    infoCell3.value = `📅 Fecha: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    infoCell3.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    infoCell3.alignment = { horizontal: 'left', vertical: 'middle' };
    infoCell3.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    // Aplicar bordes modernos al encabezado
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 13; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      }
    }

    // Ajustar altura de filas para mejor presentación
    worksheet.getRow(1).height = 25;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(3).height = 18;
    worksheet.getRow(4).height = 16;
    worksheet.getRow(6).height = 30;
    worksheet.getRow(8).height = 22;
    worksheet.getRow(9).height = 22;
  }

  private static agregarDatosExcel(worksheet: ExcelJS.Worksheet, datos: any, _config: ValeExportConfig) {
    let filaActual = 12;

    // SECCIÓN CONSOLIDADO CON DISEÑO MODERNO
    worksheet.mergeCells(`A${filaActual}:F${filaActual}`);
    const consolidadoHeader = worksheet.getCell(`A${filaActual}`);
    consolidadoHeader.value = '📊 CONSOLIDADO GENERAL';
    consolidadoHeader.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI'
    };
    consolidadoHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    consolidadoHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' }
    };

    // Headers del consolidado con diseño profesional
    filaActual++;
    const headerConsolidado = [
      { col: 'A', text: 'Nº', width: 5 },
      { col: 'B', text: '💉 Biológicos', width: 22 },
      { col: 'C', text: 'Cantidad', width: 10 },
      { col: 'E', text: '💊 Jeringas', width: 38 },
      { col: 'F', text: 'Cantidad', width: 10 }
    ];

    headerConsolidado.forEach(header => {
      const cell = worksheet.getCell(`${header.col}${filaActual}`);
      cell.value = header.text;
      cell.font = {
        bold: true,
        size: 11,
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI'
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D9488' }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF065F46' } },
        left: { style: 'thin', color: { argb: 'FF065F46' } },
        bottom: { style: 'medium', color: { argb: 'FF065F46' } },
        right: { style: 'thin', color: { argb: 'FF065F46' } }
      };
    });

    // Ajustar altura de filas del consolidado
    worksheet.getRow(filaActual - 1).height = 25;
    worksheet.getRow(filaActual).height = 20;

    // Datos del consolidado con diseño moderno
    filaActual++;
    datos.consolidado.forEach((item: any, index: number) => {
      const isEvenRow = index % 2 === 0;
      const rowColor = isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF';

      // Datos de vacunas
      const cellA = worksheet.getCell(`A${filaActual}`);
      cellA.value = item.numero;
      cellA.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF374151' } };
      cellA.alignment = { horizontal: 'center', vertical: 'middle' };

      const cellB = worksheet.getCell(`B${filaActual}`);
      cellB.value = item.biologico;
      cellB.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF374151' } };
      cellB.alignment = { horizontal: 'left', vertical: 'middle' };

      const cellC = worksheet.getCell(`C${filaActual}`);
      cellC.value = item.cantidad;
      cellC.font = {
        size: 11,
        name: 'Segoe UI',
        bold: item.cantidad > 0,
        color: { argb: item.cantidad > 0 ? 'FF059669' : 'FF6B7280' }
      };
      cellC.alignment = { horizontal: 'center', vertical: 'middle' };

      // Jeringas consolidadas con cantidades reales
      if (index < datos.jeringasConsolidado.length) {
        const jeringaData = datos.jeringasConsolidado[index];

        const cellE = worksheet.getCell(`E${filaActual}`);
        cellE.value = jeringaData.nombre;
        cellE.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF374151' } };
        cellE.alignment = { horizontal: 'left', vertical: 'middle' };

        const cellF = worksheet.getCell(`F${filaActual}`);
        cellF.value = jeringaData.cantidad;
        cellF.font = {
          size: 11,
          name: 'Segoe UI',
          bold: jeringaData.cantidad > 0,
          color: { argb: jeringaData.cantidad > 0 ? 'FF059669' : 'FF6B7280' }
        };
        cellF.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Aplicar estilos modernos
      ['A', 'B', 'C', 'E', 'F'].forEach(col => {
        const cell = worksheet.getCell(`${col}${filaActual}`);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowColor }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });

      // Destacar filas con cantidades importantes
      if (item.cantidad > 50) {
        ['A', 'B', 'C'].forEach(col => {
          const cell = worksheet.getCell(`${col}${filaActual}`);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFECFDF5' }
          };
        });
      }

      worksheet.getRow(filaActual).height = 18;
      filaActual++;
    });

    // Observaciones para consolidado
    worksheet.getCell(`E${filaActual}`).value = 'Observaciones:';
    worksheet.getCell(`E${filaActual}`).font = { bold: true };

    // Agregar establecimientos (2 por fila)
    filaActual += 3;
    const establecimientosPorFila = 2;
    const totalEstablecimientos = datos.establecimientos.length;

    for (let i = 0; i < totalEstablecimientos; i += establecimientosPorFila) {

      // Procesar hasta 2 establecimientos por fila
      for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
        const establecimiento = datos.establecimientos[i + j];
        const colInicio = j === 0 ? 'A' : 'H'; // Primera columna A, segunda H
        const colFin = j === 0 ? 'F' : 'M';   // Última columna F o M

        // Header del establecimiento con diseño moderno
        const rangoHeader = `${colInicio}${filaActual}:${colFin}${filaActual}`;
        worksheet.mergeCells(rangoHeader);
        const headerCell = worksheet.getCell(`${colInicio}${filaActual}`);
        headerCell.value = `🏥 ${establecimiento.nombre}`;
        headerCell.font = {
          bold: true,
          size: 12,
          color: { argb: 'FFFFFFFF' },
          name: 'Segoe UI'
        };
        headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
        headerCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' }
        };
        headerCell.border = {
          top: { style: 'medium', color: { argb: 'FF1D4ED8' } },
          left: { style: 'medium', color: { argb: 'FF1D4ED8' } },
          bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
          right: { style: 'medium', color: { argb: 'FF1D4ED8' } }
        };
      }

      filaActual++;

      // Headers de las columnas para ambos establecimientos
      for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
        const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
        if (j === 1) cols.forEach((_, idx) => cols[idx] = String.fromCharCode(72 + idx)); // H, I, J, K, L, M

        worksheet.getCell((cols[0] || 'A') + filaActual).value = 'Nº';
        worksheet.getCell((cols[1] || 'B') + filaActual).value = 'Biológicos';
        worksheet.getCell((cols[2] || 'C') + filaActual).value = 'Cantidad';
        worksheet.getCell((cols[4] || 'E') + filaActual).value = 'Jeringas';
        worksheet.getCell((cols[5] || 'F') + filaActual).value = 'Cantidad';

        // Aplicar estilo moderno a headers
        const headerTexts = ['Nº', '💉 Biológicos', 'Cant', '💊 Jeringas', 'Cant'];
        [cols[0], cols[1], cols[2], cols[4], cols[5]].forEach((col, idx) => {
          const cell = worksheet.getCell((col || 'A') + filaActual);
          cell.value = headerTexts[idx];
          cell.font = {
            bold: true,
            size: 10,
            color: { argb: 'FFFFFFFF' },
            name: 'Segoe UI'
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            left: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            bottom: { style: 'thin', color: { argb: 'FF1D4ED8' } },
            right: { style: 'thin', color: { argb: 'FF1D4ED8' } }
          };
        });
      }

      filaActual++;

      // Datos de los establecimientos
      const maxFilas = 20; // 20 vacunas estándar
      for (let fila = 0; fila < maxFilas; fila++) {
        for (let j = 0; j < establecimientosPorFila && (i + j) < totalEstablecimientos; j++) {
          const establecimiento = datos.establecimientos[i + j];
          const cols = j === 0 ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['H', 'I', 'J', 'K', 'L', 'M'];

          // Definir colores de fila fuera del bloque condicional
          const isEvenRow = fila % 2 === 0;
          let rowColor = isEvenRow ? 'FFF8FAFC' : 'FFFFFFFF';

          if (fila < establecimiento.vacunas.length) {
            const vacuna = establecimiento.vacunas[fila];
            const hasQuantity = vacuna.cantidad > 0;

            // Datos de vacunas con diseño moderno
            const cellNum = worksheet.getCell((cols[0] || 'A') + filaActual);
            cellNum.value = vacuna.numero;
            cellNum.font = { size: 9, name: 'Segoe UI', color: { argb: 'FF6B7280' } };
            cellNum.alignment = { horizontal: 'center', vertical: 'middle' };

            const cellBio = worksheet.getCell((cols[1] || 'B') + filaActual);
            cellBio.value = vacuna.biologico;
            cellBio.font = {
              size: 9,
              name: 'Segoe UI',
              color: { argb: 'FF374151' },
              bold: hasQuantity
            };
            cellBio.alignment = { horizontal: 'left', vertical: 'middle' };

            const cellCant = worksheet.getCell((cols[2] || 'C') + filaActual);
            cellCant.value = vacuna.cantidad;
            cellCant.font = {
              size: 10,
              name: 'Segoe UI',
              bold: hasQuantity,
              color: { argb: hasQuantity ? 'FF059669' : 'FF9CA3AF' }
            };
            cellCant.alignment = { horizontal: 'center', vertical: 'middle' };

            // Jeringas con nombres dinámicos completos
            if (fila < establecimiento.jeringas.length) {
              const jeringa = establecimiento.jeringas[fila];
              const cellJer = worksheet.getCell((cols[4] || 'E') + filaActual);
              
              // Usar el nombre real de la jeringa, no el estático
              cellJer.value = jeringa.nombre || `Jeringa ${fila + 1}`;
              cellJer.font = { size: 9, name: 'Segoe UI', color: { argb: 'FF374151' } };
              cellJer.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

              const jeringaCant = jeringa ? jeringa.cantidad : 0;
              const cellJerCant = worksheet.getCell((cols[5] || 'F') + filaActual);
              cellJerCant.value = jeringaCant;
              cellJerCant.font = {
                size: 10,
                name: 'Segoe UI',
                bold: jeringaCant > 0,
                color: { argb: jeringaCant > 0 ? 'FF059669' : 'FF9CA3AF' }
              };
              cellJerCant.alignment = { horizontal: 'center', vertical: 'middle' };
            }

            // Observaciones en la fila 9 (índice 8) con diseño especial
            if (fila === 8) {
              const cellObs = worksheet.getCell((cols[4] || 'E') + filaActual);
              cellObs.value = '📝 Observaciones:';
              cellObs.font = {
                bold: true,
                size: 9,
                name: 'Segoe UI',
                color: { argb: 'FF7C3AED' }
              };
              cellObs.alignment = { horizontal: 'left', vertical: 'middle' };
            }

            // Destacar filas con cantidades importantes
            if (hasQuantity && vacuna.cantidad > 20) {
              rowColor = 'FFECFDF5';
            }
          }

          // Aplicar estilos modernos
          [cols[0], cols[1], cols[2], cols[4], cols[5]].forEach(col => {
            const cell = worksheet.getCell((col || 'A') + filaActual);
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: rowColor }
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
            };
          });

          // Ajustar altura de fila para acomodar nombres largos de jeringas
          worksheet.getRow(filaActual).height = 20;
        }
        filaActual++;
      }

      filaActual += 2; // Espacio entre grupos de establecimientos
    }

    // SECCIÓN DE FIRMAS CON DISEÑO PROFESIONAL
    filaActual += 4;

    // Línea separadora elegante
    worksheet.mergeCells(`A${filaActual}:M${filaActual}`);
    const separatorCell = worksheet.getCell(`A${filaActual}`);
    separatorCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };
    separatorCell.border = {
      top: { style: 'medium', color: { argb: 'FF9CA3AF' } }
    };
    worksheet.getRow(filaActual).height = 8;

    filaActual += 2;

    // Responsable de Entrega
    worksheet.mergeCells(`A${filaActual}:F${filaActual}`);
    const firmaEntrega = worksheet.getCell(`A${filaActual}`);
    firmaEntrega.value = '✍️ RESPONSABLE DE ENTREGA';
    firmaEntrega.font = {
      bold: true,
      size: 13,
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    firmaEntrega.alignment = { horizontal: 'center', vertical: 'middle' };
    firmaEntrega.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    firmaEntrega.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };

    // Responsable de Recepción
    worksheet.mergeCells(`H${filaActual}:M${filaActual}`);
    const firmaRecepcion = worksheet.getCell(`H${filaActual}`);
    firmaRecepcion.value = '📋 RESPONSABLE DE RECEPCIÓN';
    firmaRecepcion.font = {
      bold: true,
      size: 13,
      color: { argb: 'FF1F2937' },
      name: 'Segoe UI'
    };
    firmaRecepcion.alignment = { horizontal: 'center', vertical: 'middle' };
    firmaRecepcion.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    firmaRecepcion.border = {
      top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
    };

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
    // CONFIGURACIÓN PROFESIONAL DE PÁGINA A4
    const pageWidth = doc.page.width;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);

    // Fondo sutil para el encabezado
    doc.rect(margin - 10, 30, contentWidth + 20, 120)
       .fillAndStroke('#F8FAFE', '#E5E7EB');

    // ENCABEZADO INSTITUCIONAL MODERNO (SIN EMOJIS)
    doc.fontSize(14)
       .fillColor('#1E3A8A')
       .font('Helvetica-Bold')
       .text('GOBIERNO REGIONAL DE APURIMAC', margin, 45, {
         align: 'center',
         width: contentWidth
       });

    doc.fontSize(11)
       .fillColor('#1E40AF')
       .font('Helvetica-Bold')
       .text('DIRECCION SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS', margin, 65, {
         align: 'center',
         width: contentWidth
       });

    doc.fontSize(10)
       .fillColor('#2563EB')
       .font('Helvetica-Bold')
       .text('ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRIO', margin, 82, {
         align: 'center',
         width: contentWidth
       });

    doc.fontSize(9)
       .fillColor('#3B82F6')
       .font('Helvetica-Oblique')
       .text('"Ano de la Universalizacion de la Salud"', margin, 98, {
         align: 'center',
         width: contentWidth
       });

    // TÍTULO PRINCIPAL CON DISEÑO MODERNO
    doc.rect(margin - 5, 125, contentWidth + 10, 25)
       .fillAndStroke('#1E40AF', '#1D4ED8');

    doc.fontSize(16)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('VALE DE ENTREGA DE VACUNAS Y JERINGAS', margin, 135, {
         align: 'center',
         width: contentWidth
       });

    // INFORMACIÓN DEL VALE CON DISEÑO PROFESIONAL
    const infoY = 170;

    // Fondo para información
    doc.rect(margin - 5, infoY - 5, contentWidth + 10, 45)
       .fillAndStroke('#F3F4F6', '#D1D5DB');

    doc.fontSize(11)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text(`Centro de Acopio: ${this.limpiarTexto(vale.centroAcopio.nombre)}`, margin, infoY);

    doc.fontSize(11)
       .text(`Responsable de Recojo: ${this.limpiarTexto(config.responsableRecojo)}`, margin, infoY + 15);

    const fechaCompleta = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fontSize(11)
       .text(`Fecha: ${this.limpiarTexto(fechaCompleta)}`, margin, infoY + 30);

    return 230; // Retorna la posición Y donde continuar
  }

  private static agregarDatosPDF(doc: PDFKit.PDFDocument, datos: any, _config: ValeExportConfig) {
    const margin = 30;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 240;

    // SECCIÓN CONSOLIDADO CON DISEÑO MODERNO
    // Header del consolidado
    doc.rect(margin - 5, currentY - 5, contentWidth / 2 + 10, 20)
       .fillAndStroke('#059669', '#047857');

    doc.fontSize(14)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('CONSOLIDADO GENERAL', margin, currentY, {
         align: 'center',
         width: contentWidth / 2
       });

    currentY += 30;

    // Headers del consolidado con diseño profesional
    doc.rect(margin - 2, currentY - 2, contentWidth / 2 + 4, 15)
       .fillAndStroke('#0D9488', '#0F766E');

    doc.fontSize(9)
       .fillColor('white')
       .font('Helvetica-Bold')
       .text('No', margin, currentY, { width: 25 })
       .text('Biologicos', margin + 30, currentY, { width: 120 })
       .text('Cant', margin + 155, currentY, { width: 35 })
       .text('Jeringas', margin + 195, currentY, { width: 140 })
       .text('Cant', margin + 320, currentY, { width: 35 });

    currentY += 20;

    // Datos del consolidado con diseño moderno
    datos.consolidado.forEach((item: any, index: number) => {
      const isEvenRow = index % 2 === 0;
      const hasQuantity = item.cantidad > 0;

      // Fondo alternado para mejor lectura
      if (isEvenRow) {
        doc.rect(margin - 2, currentY - 1, contentWidth / 2 + 4, 12)
           .fillAndStroke('#F9FAFB', '#F9FAFB');
      }

      // Destacar filas con cantidades importantes
      if (hasQuantity && item.cantidad > 50) {
        doc.rect(margin - 2, currentY - 1, contentWidth / 2 + 4, 12)
           .fillAndStroke('#ECFDF5', '#D1FAE5');
      }

      // Datos de vacunas
      doc.fontSize(8)
         .fillColor('#374151')
         .font('Helvetica')
         .text(item.numero.toString(), margin, currentY, { width: 25 })
         .text(this.limpiarTexto(item.biologico), margin + 30, currentY, { width: 120 });

      // Cantidad con color según valor
      doc.fillColor(hasQuantity ? '#059669' : '#6B7280')
         .font(hasQuantity ? 'Helvetica-Bold' : 'Helvetica')
         .text(item.cantidad.toString(), margin + 155, currentY, { width: 35 });

      // Jeringas con nombres dinámicos completos
      if (index < datos.jeringasConsolidado.length) {
        const jeringaData = datos.jeringasConsolidado[index];
        doc.fillColor('#374151')
           .font('Helvetica')
           .text(this.limpiarTexto(jeringaData.nombre), margin + 195, currentY, { width: 140 })
           .fillColor(jeringaData.cantidad > 0 ? '#059669' : '#6B7280')
           .font(jeringaData.cantidad > 0 ? 'Helvetica-Bold' : 'Helvetica')
           .text(jeringaData.cantidad.toString(), margin + 340, currentY, { width: 35 });
      }

      currentY += 12;

      // Observaciones en la posición correcta con diseño especial
      if (index === 8) {
        doc.fontSize(8)
           .fillColor('#7C3AED')
           .font('Helvetica-Bold')
           .text('Observaciones:', margin + 195, currentY - 12, { width: 120 });
      }
    });

    currentY += 30;

    // ESTABLECIMIENTOS CON DISEÑO PROFESIONAL (2 por página)
    const establecimientosPorPagina = 2;
    datos.establecimientos.forEach((establecimiento: any, estIndex: number) => {
      if (estIndex > 0 && estIndex % establecimientosPorPagina === 0) {
        doc.addPage();
        currentY = 50;
      }

      const isSegundaColumna = estIndex % 2 === 1;
      const offsetX = isSegundaColumna ? contentWidth / 2 + 15 : 0;
      const colWidth = contentWidth / 2 - 15;

      if (!isSegundaColumna) {
        currentY += 25;
      } else {
        currentY -= (12 * 20 + 50); // Volver a la altura del primer establecimiento
      }

      // Header del establecimiento con diseño moderno
      doc.rect(margin + offsetX - 3, currentY - 3, colWidth + 6, 18)
         .fillAndStroke('#2563EB', '#1D4ED8');

      doc.fontSize(11)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text(`${this.limpiarTexto(establecimiento.nombre)}`, margin + offsetX, currentY, {
           width: colWidth,
           align: 'center'
         });

      currentY += 22;

      // Headers de columnas con diseño profesional
      doc.rect(margin + offsetX - 2, currentY - 2, colWidth + 4, 12)
         .fillAndStroke('#3B82F6', '#2563EB');

      doc.fontSize(8)
         .fillColor('white')
         .font('Helvetica-Bold')
         .text('No', margin + offsetX, currentY, { width: 18 })
         .text('Biologicos', margin + offsetX + 20, currentY, { width: 85 })
         .text('Cant', margin + offsetX + 108, currentY, { width: 25 })
         .text('Jeringas', margin + offsetX + 138, currentY, { width: 100 })
         .text('Cant', margin + offsetX + 228, currentY, { width: 25 });

      currentY += 16;

      // Datos del establecimiento con diseño moderno
      establecimiento.vacunas.forEach((vacuna: any, vacIndex: number) => {
        const isEvenRow = vacIndex % 2 === 0;
        const hasQuantity = vacuna.cantidad > 0;

        // Fondo alternado para mejor lectura
        if (isEvenRow) {
          doc.rect(margin + offsetX - 2, currentY - 1, colWidth + 4, 10)
             .fillAndStroke('#F8FAFC', '#F8FAFC');
        }

        // Destacar filas con cantidades importantes
        if (hasQuantity && vacuna.cantidad > 20) {
          doc.rect(margin + offsetX - 2, currentY - 1, colWidth + 4, 10)
             .fillAndStroke('#ECFDF5', '#D1FAE5');
        }

        // Datos de vacunas
        doc.fontSize(7)
           .fillColor('#6B7280')
           .font('Helvetica')
           .text(vacuna.numero.toString(), margin + offsetX, currentY, { width: 18 })
           .fillColor('#374151')
           .font(hasQuantity ? 'Helvetica-Bold' : 'Helvetica')
           .text(this.limpiarTexto(vacuna.biologico), margin + offsetX + 20, currentY, { width: 85 });

        // Cantidad con color según valor
        doc.fillColor(hasQuantity ? '#059669' : '#9CA3AF')
           .font(hasQuantity ? 'Helvetica-Bold' : 'Helvetica')
           .text(vacuna.cantidad.toString(), margin + offsetX + 108, currentY, { width: 25 });

        // Jeringas con nombres dinámicos completos
        if (vacIndex < establecimiento.jeringas.length) {
          const jeringa = establecimiento.jeringas[vacIndex];
          const jeringaCant = jeringa ? jeringa.cantidad : 0;
          const jeringaNombre = jeringa ? jeringa.nombre : `Jeringa ${vacIndex + 1}`;

          doc.fillColor('#374151')
             .font('Helvetica')
             .text(this.limpiarTexto(jeringaNombre), margin + offsetX + 138, currentY, { width: 100 })
             .fillColor(jeringaCant > 0 ? '#059669' : '#9CA3AF')
             .font(jeringaCant > 0 ? 'Helvetica-Bold' : 'Helvetica')
             .text(jeringaCant.toString(), margin + offsetX + 243, currentY, { width: 25 });
        }

        // Observaciones con diseño especial
        if (vacIndex === 8) {
          doc.fontSize(7)
             .fillColor('#7C3AED')
             .font('Helvetica-Bold')
             .text('Observaciones:', margin + offsetX + 138, currentY, { width: 85 });
        }

        currentY += 11;
      });

      if (isSegundaColumna) {
        currentY += 20; // Espacio después del segundo establecimiento
      }
    });

    // SECCIÓN DE FIRMAS CON DISEÑO PROFESIONAL
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    } else {
      currentY += 50;
    }

    // Línea separadora elegante
    doc.moveTo(margin, currentY)
       .lineTo(margin + contentWidth, currentY)
       .lineWidth(2)
       .strokeColor('#9CA3AF')
       .stroke();

    currentY += 20;

    // Headers de firmas con diseño moderno
    const firmaWidth = contentWidth / 2 - 10;

    // Responsable de Entrega
    doc.rect(margin, currentY, firmaWidth, 20)
       .fillAndStroke('#F3F4F6', '#D1D5DB');

    doc.fontSize(13)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('RESPONSABLE DE ENTREGA', margin, currentY + 5, {
         width: firmaWidth,
         align: 'center'
       });

    // Responsable de Recepción
    doc.rect(margin + contentWidth / 2 + 10, currentY, firmaWidth, 20)
       .fillAndStroke('#F3F4F6', '#D1D5DB');

    doc.fontSize(13)
       .fillColor('#1F2937')
       .font('Helvetica-Bold')
       .text('RESPONSABLE DE RECEPCION', margin + contentWidth / 2 + 10, currentY + 5, {
         width: firmaWidth,
         align: 'center'
       });

    // Espacios para firmas con bordes elegantes
    currentY += 30;

    // Espacio de firma - Entrega
    doc.rect(margin + 20, currentY, firmaWidth - 40, 50)
       .fillAndStroke('#FEFEFE', '#E5E7EB');

    // Espacio de firma - Recepción
    doc.rect(margin + contentWidth / 2 + 30, currentY, firmaWidth - 40, 50)
       .fillAndStroke('#FEFEFE', '#E5E7EB');

    // Líneas para firmas más elegantes
    currentY += 60;
    doc.lineWidth(1)
       .strokeColor('#6B7280')
       .moveTo(margin + 30, currentY)
       .lineTo(margin + firmaWidth - 10, currentY)
       .stroke();

    doc.moveTo(margin + contentWidth / 2 + 40, currentY)
       .lineTo(margin + contentWidth - 20, currentY)
       .stroke();

    // Texto de firma
    currentY += 10;
    doc.fontSize(8)
       .fillColor('#6B7280')
       .font('Helvetica')
       .text('Firma y Sello', margin, currentY, { width: firmaWidth, align: 'center' })
       .text('Firma y Sello', margin + contentWidth / 2 + 10, currentY, { width: firmaWidth, align: 'center' });
  }
}

export { ValeExportService };
