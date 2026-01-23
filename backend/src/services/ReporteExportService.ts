import ExcelJS from 'exceljs';
import fs from 'fs';
import { ServiceResult } from '@/types';
import { getLogoPath } from '@/middleware/uploadLogo';
import { ConfiguracionService } from './ConfiguracionService';
import {
  StockActualItem,
  StockCriticoItem,
  VencimientoItem,
  LoteVencidoItem,
  KardexDetalladoItem,
  MovimientoMensualItem,
  ConsumoHistoricoItem,
  EntregaPorEstablecimientoItem,
  EficienciaDistribucionItem,
  MovimientosPorEESSItem,
  StockVacunasEESSItem
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
    institutional: 'FF115E59', // teal-800
    institutionalLight: 'FF14B8A6', // teal-500
    
    // Colores neutros
    white: 'FFFFFFFF',
    gray50: 'FFF9FAFB',
    gray100: 'FFF3F4F6',
    gray200: 'FFE5E7EB',
    gray500: 'FF6B7280',
    gray700: 'FF374151',
    gray800: 'FF1F2937',
  };

  /**
   * Datos dinámicos para el encabezado de exportación
   */
  private static async getHeaderData(): Promise<{ institucionNombre: string; anioNombre: string; logoPath: string | null }> {
    const institucionNombre = await ConfiguracionService.getValue('institucion_nombre', 'DISA APURIMAC II');
    const anioNombre = await ConfiguracionService.getValue('anio_nombre', '');
    const logoPath = getLogoPath();

    return {
      institucionNombre: institucionNombre || 'DISA APURIMAC II',
      anioNombre: anioNombre || '',
      logoPath
    };
  }

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

  // =====================================================
  // MÉTODOS AUXILIARES PARA REPORTES DE MOVIMIENTOS
  // =====================================================

  /**
   * Agregar datos de movimientos mensuales
   */
  private static agregarDatosMovimientosMensuales(
    worksheet: ExcelJS.Worksheet,
    data: MovimientoMensualItem[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Vacuna',
      'Mes',
      'Año',
      'Saldo Anterior',
      'Trans. Ingreso',
      'Salida',
      'Trans. Salida',
      'Entrega',
      'Saldo Final',
      'Consumo Total',
      'Eficiencia (%)',
      'Última Actualización'
    ];

    // SECCIÓN DE DATOS CON DISEÑO MODERNO
    const sectionStartRow = startRow;
    const headerStartRow = startRow + 2;

    // Título de la sección de datos
    worksheet.mergeCells(`A${sectionStartRow}:N${sectionStartRow}`);
    const sectionHeader = worksheet.getCell(`A${sectionStartRow}`);
    sectionHeader.value = '📊 DATOS DE MOVIMIENTOS MENSUALES';
    sectionHeader.font = {
      bold: true,
      size: 14,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI'
    };
    sectionHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    sectionHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' }
    };

    // Agregar encabezados con estilo profesional
    const headerRow = worksheet.getRow(headerStartRow);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI',
        size: 11
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E7D32' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
    });

    // Agregar datos con formato profesional
    data.forEach((item, index) => {
      const row = worksheet.getRow(headerStartRow + 1 + index);
      const values = [
        item.centroAcopioNombre,
        item.establecimientoNombre,
        item.vacunaNombre,
        item.mes,
        item.anio,
        item.saldoAnterior,
        item.transIngreso,
        item.salida,
        item.transSalida,
        item.entrega,
        item.saldoFinal,
        item.consumoTotal,
        item.eficienciaDistribucion,
        item.fechaUltimaActualizacion.toLocaleDateString('es-ES')
      ];

      values.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;

        // Formato de números
        if (typeof value === 'number' && colIndex >= 5 && colIndex <= 12) {
          cell.numFmt = '#,##0';
        }

        // Formato de porcentaje para eficiencia
        if (colIndex === 12) {
          cell.font = { bold: true, color: { argb: 'FF059669' }, name: 'Segoe UI' };
        }

        // Aplicar estilos profesionales
        cell.font = {
          name: 'Segoe UI',
          size: 10,
          color: { argb: 'FF1F2937' }
        };
        cell.alignment = {
          horizontal: colIndex >= 5 && colIndex <= 12 ? 'center' : 'left',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Alternar colores de fila para mejor legibilidad
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
          };
        }
      });

      row.height = 18;
    });

    // Ajustar altura de filas especiales
    worksheet.getRow(sectionStartRow).height = 25;
    worksheet.getRow(headerStartRow).height = 20;
  }

  /**
   * Agregar datos de consumo histórico
   */
  private static agregarDatosConsumoHistorico(
    worksheet: ExcelJS.Worksheet,
    data: ConsumoHistoricoItem[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Vacuna',
      'Período Inicio',
      'Período Fin',
      'Consumo Promedio',
      'Consumo Total',
      'Tendencia',
      'Variabilidad',
      'Proyección Próximo Mes'
    ];

    // Agregar encabezados
    const headerRow = worksheet.getRow(startRow);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '7B1FA2' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + 1 + index);
      const values = [
        item.centroAcopioNombre,
        item.establecimientoNombre,
        item.vacunaNombre,
        item.periodoInicio.toLocaleDateString('es-ES'),
        item.periodoFin.toLocaleDateString('es-ES'),
        item.consumoPromedio,
        item.consumoTotal,
        item.tendencia,
        item.variabilidad,
        item.proyeccionProximoMes || 'N/A'
      ];

      values.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Formato especial para números
        if (typeof value === 'number' && (colIndex === 5 || colIndex === 6 || colIndex === 8)) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }

        // Color para tendencia
        if (colIndex === 7) {
          if (value === 'creciente') {
            cell.font = { color: { argb: '2E7D32' } };
          } else if (value === 'decreciente') {
            cell.font = { color: { argb: 'D32F2F' } };
          }
        }
      });

      row.height = 20;
    });
  }

  // =====================================================
  // MÉTODOS PARA EXPORTAR REPORTES DE MOVIMIENTOS
  // =====================================================

  /**
   * Exportar reporte de movimientos mensuales a Excel
   */
  static async exportarMovimientosMensuales(
    data: MovimientoMensualItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de movimientos mensuales a Excel');

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();

      // Crear worksheet principal
      const worksheet = workbook.addWorksheet('Movimientos Mensuales');

      // Agregar encabezado específico
      this.agregarEncabezadoMovimientosMensuales(worksheet, config);

      // Agregar datos
      this.agregarDatosMovimientosMensuales(worksheet, data, 11);

      // Aplicar estilos
      this.aplicarEstilosExcel(worksheet);

      const filename = `movimientos_mensuales_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ Reporte de movimientos mensuales exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al generar el buffer
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de movimientos mensuales:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de movimientos mensuales'
      };
    }
  }

  /**
   * Exportar reporte de consumo histórico a Excel
   */
  static async exportarConsumoHistorico(
    data: ConsumoHistoricoItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de consumo histórico a Excel');

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();

      // Crear worksheet principal
      const worksheet = workbook.addWorksheet('Consumo Histórico');

      // Agregar encabezado específico
      this.agregarEncabezadoConsumoHistorico(worksheet, config);

      // Agregar datos
      this.agregarDatosConsumoHistorico(worksheet, data, 11);

      // Aplicar estilos
      this.aplicarEstilosExcel(worksheet);

      const filename = `consumo_historico_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ Reporte de consumo histórico exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al generar el buffer
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de consumo histórico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de consumo histórico'
      };
    }
  }

  /**
   * Exportar reporte de entregas por establecimiento a Excel
   */
  static async exportarEntregasPorEstablecimiento(
    data: EntregaPorEstablecimientoItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de entregas por establecimiento a Excel');

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();

      // Crear worksheet principal
      const worksheet = workbook.addWorksheet('Entregas por Establecimiento');

      // Agregar encabezado específico
      this.agregarEncabezadoEntregasPorEstablecimiento(worksheet, config);

      // Agregar datos
      this.agregarDatosEntregasPorEstablecimiento(worksheet, data, 11);

      // Aplicar estilos
      this.aplicarEstilosExcel(worksheet);

      const filename = `entregas_por_establecimiento_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ Reporte de entregas por establecimiento exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al generar el buffer
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de entregas por establecimiento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de entregas por establecimiento'
      };
    }
  }

  /**
   * Exportar reporte de eficiencia de distribución a Excel
   */
  static async exportarEficienciaDistribucion(
    data: EficienciaDistribucionItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de eficiencia de distribución a Excel');

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();

      // Crear worksheet principal
      const worksheet = workbook.addWorksheet('Eficiencia de Distribución');

      // Agregar encabezado específico
      this.agregarEncabezadoEficienciaDistribucion(worksheet, config);

      // Agregar datos
      this.agregarDatosEficienciaDistribucion(worksheet, data, 11);

      // Aplicar estilos
      this.aplicarEstilosExcel(worksheet);

      const filename = `eficiencia_distribucion_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ Reporte de eficiencia de distribución exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al generar el buffer
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de eficiencia de distribución:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de eficiencia de distribución'
      };
    }
  }

  // =====================================================
  // MÉTODOS AUXILIARES ADICIONALES PARA MOVIMIENTOS
  // =====================================================

  /**
   * Agregar datos de entregas por establecimiento
   */
  private static agregarDatosEntregasPorEstablecimiento(
    worksheet: ExcelJS.Worksheet,
    data: EntregaPorEstablecimientoItem[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Total Entregas',
      'Total Vacunas',
      'Fecha Última Entrega',
      'Eficiencia Entrega (%)'
    ];

    // Agregar encabezados
    const headerRow = worksheet.getRow(startRow);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1976D2' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + 1 + index);
      const values = [
        item.centroAcopioNombre,
        item.establecimientoNombre,
        item.totalEntregas,
        item.totalVacunas,
        item.fechaUltimaEntrega.toLocaleDateString('es-ES'),
        item.eficienciaEntrega
      ];

      values.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Formato especial para números
        if (typeof value === 'number' && (colIndex === 2 || colIndex === 3 || colIndex === 5)) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right' };
        }
      });

      row.height = 20;
    });
  }

  /**
   * Agregar datos de eficiencia de distribución
   */
  private static agregarDatosEficienciaDistribucion(
    worksheet: ExcelJS.Worksheet,
    data: EficienciaDistribucionItem[],
    startRow: number
  ): void {
    // Encabezados de columnas
    const headers = [
      'Centro de Acopio',
      'Establecimiento',
      'Tiempo Promedio Entrega (días)',
      'Cumplimiento (%)',
      'Eficiencia Stock (%)',
      'Rotación Inventario',
      'Mejora Mes',
      'Variación (%)',
      'Alertas'
    ];

    // Agregar encabezados
    const headerRow = worksheet.getRow(startRow);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF9800' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    data.forEach((item, index) => {
      const row = worksheet.getRow(startRow + 1 + index);
      const values = [
        item.centroAcopioNombre,
        item.establecimientoNombre,
        item.indicadores.tiempoPromedioEntrega,
        item.indicadores.porcentajeCumplimiento,
        item.indicadores.eficienciaStock,
        item.indicadores.rotacionInventario,
        item.tendencias.mejoraMes ? 'Sí' : 'No',
        item.tendencias.variacionPorcentual,
        item.alertas.join('; ')
      ];

      values.forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Formato especial para números
        if (typeof value === 'number' && colIndex >= 2 && colIndex <= 7) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }

        // Color para mejora
        if (colIndex === 6) {
          if (value === 'Sí') {
            cell.font = { color: { argb: '2E7D32' } };
          } else {
            cell.font = { color: { argb: 'D32F2F' } };
          }
        }
      });

      row.height = 20;
    });
  }

  /**
   * Agregar encabezado para movimientos mensuales
   */
  private static agregarEncabezadoMovimientosMensuales(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    // Eliminar líneas de cuadrícula para diseño moderno
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];

    // Configurar ancho de columnas optimizado para diseño profesional
    worksheet.columns = [
      { width: 25 },  // A - Centro de Acopio
      { width: 25 },  // B - Establecimiento
      { width: 20 },  // C - Vacuna
      { width: 8 },   // D - Mes
      { width: 8 },   // E - Año
      { width: 12 },  // F - Saldo Anterior
      { width: 12 },  // G - Trans. Ingreso
      { width: 10 },  // H - Salida
      { width: 12 },  // I - Trans. Salida
      { width: 10 },  // J - Entrega
      { width: 12 },  // K - Saldo Final
      { width: 12 },  // L - Consumo Total
      { width: 12 },  // M - Eficiencia (%)
      { width: 15 }   // N - Última Actualización
    ];

    // ENCABEZADO INSTITUCIONAL MODERNO
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 14; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal
    worksheet.mergeCells('A1:N1');
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

    worksheet.mergeCells('A2:N2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS';
    headerCell2.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1E40AF' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:N3');
    const headerCell3 = worksheet.getCell('A3');
    headerCell3.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRÍO';
    headerCell3.font = {
      bold: true,
      size: 10,
      color: { argb: 'FF2563EB' },
      name: 'Segoe UI'
    };
    headerCell3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:N4');
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
    worksheet.mergeCells('A6:N6');
    const titleCell = worksheet.getCell('A6');
    titleCell.value = '📊 REPORTE DE MOVIMIENTOS MENSUALES';
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
      fgColor: { argb: 'FF2E7D32' }
    };

    // Información del reporte con diseño moderno
    worksheet.mergeCells('A8:G8');
    const infoCell1 = worksheet.getCell('A8');
    infoCell1.value = `📅 Fecha de Generación: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
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

    worksheet.mergeCells('H8:N8');
    const infoCell2 = worksheet.getCell('H8');
    infoCell2.value = `👤 Responsable: ${config.responsableReporte}`;
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

    if (config.observaciones) {
      worksheet.mergeCells('A9:N9');
      const infoCell3 = worksheet.getCell('A9');
      infoCell3.value = `📝 Observaciones: ${config.observaciones}`;
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
    }

    // Aplicar bordes modernos al encabezado
    const lastRow = config.observaciones ? 9 : 8;
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= 14; col++) {
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
    if (config.observaciones) {
      worksheet.getRow(9).height = 22;
    }
  }

  /**
   * Agregar encabezado para consumo histórico
   */
  private static agregarEncabezadoConsumoHistorico(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    // Eliminar líneas de cuadrícula para diseño moderno
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];

    // Configurar ancho de columnas optimizado para diseño profesional
    worksheet.columns = [
      { width: 25 },  // A - Centro de Acopio
      { width: 25 },  // B - Establecimiento
      { width: 20 },  // C - Vacuna
      { width: 12 },  // D - Consumo Total
      { width: 12 },  // E - Consumo Promedio
      { width: 12 },  // F - Tendencia
      { width: 12 },  // G - Variabilidad
      { width: 15 },  // H - Proyección
      { width: 12 },  // I - Último Mes
      { width: 12 },  // J - Mes Anterior
      { width: 12 },  // K - Variación (%)
      { width: 15 },  // L - Estado
      { width: 20 }   // M - Observaciones
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
    titleCell.value = '📈 REPORTE DE CONSUMO HISTÓRICO';
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
      fgColor: { argb: 'FF7B1FA2' }
    };

    // Información del reporte con diseño moderno
    worksheet.mergeCells('A8:G8');
    const infoCell1 = worksheet.getCell('A8');
    infoCell1.value = `📅 Fecha de Generación: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
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
    infoCell2.value = `👤 Responsable: ${config.responsableReporte}`;
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

    if (config.observaciones) {
      worksheet.mergeCells('A9:M9');
      const infoCell3 = worksheet.getCell('A9');
      infoCell3.value = `📝 Observaciones: ${config.observaciones}`;
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
    }

    // Aplicar bordes modernos al encabezado
    const lastRow = config.observaciones ? 9 : 8;
    for (let row = 1; row <= lastRow; row++) {
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
    if (config.observaciones) {
      worksheet.getRow(9).height = 22;
    }
  }

  /**
   * Agregar encabezado para entregas por establecimiento
   */
  private static agregarEncabezadoEntregasPorEstablecimiento(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    // Eliminar líneas de cuadrícula para diseño moderno
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];

    // Configurar ancho de columnas optimizado para diseño profesional
    worksheet.columns = [
      { width: 25 },  // A - Establecimiento
      { width: 20 },  // B - Centro Acopio
      { width: 12 },  // C - Total Entregas
      { width: 12 },  // D - Total Vacunas
      { width: 15 },  // E - Última Entrega
      { width: 12 },  // F - Eficiencia (%)
      { width: 12 },  // G - Estado
      { width: 15 },  // H - Responsable
      { width: 12 },  // I - Mes Actual
      { width: 12 },  // J - Mes Anterior
      { width: 20 }   // K - Observaciones
    ];

    // ENCABEZADO INSTITUCIONAL MODERNO
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 11; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal
    worksheet.mergeCells('A1:K1');
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

    worksheet.mergeCells('A2:K2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS';
    headerCell2.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1E40AF' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:K3');
    const headerCell3 = worksheet.getCell('A3');
    headerCell3.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRÍO';
    headerCell3.font = {
      bold: true,
      size: 10,
      color: { argb: 'FF2563EB' },
      name: 'Segoe UI'
    };
    headerCell3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:K4');
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
    worksheet.mergeCells('A6:K6');
    const titleCell = worksheet.getCell('A6');
    titleCell.value = '📦 REPORTE DE ENTREGAS POR ESTABLECIMIENTO';
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
      fgColor: { argb: 'FF1976D2' }
    };

    // Información del reporte con diseño moderno
    worksheet.mergeCells('A8:F8');
    const infoCell1 = worksheet.getCell('A8');
    infoCell1.value = `📅 Fecha de Generación: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
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

    worksheet.mergeCells('G8:K8');
    const infoCell2 = worksheet.getCell('G8');
    infoCell2.value = `👤 Responsable: ${config.responsableReporte}`;
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

    if (config.observaciones) {
      worksheet.mergeCells('A9:K9');
      const infoCell3 = worksheet.getCell('A9');
      infoCell3.value = `📝 Observaciones: ${config.observaciones}`;
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
    }

    // Aplicar bordes modernos al encabezado
    const lastRow = config.observaciones ? 9 : 8;
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= 11; col++) {
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
    if (config.observaciones) {
      worksheet.getRow(9).height = 22;
    }
  }

  /**
   * Agregar encabezado para eficiencia de distribución
   */
  private static agregarEncabezadoEficienciaDistribucion(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    // Eliminar líneas de cuadrícula para diseño moderno
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 85
    }];

    // Configurar ancho de columnas optimizado para diseño profesional
    worksheet.columns = [
      { width: 25 },  // A - Establecimiento
      { width: 20 },  // B - Centro Acopio
      { width: 12 },  // C - Eficiencia General (%)
      { width: 12 },  // D - Tiempo Promedio
      { width: 12 },  // E - Entregas Completas
      { width: 12 },  // F - Entregas Parciales
      { width: 12 },  // G - Entregas Tardías
      { width: 15 },  // H - Índice Calidad
      { width: 12 },  // I - Tendencia
      { width: 20 }   // J - Recomendaciones
    ];

    // ENCABEZADO INSTITUCIONAL MODERNO
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal
    worksheet.mergeCells('A1:J1');
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

    worksheet.mergeCells('A2:J2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN SUB REGIONAL DE SALUD CHANKA ANDAHUAYLAS';
    headerCell2.font = {
      bold: true,
      size: 11,
      color: { argb: 'FF1E40AF' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:J3');
    const headerCell3 = worksheet.getCell('A3');
    headerCell3.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRÍO';
    headerCell3.font = {
      bold: true,
      size: 10,
      color: { argb: 'FF2563EB' },
      name: 'Segoe UI'
    };
    headerCell3.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:J4');
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
    worksheet.mergeCells('A6:J6');
    const titleCell = worksheet.getCell('A6');
    titleCell.value = '🎯 REPORTE DE EFICIENCIA DE DISTRIBUCIÓN';
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
      fgColor: { argb: 'FFFF9800' }
    };

    // Información del reporte con diseño moderno
    worksheet.mergeCells('A8:E8');
    const infoCell1 = worksheet.getCell('A8');
    infoCell1.value = `📅 Fecha de Generación: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
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

    worksheet.mergeCells('F8:J8');
    const infoCell2 = worksheet.getCell('F8');
    infoCell2.value = `👤 Responsable: ${config.responsableReporte}`;
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

    if (config.observaciones) {
      worksheet.mergeCells('A9:J9');
      const infoCell3 = worksheet.getCell('A9');
      infoCell3.value = `📝 Observaciones: ${config.observaciones}`;
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
    }

    // Aplicar bordes modernos al encabezado
    const lastRow = config.observaciones ? 9 : 8;
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= 10; col++) {
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
    if (config.observaciones) {
      worksheet.getRow(9).height = 22;
    }
  }

  /**
   * Exportar reporte de movimientos por EESS a Excel
   */
  static async exportarMovimientosPorEESS(
    data: MovimientosPorEESSItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de movimientos por EESS a Excel');

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Movimientos por EESS');

      // Agregar encabezado del reporte
      this.agregarEncabezadoMovimientosPorEESS(worksheet, config);

      // Obtener todas las vacunas únicas para crear las columnas
      const vacunasUnicas = new Set<string>();
      const vacunasInfo = new Map<string, { id: string; nombre: string }>();

      data.forEach(item => {
        Object.values(item.vacunas).forEach(vacuna => {
          vacunasUnicas.add(vacuna.vacunaId);
          vacunasInfo.set(vacuna.vacunaId, {
            id: vacuna.vacunaId,
            nombre: vacuna.vacunaNombre
          });
        });
      });

      const vacunasArray = Array.from(vacunasUnicas).sort((a, b) => {
        const nombreA = vacunasInfo.get(a)?.nombre || '';
        const nombreB = vacunasInfo.get(b)?.nombre || '';
        return nombreA.localeCompare(nombreB);
      });

      // Configurar columnas dinámicamente
      this.configurarColumnasMovimientosPorEESS(worksheet, vacunasArray, vacunasInfo, config);

      // Agregar datos con formato horizontal
      this.agregarDatosMovimientosPorEESS(worksheet, data, vacunasArray, config);

      // Aplicar estilos profesionales
      this.aplicarEstilosMovimientosPorEESS(worksheet, vacunasArray, config);

      // Generar nombre de archivo
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Movimientos_por_EESS_${fecha}.xlsx`;

      console.log('✅ Reporte de movimientos por EESS exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0 // Se calculará al escribir
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de movimientos por EESS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de movimientos por EESS'
      };
    }
  }

  /**
   * Agregar encabezado para reporte de movimientos por EESS
   */
  private static agregarEncabezadoMovimientosPorEESS(worksheet: ExcelJS.Worksheet, config: ReporteExportConfig): void {
    // Título principal
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '📊 REPORTE DE MOVIMIENTOS POR ESTABLECIMIENTOS DE SALUD (EESS)';
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
      fgColor: { argb: 'FF1565C0' }
    };

    // Información del reporte
    worksheet.mergeCells('A2:E2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Generado el: ${new Date().toLocaleDateString('es-PE')} | Responsable: ${config.responsableReporte}`;
    infoCell.font = { size: 10, name: 'Segoe UI', color: { argb: 'FF6B7280' } };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Observaciones si existen
    if (config.observaciones) {
      worksheet.mergeCells('A3:E3');
      const obsCell = worksheet.getCell('A3');
      obsCell.value = `Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 9, name: 'Segoe UI', italic: true, color: { argb: 'FF6B7280' } };
      obsCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    // Espacio
    worksheet.getRow(4).height = 10;
  }

  /**
   * Configurar columnas para reporte de movimientos por EESS
   * Incluye columna de MICRORED para agrupacion profesional
   */
  private static configurarColumnasMovimientosPorEESS(
    worksheet: ExcelJS.Worksheet,
    vacunasArray: string[],
    vacunasInfo: Map<string, { id: string; nombre: string }>,
    config: ReporteExportConfig
  ): void {
    const headerRow1 = config.observaciones ? 6 : 5; // Primera fila de encabezados
    const headerRow2 = headerRow1 + 1; // Segunda fila de encabezados

    // Quitar lineas de cuadricula
    worksheet.views = [{ showGridLines: false }];

    // Configurar columnas base (MICRORED + DISTRITOS)
    worksheet.getColumn(1).width = 30; // MICRORED
    worksheet.getColumn(2).width = 40; // DISTRITOS

    let currentCol = 3;

    // Para cada vacuna, crear 3 columnas (Total Entrega, Total Salidas, Stock)
    vacunasArray.forEach((vacunaId, index) => {
      const vacunaInfo = vacunasInfo.get(vacunaId);
      const vacunaNombre = vacunaInfo?.nombre || `Vacuna ${index + 1}`;

      // Configurar ancho de las 3 columnas para esta vacuna
      worksheet.getColumn(currentCol).width = 14;     // Total Entrega
      worksheet.getColumn(currentCol + 1).width = 14; // Total Salidas
      worksheet.getColumn(currentCol + 2).width = 12; // Stock

      // Primera fila de encabezados: nombre de la vacuna (merge 3 columnas)
      const startCol = currentCol;
      const endCol = currentCol + 2;

      worksheet.mergeCells(headerRow1, startCol, headerRow1, endCol);
      const vacunaHeaderCell = worksheet.getCell(headerRow1, startCol);
      vacunaHeaderCell.value = vacunaNombre;
      vacunaHeaderCell.font = {
        bold: true,
        size: 11,
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI'
      };
      vacunaHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      vacunaHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }
      };

      // Segunda fila de encabezados: columnas especificas
      const subHeaders = ['Entrega', 'Salidas', 'Stock'];
      subHeaders.forEach((subHeader, subIndex) => {
        const cell = worksheet.getCell(headerRow2, currentCol + subIndex);
        cell.value = subHeader;
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
          fgColor: { argb: 'FF2196F3' }
        };
      });

      currentCol += 3;
    });

    // Configurar encabezado de MICRORED
    worksheet.mergeCells(headerRow1, 1, headerRow2, 1);
    const microredHeaderCell = worksheet.getCell(headerRow1, 1);
    microredHeaderCell.value = 'MICRORED';
    microredHeaderCell.font = {
      bold: true,
      size: 11,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI'
    };
    microredHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    microredHeaderCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D47A1' }
    };

    // Configurar encabezado de DISTRITOS
    worksheet.mergeCells(headerRow1, 2, headerRow2, 2);
    const distritosHeaderCell = worksheet.getCell(headerRow1, 2);
    distritosHeaderCell.value = 'DISTRITOS';
    distritosHeaderCell.font = {
      bold: true,
      size: 11,
      color: { argb: 'FFFFFFFF' },
      name: 'Segoe UI'
    };
    distritosHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    distritosHeaderCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D47A1' }
    };

    // Aplicar bordes a todos los encabezados
    for (let row = headerRow1; row <= headerRow2; row++) {
      for (let col = 1; col <= currentCol - 1; col++) {
        const cell = worksheet.getCell(row, col);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          bottom: { style: 'thin', color: { argb: 'FF9CA3AF' } },
          right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
        };
      }
    }

    // Ajustar altura de filas de encabezado
    worksheet.getRow(headerRow1).height = 25;
    worksheet.getRow(headerRow2).height = 20;
  }

  /**
   * Agregar datos para reporte de movimientos por EESS
   * Agrupa los establecimientos por RED -> MICRORED con filas de cabecera y subtotal
   */
  private static agregarDatosMovimientosPorEESS(
    worksheet: ExcelJS.Worksheet,
    data: MovimientosPorEESSItem[],
    vacunasArray: string[],
    config: ReporteExportConfig
  ): void {
    const startRow = (config.observaciones ? 7 : 6) + 1; // Fila despues de los encabezados
    const totalCols = 2 + (vacunasArray.length * 3); // Microred + EESS + (vacunas * 3)

    // Funcion para limpiar nombres de establecimientos (quitar prefijos C.S., P.S., HOSP., etc.)
    const limpiarNombreEstablecimiento = (nombre: string): string => {
      return nombre
        .replace(/^C\.S\.\s*/i, '')
        .replace(/^P\.S\.\s*/i, '')
        .replace(/^HOSP\.\s*/i, '')
        .replace(/^HOSPITAL\s*/i, '')
        .replace(/^CENTRO DE SALUD\s*/i, '')
        .replace(/^PUESTO DE SALUD\s*/i, '')
        .trim();
    };

    // Funcion para verificar si un establecimiento es especial (cabecera) o debe ser excluido
    const esEstablecimientoEspecial = (nombre: string): boolean => {
      const nombreUpper = nombre.toUpperCase().trim();
      return nombreUpper.includes('TOTAL DISA') || 
             nombreUpper.includes('RED JOSE MARIA ARGUEDAS') || 
             nombreUpper.includes('RED SONDOR') || 
             (nombreUpper.includes('ESSALUD') && !nombreUpper.includes('ANDAHUAYLAS')) ||
             nombreUpper.includes('ALMACEN') || 
             nombreUpper.includes('ALMACÉN') ||
             nombreUpper.includes('CHANKA');
    };

    // Ordenar datos: RED -> Microred -> Establecimiento (sin los especiales que se generan aparte)
    const datosOrdenados = [...data]
      .filter(item => !esEstablecimientoEspecial(item.establecimientoNombre))
      .sort((a, b) => {
      // Primero por RED (los sin RED van al final)
      const redA = a.redNombre || 'ZZZZ SIN RED';
      const redB = b.redNombre || 'ZZZZ SIN RED';
      if (redA !== redB) {
        return redA.localeCompare(redB);
      }
      
      // Luego por Microred (los sin microred van intercalados segun posicion)
      const microredA = a.microredNombre || 'ZZZZ NO PERTENECE A NINGUNA MICRORED';
      const microredB = b.microredNombre || 'ZZZZ NO PERTENECE A NINGUNA MICRORED';
      if (microredA !== microredB) {
        return microredA.localeCompare(microredB);
      }
      
      // Finalmente por nombre de establecimiento
      return a.establecimientoNombre.localeCompare(b.establecimientoNombre);
    });

    // Agrupar por RED y luego por Microred
    interface GrupoMicrored {
      microredId: string | null;
      microredNombre: string;
      items: MovimientosPorEESSItem[];
    }
    
    interface GrupoRed {
      redId: string | null;
      redNombre: string;
      microredes: Map<string, GrupoMicrored>;
    }
    
    const gruposPorRed = new Map<string, GrupoRed>();
    
    datosOrdenados.forEach(item => {
      const redId = item.redId || 'sin-red';
      const redNombre = item.redNombre || '';
      const microredId = item.microredId || 'sin-microred';
      const microredNombre = item.microredNombre || 'NO PERTENECE A NINGUNA MICRORED';
      
      if (!gruposPorRed.has(redId)) {
        gruposPorRed.set(redId, {
          redId: item.redId,
          redNombre: redNombre,
          microredes: new Map()
        });
      }
      
      const grupoRed = gruposPorRed.get(redId)!;
      
      if (!grupoRed.microredes.has(microredId)) {
        grupoRed.microredes.set(microredId, {
          microredId: item.microredId,
          microredNombre: microredNombre,
          items: []
        });
      }
      
      grupoRed.microredes.get(microredId)!.items.push(item);
    });

    let microredIndex = 0;

    // Colores para el diseño mejorado
    const colorTotalDisa = 'FF1E3A8A'; // Azul oscuro para TOTAL DISA
    const colorRedHeader = 'FF3B82F6'; // Azul medio para RED headers
    const colorEssalud = 'FF10B981'; // Verde para ESSALUD
    const colorMicroredBg = 'FFDBEAFE'; // Azul muy claro para microred
    const colorAltRow = 'FFF1F5F9'; // Gris muy claro para filas alternas

    // Estructura para trackear filas por RED para las formulas
    interface FilasPorRed {
      redJoseMariaArguedas: number[];
      redSondor: number[];
      essalud: number[];
    }
    const filasPorRed: FilasPorRed = {
      redJoseMariaArguedas: [],
      redSondor: [],
      essalud: []
    };

    // Reservar 4 filas para las filas especiales (TOTAL DISA, RED JOSE MARIA, RED SONDOR, ESSALUD)
    const filasEspecialesStartRow = startRow;
    const filasEspecialesCount = 4;
    let currentRow = startRow + filasEspecialesCount;

    // PRIMERO: Generar los datos de microredes regulares y trackear filas
    let rowIndex = 0;
    for (const [, grupoRed] of gruposPorRed) {
      // Procesar cada microred dentro de esta RED
      for (const [, grupoMicrored] of grupoRed.microredes) {
        // Agregar filas de datos de establecimientos
        grupoMicrored.items.forEach((item) => {
          const row = worksheet.getRow(currentRow);
          const isAltRow = rowIndex % 2 === 1;
          const rowBgColor = isAltRow ? colorAltRow : 'FFFFFFFF';

          // Trackear fila segun la RED
          const redNombreUpper = (item.redNombre || '').toUpperCase().trim();
          const nombreUpper = item.establecimientoNombre.toUpperCase().trim();
          
          if (nombreUpper.includes('ESSALUD') && nombreUpper.includes('ANDAHUAYLAS')) {
            filasPorRed.essalud.push(currentRow);
          } else if (redNombreUpper.includes('JOSE MARIA ARGUEDAS')) {
            filasPorRed.redJoseMariaArguedas.push(currentRow);
          } else if (redNombreUpper.includes('SONDOR')) {
            filasPorRed.redSondor.push(currentRow);
          }

          // Primera columna: Nombre de la Microred
          const microredCell = row.getCell(1);
          microredCell.value = grupoMicrored.microredNombre === 'NO PERTENECE A NINGUNA MICRORED' 
            ? 'SIN MICRORED' 
            : grupoMicrored.microredNombre;
          microredCell.font = {
            size: 9,
            name: 'Calibri',
            bold: true,
            color: { argb: 'FF1E40AF' }
          };
          microredCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          microredCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorMicroredBg }
          };

          // Segunda columna: nombre del establecimiento
          // Si es SIN MICRORED, mostrar nombre completo; si no, limpiar prefijos
          const eessCell = row.getCell(2);
          const esSinMicrored = grupoMicrored.microredNombre === 'NO PERTENECE A NINGUNA MICRORED';
          eessCell.value = esSinMicrored 
            ? item.establecimientoNombre 
            : limpiarNombreEstablecimiento(item.establecimientoNombre);
          eessCell.font = {
            size: 9,
            name: 'Calibri',
            bold: false,
            color: { argb: 'FF374151' }
          };
          eessCell.alignment = { horizontal: 'left', vertical: 'middle' };
          eessCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowBgColor }
          };

          let currentCol = 3;

          // Para cada vacuna, agregar las 3 columnas de datos
          vacunasArray.forEach(vacunaId => {
            const vacunaData = item.vacunas[vacunaId];

            if (vacunaData) {
              // Total Entrega
              const entregaCell = row.getCell(currentCol);
              entregaCell.value = vacunaData.totalEntrega;
              entregaCell.numFmt = '#,##0';
              entregaCell.alignment = { horizontal: 'center', vertical: 'middle' };
              entregaCell.font = { size: 9, name: 'Calibri', color: { argb: 'FF374151' } };
              entregaCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: rowBgColor }
              };

              // Total Salidas
              const salidasCell = row.getCell(currentCol + 1);
              salidasCell.value = vacunaData.totalSalidas;
              salidasCell.numFmt = '#,##0';
              salidasCell.alignment = { horizontal: 'center', vertical: 'middle' };
              salidasCell.font = { size: 9, name: 'Calibri', color: { argb: 'FF374151' } };
              salidasCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: rowBgColor }
              };

              // Stock
              const stockCell = row.getCell(currentCol + 2);
              stockCell.value = vacunaData.stock;
              stockCell.numFmt = '#,##0';
              stockCell.alignment = { horizontal: 'center', vertical: 'middle' };

              // Colorear stock segun nivel
              if (vacunaData.stock <= 0) {
                stockCell.font = { color: { argb: 'FFDC2626' }, bold: true, size: 9, name: 'Calibri' };
                stockCell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFEE2E2' }
                };
              } else if (vacunaData.stock < 50) {
                stockCell.font = { color: { argb: 'FFF59E0B' }, bold: true, size: 9, name: 'Calibri' };
                stockCell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFBEB' }
                };
              } else {
                stockCell.font = { color: { argb: 'FF059669' }, size: 9, name: 'Calibri' };
                stockCell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: rowBgColor }
                };
              }
            } else {
              // Si no hay datos para esta vacuna, poner 0
              for (let i = 0; i < 3; i++) {
                const cell = row.getCell(currentCol + i);
                cell.value = 0;
                cell.numFmt = '#,##0';
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.font = { color: { argb: 'FFD1D5DB' }, size: 9, name: 'Calibri' };
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: rowBgColor }
                };
              }
            }

            currentCol += 3;
          });

          // Aplicar bordes a toda la fila
          for (let col = 1; col <= totalCols; col++) {
            const cell = row.getCell(col);
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
            };
          }

          row.height = 18;
          rowIndex++;
          currentRow++;
        });

        // Agregar fila de subtotal "MICRORED [nombre]" al final de cada grupo
        if (grupoMicrored.microredId && grupoMicrored.microredNombre !== 'NO PERTENECE A NINGUNA MICRORED') {
          const subtotalRow = worksheet.getRow(currentRow);
          
          // Primera columna: "MICRORED [nombre]"
          const subtotalCell = subtotalRow.getCell(1);
          subtotalCell.value = `MICRORED ${grupoMicrored.microredNombre}`;
          subtotalCell.font = {
            size: 9,
            name: 'Calibri',
            bold: true,
            color: { argb: 'FF1E3A8A' }
          };
          subtotalCell.alignment = { horizontal: 'left', vertical: 'middle' };
          subtotalCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' }
          };

          // Segunda columna: vacio
          const emptyCell = subtotalRow.getCell(2);
          emptyCell.value = '';
          emptyCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' }
          };

          // Columnas de vacunas: vacias con el mismo estilo
          for (let col = 3; col <= totalCols; col++) {
            const cell = subtotalRow.getCell(col);
            cell.value = '';
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE2E8F0' }
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
              left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
              bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
              right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
            };
          }

          // Bordes para las primeras 2 columnas
          subtotalCell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };
          emptyCell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };

          subtotalRow.height = 18;
          currentRow++;
        }

        microredIndex++;
      }
    }

    // SEGUNDO: Generar las filas especiales con formulas (TOTAL DISA, RED JOSE MARIA, RED SONDOR, ESSALUD)
    // Funcion auxiliar para crear formula de suma de filas especificas
    const crearFormulaSuma = (filas: number[], columna: number): string => {
      if (filas.length === 0) return '0';
      const colLetter = this.getColumnLetter(columna);
      // Crear formula con referencias individuales: =C12+C15+C18...
      return filas.map(fila => `${colLetter}${fila}`).join('+');
    };

    // Definir las filas especiales
    const filasEspecialesDefinicion = [
      { 
        nombre: 'TOTAL DISA', 
        bgColor: 'FFE0E7FF', 
        fontColor: colorTotalDisa, 
        fontSize: 11,
        // TOTAL DISA = suma de las otras 3 filas especiales (RED JOSE MARIA + RED SONDOR + ESSALUD)
        esTotal: true
      },
      { 
        nombre: 'RED JOSE MARIA ARGUEDAS', 
        bgColor: 'FFDBEAFE', 
        fontColor: colorRedHeader, 
        fontSize: 10,
        filas: filasPorRed.redJoseMariaArguedas
      },
      { 
        nombre: 'RED SONDOR', 
        bgColor: 'FFDBEAFE', 
        fontColor: colorRedHeader, 
        fontSize: 10,
        filas: filasPorRed.redSondor
      },
      { 
        nombre: 'ESSALUD', 
        bgColor: 'FFD1FAE5', 
        fontColor: colorEssalud, 
        fontSize: 10,
        filas: filasPorRed.essalud
      }
    ];

    // Filas especiales empiezan en filasEspecialesStartRow
    const rowTotalDisa = filasEspecialesStartRow;
    const rowRedJoseMaria = filasEspecialesStartRow + 1;
    const rowRedSondor = filasEspecialesStartRow + 2;
    const rowEssalud = filasEspecialesStartRow + 3;

    filasEspecialesDefinicion.forEach((filaEspecial, index) => {
      const filaNum = filasEspecialesStartRow + index;
      const row = worksheet.getRow(filaNum);
      
      // Primera columna: vacia
      const microredCell = row.getCell(1);
      microredCell.value = '';
      microredCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: filaEspecial.bgColor }
      };
      
      // Segunda columna: nombre de la fila especial
      const nombreCell = row.getCell(2);
      nombreCell.value = filaEspecial.nombre;
      nombreCell.font = {
        size: filaEspecial.fontSize,
        name: 'Calibri',
        bold: true,
        color: { argb: filaEspecial.fontColor }
      };
      nombreCell.alignment = { horizontal: 'left', vertical: 'middle' };
      nombreCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: filaEspecial.bgColor }
      };
      
      // Columnas de vacunas con formulas
      let currentCol = 3;
      vacunasArray.forEach(() => {
        // Para cada columna (Entrega, Salidas, Stock) de cada vacuna
        for (let i = 0; i < 3; i++) {
          const cell = row.getCell(currentCol + i);
          
          if (filaEspecial.esTotal) {
            // TOTAL DISA = suma de las otras 3 filas especiales
            const colLetter = this.getColumnLetter(currentCol + i);
            cell.value = { formula: `${colLetter}${rowRedJoseMaria}+${colLetter}${rowRedSondor}+${colLetter}${rowEssalud}` };
          } else if (filaEspecial.filas && filaEspecial.filas.length > 0) {
            // Suma de las filas correspondientes a esta RED
            const formula = crearFormulaSuma(filaEspecial.filas, currentCol + i);
            cell.value = { formula: formula };
          } else {
            cell.value = 0;
          }
          
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { size: 10, name: 'Calibri', bold: true, color: { argb: filaEspecial.fontColor } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: filaEspecial.bgColor }
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };
        }
        
        currentCol += 3;
      });
      
      // Bordes para las primeras 2 columnas
      microredCell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
      nombreCell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
      
      row.height = 20;
    });
  }

  /**
   * Obtener letra de columna para formulas de Excel
   */
  private static getColumnLetter(columnNumber: number): string {
    let letter = '';
    let num = columnNumber;
    while (num > 0) {
      const remainder = (num - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      num = Math.floor((num - 1) / 26);
    }
    return letter;
  }

  /**
   * Aplicar estilos profesionales para reporte de movimientos por EESS
   */
  private static aplicarEstilosMovimientosPorEESS(
    worksheet: ExcelJS.Worksheet,
    vacunasArray: string[],
    config?: ReporteExportConfig
  ): void {
    // Calcular filas de encabezado
    const headerRow1 = config?.observaciones ? 6 : 5;
    const headerRow2 = headerRow1 + 1;
    
    // Calcular total de columnas
    const totalCols = 2 + (vacunasArray.length * 3);

    // Habilitar filtros automaticos en la fila de encabezados
    worksheet.autoFilter = {
      from: { row: headerRow2, column: 1 },
      to: { row: headerRow2, column: totalCols }
    };

    // Congelar paneles para mantener encabezados visibles
    worksheet.views = [{
      state: 'frozen',
      xSplit: 2, // Congelar primeras dos columnas (Centro de Acopio + EESS)
      ySplit: headerRow2  // Congelar hasta la fila de encabezados
    }];
  }

  /**
   * Exportar reporte de stock de vacunas por EESS a Excel
   */
  static async exportarStockVacunasEESS(
    data: StockVacunasEESSItem[],
    config: ReporteExportConfig
  ): Promise<ServiceResult<ReporteExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de stock de vacunas por EESS a Excel');

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      const worksheet = workbook.addWorksheet('Stock por EESS');

      // Obtener datos dinámicos del encabezado
      const headerData = await this.getHeaderData();

      // Agregar encabezado del reporte con logo
      await this.agregarEncabezadoStockVacunasEESS(workbook, worksheet, config, headerData);

      // Obtener todas las vacunas únicas para crear las columnas
      const vacunasUnicas = new Set<string>();
      const vacunasInfo = new Map<string, { id: string; nombre: string }>();

      data.forEach(item => {
        Object.values(item.vacunas).forEach(vacuna => {
          vacunasUnicas.add(vacuna.vacunaId);
          vacunasInfo.set(vacuna.vacunaId, {
            id: vacuna.vacunaId,
            nombre: vacuna.vacunaNombre
          });
        });
      });

      const vacunasArray = Array.from(vacunasUnicas).sort((a, b) => {
        const nombreA = vacunasInfo.get(a)?.nombre || '';
        const nombreB = vacunasInfo.get(b)?.nombre || '';
        return nombreA.localeCompare(nombreB);
      });

      // Configurar columnas dinámicamente
      this.configurarColumnasStockVacunasEESS(worksheet, vacunasArray, vacunasInfo, config);

      // Agregar datos
      this.agregarDatosStockVacunasEESS(worksheet, data, vacunasArray, config);

      // Aplicar estilos profesionales
      this.aplicarEstilosStockVacunasEESS(worksheet, vacunasArray, config);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Stock_Vacunas_EESS_${fecha}.xlsx`;

      console.log('✅ Reporte de stock de vacunas por EESS exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: 0
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de stock de vacunas por EESS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte de stock de vacunas por EESS'
      };
    }
  }

  /**
   * Agregar encabezado para reporte de stock de vacunas por EESS
   * Usa el mismo estilo profesional que ValeExportService
   */
  private static async agregarEncabezadoStockVacunasEESS(
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    config: ReporteExportConfig,
    headerData: { institucionNombre: string; anioNombre: string; logoPath: string | null }
  ): Promise<void> {
    // CONFIGURACIÓN PROFESIONAL DE LA HOJA
    worksheet.views = [{
      showGridLines: false,
      showRowColHeaders: false,
      zoomScale: 90
    }];

    // Configurar alturas de filas del encabezado
    worksheet.getRow(1).height = 22;
    worksheet.getRow(2).height = 18;
    worksheet.getRow(3).height = 16;
    worksheet.getRow(4).height = 5;  // Espaciador pequeño
    worksheet.getRow(5).height = 24;

    // Fondo para encabezado (filas 1-3)
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 20; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: this.COLORS.primaryLight }
        };
      }
    }

    // Verificar si existe logo
    const hasLogo = headerData.logoPath && fs.existsSync(headerData.logoPath);

    if (hasLogo) {
      try {
        const logoBuffer = fs.readFileSync(headerData.logoPath!);
        const logoExtension = headerData.logoPath!.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageId = workbook.addImage({
          buffer: logoBuffer as any,
          extension: logoExtension,
        });

        // Logo en columna A, ocupando las 3 primeras filas
        worksheet.addImage(imageId, {
          tl: { col: 0.99, row: 0.1 },
          ext: { width: 65, height: 65 }
        });

        // Ajustar columna A para el logo
        worksheet.getColumn('A').width = 10;
      } catch (error) {
        console.error('Error al agregar logo al Excel:', error);
      }
    }

    // Columnas para texto: si hay logo empiezan en B, sino en A
    const colInicio = hasLogo ? 'B' : 'A';

    // Nombre de la Institución (dinámico)
    worksheet.mergeCells(`${colInicio}1:T1`);
    const headerCell1 = worksheet.getCell(`${colInicio}1`);
    headerCell1.value = headerData.institucionNombre.toUpperCase();
    headerCell1.font = {
      bold: true,
      size: 13,
      color: { argb: this.COLORS.institutional },
      name: 'Calibri'
    };
    headerCell1.alignment = { horizontal: hasLogo ? 'left' : 'center', vertical: 'middle' };

    // Estrategia Sanitaria (estático)
    worksheet.mergeCells(`${colInicio}2:T2`);
    const headerCell2 = worksheet.getCell(`${colInicio}2`);
    headerCell2.value = 'ESTRATEGIA SANITARIA DE INMUNIZACIONES - CADENA DE FRIO';
    headerCell2.font = {
      bold: true,
      size: 9,
      color: { argb: this.COLORS.primary },
      name: 'Calibri'
    };
    headerCell2.alignment = { horizontal: hasLogo ? 'left' : 'center', vertical: 'middle' };

    // Nombre del Año (dinámico)
    worksheet.mergeCells(`${colInicio}3:T3`);
    const headerCell3 = worksheet.getCell(`${colInicio}3`);
    if (headerData.anioNombre) {
      headerCell3.value = `"${headerData.anioNombre}"`;
      headerCell3.font = {
        italic: true,
        size: 8,
        color: { argb: this.COLORS.gray500 },
        name: 'Calibri'
      };
      headerCell3.alignment = { horizontal: hasLogo ? 'left' : 'center', vertical: 'middle' };
    }

    // Fila 4 vacía como espaciador
    worksheet.mergeCells('A4:T4');

    // Título principal profesional
    worksheet.mergeCells('A5:T5');
    const titleCell = worksheet.getCell('A5');
    titleCell.value = 'REPORTE DE STOCK DE VACUNAS POR EESS';
    titleCell.font = {
      bold: true,
      size: 14,
      color: { argb: this.COLORS.white },
      name: 'Calibri'
    };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.primary }
    };

    // Información del reporte
    worksheet.mergeCells('A7:J7');
    const infoCell1 = worksheet.getCell('A7');
    infoCell1.value = `Fecha de Generación: ${new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
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

    worksheet.mergeCells('K7:T7');
    const infoCell2 = worksheet.getCell('K7');
    infoCell2.value = `Responsable: ${config.responsableReporte}`;
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

    // Observaciones (si existen)
    if (config.observaciones) {
      worksheet.mergeCells('A8:T8');
      const infoCell3 = worksheet.getCell('A8');
      infoCell3.value = `Observaciones: ${config.observaciones}`;
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
    }

    // Aplicar bordes sutiles al encabezado
    const lastRow = config.observaciones ? 8 : 7;
    for (let row = 1; row <= lastRow; row++) {
      for (let col = 1; col <= 20; col++) {
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
    worksheet.getRow(5).height = 26;
    worksheet.getRow(7).height = 20;
    if (config.observaciones) {
      worksheet.getRow(8).height = 20;
    }
  }

  /**
   * Configurar columnas para reporte de stock de vacunas por EESS
   */
  private static configurarColumnasStockVacunasEESS(
    worksheet: ExcelJS.Worksheet,
    vacunasArray: string[],
    vacunasInfo: Map<string, { id: string; nombre: string }>,
    config: ReporteExportConfig
  ): void {
    // El encabezado termina en fila 7 u 8 (si hay observaciones), los datos empiezan despues
    const headerRow = config.observaciones ? 10 : 9;

    worksheet.getColumn(1).width = 30; // Centro de Acopio
    worksheet.getColumn(2).width = 40; // EESS

    let currentCol = 3;

    // Para cada vacuna, crear 1 columna (Stock)
    vacunasArray.forEach((vacunaId) => {
      const vacunaInfo = vacunasInfo.get(vacunaId);
      const vacunaNombre = vacunaInfo?.nombre || 'Vacuna';

      worksheet.getColumn(currentCol).width = 15;

      // Encabezado de vacuna con colores teal
      const vacunaCell = worksheet.getCell(headerRow, currentCol);
      vacunaCell.value = vacunaNombre;
      vacunaCell.font = { bold: true, size: 10, color: { argb: this.COLORS.white }, name: 'Calibri' };
      vacunaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.primaryDark } };
      vacunaCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      vacunaCell.border = {
        top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
        left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
        bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
        right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
      };

      currentCol++;
    });

    // Encabezados fijos con colores teal
    const centroAcopioHeader = worksheet.getCell(headerRow, 1);
    centroAcopioHeader.value = 'Centro de Acopio';
    centroAcopioHeader.font = { bold: true, size: 11, color: { argb: this.COLORS.white }, name: 'Calibri' };
    centroAcopioHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.primary } };
    centroAcopioHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    centroAcopioHeader.border = {
      top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
    };

    const eessHeader = worksheet.getCell(headerRow, 2);
    eessHeader.value = 'Establecimiento de Salud';
    eessHeader.font = { bold: true, size: 11, color: { argb: this.COLORS.white }, name: 'Calibri' };
    eessHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.primary } };
    eessHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    eessHeader.border = {
      top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
      right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
    };

    worksheet.getRow(headerRow).height = 30;
  }

  /**
   * Agregar datos para reporte de stock de vacunas por EESS
   */
  private static agregarDatosStockVacunasEESS(
    worksheet: ExcelJS.Worksheet,
    data: StockVacunasEESSItem[],
    vacunasArray: string[],
    config: ReporteExportConfig
  ): void {
    // El encabezado termina en fila 9 o 10 (si hay observaciones)
    const headerRow = config.observaciones ? 10 : 9;
    const totalCols = 2 + vacunasArray.length;

    // Agrupar por centro de acopio
    const gruposCentro = new Map<string, { nombre: string; items: StockVacunasEESSItem[]; startRow: number; endRow: number }>();

    data.forEach(item => {
      const centroId = item.centroAcopioId || 'SIN_CENTRO';
      if (!gruposCentro.has(centroId)) {
        gruposCentro.set(centroId, {
          nombre: item.centroAcopioNombre,
          items: [],
          startRow: 0,
          endRow: 0
        });
      }
      gruposCentro.get(centroId)!.items.push(item);
    });

    let currentRow = headerRow + 1;
    let centroIndex = 0;

    for (const [, grupo] of gruposCentro) {
      grupo.startRow = currentRow;
      const centroRowCount = grupo.items.length;
      grupo.endRow = currentRow + centroRowCount - 1;

      const isEvenGroup = centroIndex % 2 === 0;
      const groupBgColor = isEvenGroup ? this.COLORS.white : this.COLORS.gray50;

      grupo.items.forEach((item) => {
        const row = worksheet.getRow(currentRow);

        // Centro de Acopio con colores teal
        const centroCell = row.getCell(1);
        centroCell.value = grupo.nombre;
        centroCell.font = { size: 10, name: 'Calibri', bold: true, color: { argb: this.COLORS.institutional } };
        centroCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        centroCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.COLORS.primaryLight } };

        // Establecimiento
        const eessCell = row.getCell(2);
        eessCell.value = item.establecimientoNombre;
        eessCell.font = { size: 10, name: 'Calibri', bold: false };
        eessCell.alignment = { horizontal: 'left', vertical: 'middle' };
        eessCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupBgColor } };

        let currentCol = 3;

        // Para cada vacuna, agregar stock
        vacunasArray.forEach(vacunaId => {
          const vacunaData = item.vacunas[vacunaId];
          const stockCell = row.getCell(currentCol);

          if (vacunaData) {
            stockCell.value = vacunaData.stock;
          } else {
            stockCell.value = 0;
          }

          stockCell.numFmt = '#,##0';
          stockCell.alignment = { horizontal: 'center', vertical: 'middle' };
          stockCell.font = { size: 10, name: 'Calibri' };
          stockCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: groupBgColor } };

          currentCol++;
        });

        // Aplicar bordes
        for (let col = 1; col <= totalCols; col++) {
          const cell = row.getCell(col);
          cell.border = {
            top: { style: 'thin', color: { argb: this.COLORS.gray200 } },
            left: { style: 'thin', color: { argb: this.COLORS.gray200 } },
            bottom: { style: 'thin', color: { argb: this.COLORS.gray200 } },
            right: { style: 'thin', color: { argb: this.COLORS.gray200 } }
          };
        }

        row.height = 20;
        currentRow++;
      });

      // Borde grueso al final de cada grupo
      const lastRowOfGroup = worksheet.getRow(grupo.endRow);
      for (let col = 1; col <= totalCols; col++) {
        const cell = lastRowOfGroup.getCell(col);
        cell.border = {
          ...cell.border,
          bottom: { style: 'medium', color: { argb: this.COLORS.primary } }
        };
      }

      centroIndex++;
    }
  }

  /**
   * Aplicar estilos profesionales para reporte de stock de vacunas por EESS
   */
  private static aplicarEstilosStockVacunasEESS(
    worksheet: ExcelJS.Worksheet,
    vacunasArray: string[],
    config?: ReporteExportConfig
  ): void {
    // El encabezado termina en fila 9 o 10 (si hay observaciones)
    const headerRow = config?.observaciones ? 10 : 9;
    const totalCols = 2 + vacunasArray.length;

    // Habilitar filtros automaticos
    worksheet.autoFilter = {
      from: { row: headerRow, column: 1 },
      to: { row: headerRow, column: totalCols }
    };

    // Congelar paneles
    worksheet.views = [{
      state: 'frozen',
      showGridLines: false,
      xSplit: 2,
      ySplit: headerRow
    }];
  }
}