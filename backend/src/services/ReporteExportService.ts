import ExcelJS from 'exceljs';
import { ServiceResult } from '@/types';
import {
  StockActualItem,
  StockCriticoItem,
  VencimientoItem,
  LoteVencidoItem,
  KardexDetalladoItem
} from './ReporteService';

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
 * Resultado de exportación Excel
 */
export interface ReporteExcelResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Servicio para exportación de reportes a Excel
 * Implementa diseño profesional siguiendo el patrón de ValeExportService
 */
export class ReporteExportService {
  /**
   * Exportar reporte de stock actual a Excel
   */
  static async exportarStockActual(
    data: StockActualItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de stock actual a Excel');

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Stock Actual');

      // Agregar encabezado del reporte
      this.agregarEncabezadoStockActual(worksheet, config);

      // Configurar columnas con encabezados
      this.configurarColumnasStockActual(worksheet, config);

      // Agregar datos
      this.agregarDatosStockActual(worksheet, data, config);

      // Aplicar estilos profesionales
      this.aplicarEstilosExcel(worksheet);

      // Generar nombre de archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Stock_Actual_${fecha}.xlsx`;

      console.log('✅ Reporte de stock actual exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de stock actual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de stock actual'
      };
    }
  }

  /**
   * Exportar reporte de stock crítico a Excel
   */
  static async exportarStockCritico(
    data: StockCriticoItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de stock crítico a Excel');

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      const worksheet = workbook.addWorksheet('Stock Crítico');

      // Agregar encabezado del reporte
      this.agregarEncabezadoStockCritico(worksheet, config);

      // Configurar columnas con encabezados profesionales
      this.configurarColumnasStockCritico(worksheet, config);

      // Agregar datos con formato profesional
      this.agregarDatosStockCritico(worksheet, data, config);

      // Aplicar estilos profesionales
      this.aplicarEstilosExcel(worksheet);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Stock_Critico_${fecha}.xlsx`;

      console.log('✅ Reporte de stock crítico exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de stock crítico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de stock crítico'
      };
    }
  }

  /**
   * Exportar reporte de próximos vencimientos a Excel
   */
  static async exportarProximosVencimientos(
    data: VencimientoItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de próximos vencimientos a Excel');

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      const worksheet = workbook.addWorksheet('Próximos Vencimientos');

      // Configurar columnas específicas para vencimientos
      worksheet.columns = [
        { header: 'Nº', key: 'numero', width: 5 },
        { header: 'Lote', key: 'numeroLote', width: 15 },
        { header: 'Vacuna', key: 'vacunaNombre', width: 25 },
        { header: 'Tipo', key: 'vacunaTipo', width: 20 },
        { header: 'Cantidad', key: 'cantidadActual', width: 10 },
        { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 15 },
        { header: 'Días para Vencer', key: 'diasParaVencer', width: 15 },
        { header: 'Urgencia', key: 'nivelUrgencia', width: 12 },
        { header: 'Establecimientos Afectados', key: 'establecimientosAfectados', width: 30 }
      ];

      // Agregar encabezado específico
      this.agregarEncabezadoVencimientos(worksheet, config);

      // Configurar columnas con encabezados
      this.configurarColumnasVencimientos(worksheet, config);

      // Agregar datos con formato especial para urgencia
      this.agregarDatosVencimientos(worksheet, data, config);

      // Aplicar estilos con colores de urgencia
      this.aplicarEstilosVencimientos(worksheet);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Proximos_Vencimientos_${fecha}.xlsx`;

      console.log('✅ Reporte de próximos vencimientos exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de próximos vencimientos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de próximos vencimientos'
      };
    }
  }

  /**
   * Exportar reporte de lotes vencidos a Excel
   */
  static async exportarLotesVencidos(
    data: LoteVencidoItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de lotes vencidos a Excel');

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      const worksheet = workbook.addWorksheet('Lotes Vencidos');

      // Configurar propiedades de la hoja
      worksheet.properties.defaultRowHeight = 20;
      worksheet.views = [{
        state: 'frozen',
        xSplit: 0,
        ySplit: config.observaciones ? 6 : 5
      }];

      // Agregar encabezado específico
      this.agregarEncabezadoLotesVencidos(worksheet, config);

      // Configurar columnas con encabezados
      this.configurarColumnasLotesVencidos(worksheet, config);

      // Agregar datos con formato especial para criticidad
      this.agregarDatosLotesVencidos(worksheet, data, config);

      // Aplicar estilos con colores de criticidad
      this.aplicarEstilosLotesVencidos(worksheet);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Lotes_Vencidos_${fecha}.xlsx`;

      console.log('✅ Reporte de lotes vencidos exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de lotes vencidos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de lotes vencidos'
      };
    }
  }

  /**
   * Exportar reporte de kardex detallado a Excel
   */
  static async exportarKardexDetallado(
    data: KardexDetalladoItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de kardex detallado a Excel');

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      const worksheet = workbook.addWorksheet('Kardex Detallado');

      // Configurar columnas específicas para kardex
      worksheet.columns = [
        { header: 'Nº', key: 'numero', width: 5 },
        { header: 'Fecha', key: 'fecha', width: 12 },
        { header: 'Tipo', key: 'tipo', width: 8 },
        { header: 'Item', key: 'itemNombre', width: 25 },
        { header: 'Lote', key: 'loteNumero', width: 15 },
        { header: 'Movimiento', key: 'tipoMovimiento', width: 12 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Saldo Anterior', key: 'saldoAnterior', width: 12 },
        { header: 'Saldo Actual', key: 'saldoActual', width: 12 },
        { header: 'Origen', key: 'establecimientoOrigen', width: 20 },
        { header: 'Destino', key: 'establecimientoDestino', width: 20 },
        { header: 'Documento', key: 'documento', width: 15 },
        { header: 'Nº Documento', key: 'numeroDocumento', width: 15 },
        { header: 'Usuario', key: 'usuario', width: 20 },
        { header: 'Observaciones', key: 'observaciones', width: 30 }
      ];

      // Agregar encabezado específico
      this.agregarEncabezadoKardex(worksheet, config);

      // Agregar datos con formato cronológico
      this.agregarDatosKardex(worksheet, data, config);

      // Aplicar estilos profesionales
      this.aplicarEstilosKardex(worksheet);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Reporte_Kardex_Detallado_${fecha}.xlsx`;

      console.log('✅ Reporte de kardex detallado exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de kardex detallado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de kardex detallado'
      };
    }
  }

  /**
   * Métodos auxiliares para encabezados
   */

  /**
   * Agregar encabezado para reporte de stock actual
   */
  private static agregarEncabezadoStockActual(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // Título principal
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📊 REPORTE DE STOCK ACTUAL DE VACUNAS';
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
      fgColor: { argb: 'FF2563EB' }
    };

    // Información del reporte
    worksheet.mergeCells('A2:I2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Generado el: ${new Date().toLocaleDateString('es-PE')} | Responsable: ${config.responsableReporte}`;
    infoCell.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF6B7280' } };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Observaciones si existen
    if (config.observaciones) {
      worksheet.mergeCells('A3:I3');
      const obsCell = worksheet.getCell('A3');
      obsCell.value = `Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 9, name: 'Segoe UI', italic: true, color: { argb: 'FF6B7280' } };
      obsCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    // Espacio
    worksheet.getRow(4).height = 10;
  }

  /**
   * Agregar encabezado para reporte de stock crítico
   */
  private static agregarEncabezadoStockCritico(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '⚠️ REPORTE DE STOCK CRÍTICO';
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
      fgColor: { argb: 'FFDC2626' }
    };

    worksheet.mergeCells('A2:H2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Generado el: ${new Date().toLocaleDateString('es-PE')} | Responsable: ${config.responsableReporte}`;
    infoCell.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF6B7280' } };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (config.observaciones) {
      worksheet.mergeCells('A3:H3');
      const obsCell = worksheet.getCell('A3');
      obsCell.value = `Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 9, name: 'Segoe UI', italic: true, color: { argb: 'FF6B7280' } };
      obsCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    worksheet.getRow(4).height = 10;
  }

  /**
   * Agregar encabezado para reporte de próximos vencimientos
   */
  private static agregarEncabezadoVencimientos(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📅 REPORTE DE PRÓXIMOS VENCIMIENTOS';
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
      fgColor: { argb: 'FFF59E0B' } // Color ámbar para vencimientos
    };

    worksheet.mergeCells('A2:I2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Generado el: ${new Date().toLocaleDateString('es-PE')} | Responsable: ${config.responsableReporte}`;
    infoCell.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF6B7280' } };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (config.observaciones) {
      worksheet.mergeCells('A3:I3');
      const obsCell = worksheet.getCell('A3');
      obsCell.value = `Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 9, name: 'Segoe UI', italic: true, color: { argb: 'FF6B7280' } };
      obsCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    worksheet.getRow(4).height = 10;
  }

  /**
   * Agregar encabezado para reporte de kardex detallado
   */
  private static agregarEncabezadoKardex(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    worksheet.mergeCells('A1:O1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📊 REPORTE DE KARDEX DETALLADO';
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
      fgColor: { argb: 'FF059669' } // Color verde para kardex
    };

    worksheet.mergeCells('A2:O2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Generado el: ${new Date().toLocaleDateString('es-PE')} | Responsable: ${config.responsableReporte}`;
    infoCell.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF6B7280' } };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (config.observaciones) {
      worksheet.mergeCells('A3:O3');
      const obsCell = worksheet.getCell('A3');
      obsCell.value = `Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 9, name: 'Segoe UI', italic: true, color: { argb: 'FF6B7280' } };
      obsCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    worksheet.getRow(4).height = 10;
  }

  /**
   * Configurar columnas para reporte de stock actual
   */
  private static configurarColumnasStockActual(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    const headerRow = config.observaciones ? 5 : 4;

    // Quitar líneas de cuadrícula
    worksheet.views = [{ showGridLines: false }];

    // Configurar anchos de columnas ajustados al contenido
    worksheet.getColumn(1).width = 6;   // Nº
    worksheet.getColumn(2).width = 30;  // Vacuna
    worksheet.getColumn(3).width = 25;  // Tipo
    worksheet.getColumn(4).width = 25;  // Presentación
    worksheet.getColumn(5).width = 15;  // Stock Total
    worksheet.getColumn(6).width = 15;  // Total Lotes
    worksheet.getColumn(7).width = 20;  // Lotes Disponibles
    worksheet.getColumn(8).width = 20;  // Lotes por Vencer
    worksheet.getColumn(9).width = 25;  // Última Actualización

    // Agregar encabezados de columnas
    const headers = ['Nº', 'Vacuna', 'Tipo', 'Presentación', 'Stock Total', 'Total Lotes', 'Lotes Disponibles', 'Lotes por Vencer', 'Última Actualización'];
    const headerRowObj = worksheet.getRow(headerRow);

    // Configurar solo las celdas necesarias (no toda la fila)
    headers.forEach((header, index) => {
      const cell = headerRowObj.getCell(index + 1);
      cell.value = header;
      cell.font = {
        bold: true,
        size: 11,
        name: 'Segoe UI',
        color: { argb: 'FFFFFFFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF374151' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
      };
    });

    headerRowObj.height = 25;

    // Ajustar automáticamente el ancho de las columnas después de agregar los encabezados
    this.ajustarAnchoColumnas(worksheet, headers);
  }

  /**
   * Configurar columnas para reporte de stock crítico
   */
  private static configurarColumnasStockCritico(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    const headerRow = config.observaciones ? 5 : 4;

    // Quitar líneas de cuadrícula
    worksheet.views = [{ showGridLines: false }];

    // Configurar anchos de columnas ajustados al contenido
    worksheet.getColumn(1).width = 6;   // Nº
    worksheet.getColumn(2).width = 30;  // Vacuna
    worksheet.getColumn(3).width = 15;  // Stock Actual
    worksheet.getColumn(4).width = 15;  // Stock Mínimo
    worksheet.getColumn(5).width = 12;  // % Crítico
    worksheet.getColumn(6).width = 15;  // Nivel
    worksheet.getColumn(7).width = 40;  // Acción Recomendada
    worksheet.getColumn(8).width = 18;  // Lotes Disponibles

    // Agregar encabezados de columnas
    const headers = ['Nº', 'Vacuna', 'Stock Actual', 'Stock Mínimo', '% Crítico', 'Nivel', 'Acción Recomendada', 'Lotes Disponibles'];
    const headerRowObj = worksheet.getRow(headerRow);

    // Configurar solo las celdas necesarias (no toda la fila)
    headers.forEach((header, index) => {
      const cell = headerRowObj.getCell(index + 1);
      cell.value = header;
      cell.font = {
        bold: true,
        size: 11,
        name: 'Segoe UI',
        color: { argb: 'FFFFFFFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF374151' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
      };
    });

    headerRowObj.height = 25;

    // Ajustar automáticamente el ancho de las columnas después de agregar los encabezados
    this.ajustarAnchoColumnas(worksheet, headers);
  }

  /**
   * Ajustar automáticamente el ancho de las columnas basándose en el contenido
   */
  private static ajustarAnchoColumnas(worksheet: ExcelJS.Worksheet, headers: string[]): void {
    headers.forEach((header, index) => {
      const columnIndex = index + 1;
      const column = worksheet.getColumn(columnIndex);

      // Calcular el ancho basándose en el texto del encabezado
      const headerLength = header.length;

      // Definir anchos mínimos y máximos
      const minWidth = 8;
      const maxWidth = 35;

      // Calcular ancho basándose en el contenido del encabezado
      let calculatedWidth = Math.max(headerLength + 2, minWidth);

      // Ajustes específicos para ciertos tipos de columnas
      switch (header) {
        case 'Nº':
          calculatedWidth = 6;
          break;
        case 'Vacuna':
          calculatedWidth = 30;
          break;
        case 'Tipo':
          calculatedWidth = 25;
          break;
        case 'Presentación':
          calculatedWidth = 25;
          break;
        case 'Stock Total':
          calculatedWidth = 15;
          break;
        case 'Total Lotes':
          calculatedWidth = 15;
          break;
        case 'Lotes Disponibles':
          calculatedWidth = 20;
          break;
        case 'Lotes por Vencer':
          calculatedWidth = 20;
          break;
        case 'Última Actualización':
          calculatedWidth = 25;
          break;
        default:
          calculatedWidth = Math.min(calculatedWidth, maxWidth);
      }

      column.width = calculatedWidth;
    });
  }

  /**
   * Configurar columnas para reporte de próximos vencimientos
   */
  private static configurarColumnasVencimientos(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    const headerRow = config.observaciones ? 6 : 5;

    // Configurar anchos de columnas optimizados para mejor visualización
    worksheet.getColumn(1).width = 6;   // Nº
    worksheet.getColumn(2).width = 18;  // Lote
    worksheet.getColumn(3).width = 30;  // Vacuna
    worksheet.getColumn(4).width = 25;  // Tipo
    worksheet.getColumn(5).width = 15;  // Cantidad
    worksheet.getColumn(6).width = 20;  // Fecha Vencimiento
    worksheet.getColumn(7).width = 18;  // Días para Vencer
    worksheet.getColumn(8).width = 15;  // Urgencia
    worksheet.getColumn(9).width = 40;  // Establecimientos Afectados

    // Configurar vistas: quitar líneas de cuadrícula y congelar encabezados
    worksheet.views = [{
      showGridLines: false,
      state: 'frozen',
      ySplit: headerRow
    }];

    // Agregar encabezados de columnas
    const headers = ['Nº', 'Lote', 'Vacuna', 'Tipo', 'Cantidad', 'Fecha Vencimiento', 'Días para Vencer', 'Urgencia', 'Establecimientos Afectados'];
    const headerRowObj = worksheet.getRow(headerRow);

    // Configurar solo las celdas necesarias (no toda la fila)
    headers.forEach((header, index) => {
      const cell = headerRowObj.getCell(index + 1);
      cell.value = header;
      cell.font = {
        bold: true,
        size: 11,
        name: 'Segoe UI',
        color: { argb: 'FFFFFFFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF59E0B' } // Color ámbar para vencimientos
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
        right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
      };
    });

    headerRowObj.height = 25;
  }

  /**
   * Métodos auxiliares para agregar datos (implementación básica)
   * Los métodos completos se implementarán en la siguiente iteración
   */
  private static agregarDatosStockActual(worksheet: ExcelJS.Worksheet, data: StockActualItem[], config: ReporteExportConfig): void {
    const startRow = (config.observaciones ? 5 : 4) + 1; // Fila después de los encabezados

    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + index);
      row.values = [
        index + 1,
        item.vacunaNombre,
        item.vacunaTipo,
        item.presentacion,
        item.stockTotal,
        item.totalLotes,
        item.lotesDisponibles,
        item.lotesPorVencer,
        item.ultimaActualizacion.toLocaleDateString('es-PE')
      ];

      // Aplicar estilos a las celdas de datos
      row.eachCell((cell, colNumber) => {
        cell.font = {
          size: 10,
          name: 'Segoe UI'
        };
        cell.alignment = {
          horizontal: colNumber === 2 ? 'left' : 'center', // Vacuna alineada a la izquierda
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Formato especial para números
        if (colNumber >= 5 && colNumber <= 8) {
          cell.numFmt = '#,##0';
        }
      });

      // Alternar colores de fila para mejor legibilidad
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        });
      }

      row.height = 20;
    });
  }

  private static agregarDatosStockCritico(worksheet: ExcelJS.Worksheet, data: StockCriticoItem[], config: ReporteExportConfig): void {
    const startRow = (config.observaciones ? 5 : 4) + 1; // Fila después de los encabezados

    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + index);
      row.values = [
        index + 1,
        item.vacunaNombre,
        item.stockTotal,
        item.stockMinimo,
        `${item.porcentajeCritico}%`,
        item.nivelCriticidad.toUpperCase(),
        item.recomendacionAccion,
        item.lotesDisponibles || 0
      ];

      // Aplicar estilos a las celdas de datos
      row.eachCell((cell, colNumber) => {
        cell.font = {
          size: 10,
          name: 'Segoe UI'
        };
        cell.alignment = {
          horizontal: colNumber === 2 || colNumber === 7 ? 'left' : 'center', // Vacuna y Acción alineadas a la izquierda
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Formato especial para números
        if (colNumber === 3 || colNumber === 4 || colNumber === 8) { // Stock Actual, Stock Mínimo, Lotes Disponibles
          cell.numFmt = '#,##0';
        }

        // Colores especiales para el nivel de criticidad
        if (colNumber === 6) { // Columna Nivel
          const nivel = item.nivelCriticidad.toLowerCase();
          if (nivel === 'agotado') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEF4444' } // Rojo
            };
            cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (nivel === 'critico') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF59E0B' } // Ámbar
            };
            cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (nivel === 'bajo') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFBBF24' } // Amarillo
            };
            cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
          }
        }
      });

      // Alternar colores de fila para mejor legibilidad (excepto la columna de nivel que ya tiene color)
      if (index % 2 === 1) {
        row.eachCell((cell, colNumber) => {
          if (colNumber !== 6) { // No aplicar a la columna de nivel
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' }
            };
          }
        });
      }

      row.height = 22; // Altura ligeramente mayor para mejor legibilidad
    });
  }

  private static agregarDatosVencimientos(worksheet: ExcelJS.Worksheet, data: VencimientoItem[], config: ReporteExportConfig): void {
    const startRow = (config.observaciones ? 6 : 5) + 1; // Fila después de los encabezados

    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + index);

      // Formatear establecimientos afectados
      const establecimientosTexto = item.establecimientosAfectados
        .map(est => `${est.nombre} (${est.cantidadAsignada})`)
        .join(', ');

      // Formatear fecha de vencimiento
      const fechaVencimiento = item.fechaVencimiento.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Determinar color de urgencia
      let urgenciaColor = '#10B981'; // Verde por defecto
      if (item.nivelUrgencia === 'inmediato') {
        urgenciaColor = '#EF4444'; // Rojo
      } else if (item.nivelUrgencia === 'urgente') {
        urgenciaColor = '#F59E0B'; // Ámbar
      } else if (item.nivelUrgencia === 'atencion') {
        urgenciaColor = '#F59E0B'; // Ámbar
      }

      row.values = [
        index + 1,
        item.numeroLote,
        item.vacunaNombre,
        item.vacunaTipo,
        item.cantidadActual,
        fechaVencimiento,
        item.diasParaVencer,
        item.nivelUrgencia.toUpperCase(),
        establecimientosTexto
      ];

      // Aplicar estilos profesionales a las celdas de datos
      row.eachCell((cell, colNumber) => {
        cell.font = {
          size: 10,
          name: 'Segoe UI'
        };

        // Alineación específica por columna
        if (colNumber === 3) { // Vacuna - alineada a la izquierda
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else if (colNumber === 9) { // Establecimientos - alineada a la izquierda
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Formato especial para números
        if (colNumber === 5) { // Cantidad
          cell.numFmt = '#,##0';
        }

        // Color especial para la columna de urgencia
        if (colNumber === 8) { // Urgencia
          cell.font = {
            ...cell.font,
            bold: true,
            color: { argb: urgenciaColor.replace('#', 'FF') }
          };
        }

        // Color especial para días para vencer
        if (colNumber === 7) { // Días para vencer
          if (item.diasParaVencer <= 7) {
            cell.font = {
              ...cell.font,
              bold: true,
              color: { argb: 'FFEF4444' } // Rojo
            };
          } else if (item.diasParaVencer <= 15) {
            cell.font = {
              ...cell.font,
              bold: true,
              color: { argb: 'FFF59E0B' } // Ámbar
            };
          }
        }
      });

      // Alternar colores de fila para mejor legibilidad
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        });
      }

      // Ajustar altura de fila
      row.height = 20;
    });
  }

  private static agregarDatosKardex(worksheet: ExcelJS.Worksheet, data: KardexDetalladoItem[], config: ReporteExportConfig): void {
    const startRow = config.observaciones ? 6 : 5;

    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + index);
      row.values = [
        index + 1,
        item.fecha.toLocaleDateString('es-PE'),
        item.tipo.toUpperCase(),
        item.itemNombre,
        item.loteNumero,
        item.tipoMovimiento.toUpperCase(),
        item.cantidad,
        item.saldoAnterior,
        item.saldoActual,
        item.establecimientoOrigen || '',
        item.establecimientoDestino || '',
        item.documento,
        item.numeroDocumento,
        item.usuario,
        item.observaciones || ''
      ];
    });
  }

  /**
   * Métodos auxiliares para estilos (implementación básica)
   */
  private static aplicarEstilosExcel(worksheet: ExcelJS.Worksheet): void {
    // Los estilos ya se aplican en configurarColumnasStockActual y agregarDatosStockActual
    // Este método se mantiene para compatibilidad pero no hace nada adicional
    // para evitar sobrescribir los estilos ya aplicados
    void worksheet; // Evitar warning de parámetro no usado
  }



  private static aplicarEstilosVencimientos(worksheet: ExcelJS.Worksheet): void {
    this.aplicarEstilosExcel(worksheet);
    // Estilos adicionales para vencimientos se implementarán después
  }

  private static aplicarEstilosKardex(worksheet: ExcelJS.Worksheet): void {
    this.aplicarEstilosExcel(worksheet);
    // Estilos adicionales para kardex se implementarán después
  }

  /**
   * Métodos auxiliares para lotes vencidos
   */
  private static agregarEncabezadoLotesVencidos(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // Título principal
    const titleRow = worksheet.getRow(1);
    titleRow.values = ['REPORTE DE LOTES VENCIDOS'];
    titleRow.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('A1:H1');

    // Información del reporte
    const infoRow = worksheet.getRow(2);
    infoRow.values = [`Generado el: ${new Date().toLocaleDateString('es-PE')} | Responsable: ${config.responsableReporte}`];
    infoRow.font = { size: 10, color: { argb: 'FF6B7280' } };
    infoRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells('A2:H2');

    // Observaciones si existen
    if (config.observaciones) {
      const obsRow = worksheet.getRow(3);
      obsRow.values = [`Observaciones: ${config.observaciones}`];
      obsRow.font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
      obsRow.alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.mergeCells('A3:H3');
    }
  }

  private static configurarColumnasLotesVencidos(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    const headerRow = config.observaciones ? 5 : 4;

    // Configurar columnas
    worksheet.columns = [
      { header: 'Nº', key: 'numero', width: 5 },
      { header: 'Nº Lote', key: 'numeroLote', width: 15 },
      { header: 'Vacuna', key: 'vacunaNombre', width: 25 },
      { header: 'Tipo', key: 'vacunaTipo', width: 15 },
      { header: 'Cantidad', key: 'cantidadActual', width: 10 },
      { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 15 },
      { header: 'Días Vencido', key: 'diasVencido', width: 12 },
      { header: 'Criticidad', key: 'nivelCriticidad', width: 12 }
    ];

    // Aplicar estilos al encabezado
    const headerRowObj = worksheet.getRow(headerRow);
    headerRowObj.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRowObj.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }
    };
    headerRowObj.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRowObj.height = 25;

    // Aplicar bordes al encabezado
    headerRowObj.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF374151' } },
        left: { style: 'thin', color: { argb: 'FF374151' } },
        bottom: { style: 'thin', color: { argb: 'FF374151' } },
        right: { style: 'thin', color: { argb: 'FF374151' } }
      };
    });
  }

  private static agregarDatosLotesVencidos(worksheet: ExcelJS.Worksheet, data: LoteVencidoItem[], config: ReporteExportConfig): void {
    const startRow = (config.observaciones ? 6 : 5) + 1;

    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + index);

      // Formatear fecha de vencimiento
      const fechaVencimiento = item.fechaVencimiento.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      row.values = [
        index + 1,
        item.numeroLote,
        item.vacunaNombre,
        item.vacunaTipo,
        item.cantidadActual,
        fechaVencimiento,
        item.diasVencido,
        item.nivelCriticidad.toUpperCase().replace('_', ' ')
      ];

      // Aplicar estilos profesionales
      row.eachCell((cell, colNumber) => {
        cell.font = { size: 10, name: 'Segoe UI' };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Formato especial para números
        if (colNumber === 5) { // Cantidad
          cell.numFmt = '#,##0';
        }

        // Color especial para la columna de criticidad
        if (colNumber === 8) {
          const nivel = item.nivelCriticidad.toLowerCase();
          if (nivel === 'extremo') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFDC2626' } // Rojo intenso
            };
            cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (nivel === 'muy_critico') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEF4444' } // Rojo
            };
            cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (nivel === 'critico') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF59E0B' } // Ámbar
            };
            cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
          }
        }

        // Color especial para días vencido
        if (colNumber === 7) {
          if (item.diasVencido > 90) {
            cell.font = { ...cell.font, bold: true, color: { argb: 'FFDC2626' } };
          } else if (item.diasVencido > 30) {
            cell.font = { ...cell.font, bold: true, color: { argb: 'FFEF4444' } };
          } else {
            cell.font = { ...cell.font, bold: true, color: { argb: 'FFF59E0B' } };
          }
        }
      });

      // Alternar colores de fila
      if (index % 2 === 1) {
        row.eachCell((cell, colNumber) => {
          if (colNumber !== 8) { // No aplicar a la columna de criticidad
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' }
            };
          }
        });
      }

      row.height = 22;
    });
  }

  private static aplicarEstilosLotesVencidos(worksheet: ExcelJS.Worksheet): void {
    this.aplicarEstilosExcel(worksheet);
    // Los estilos específicos ya se aplican en agregarDatosLotesVencidos
  }
}