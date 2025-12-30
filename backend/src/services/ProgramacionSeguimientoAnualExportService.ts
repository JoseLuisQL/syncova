import ExcelJS from 'exceljs';
import { ServiceResult } from '@/types';
import { ProgramacionAnualCenaresService } from './ProgramacionAnualCenaresService';

/**
 * Configuración para exportación de Programación y Seguimiento Anual
 */
export interface ProgramacionSeguimientoAnualExportConfig {
  anio: number;
  responsableReporte: string;
  observaciones?: string;
}

/**
 * Resultado de exportación Excel
 */
export interface ProgramacionSeguimientoAnualExcelResult {
  workbook: ExcelJS.Workbook;
  filename: string;
  size: number;
}

/**
 * Datos para exportación
 */
interface ExportTableItem {
  id: string;
  tipo: 'vacuna' | 'jeringa';
  descripcion: string;
  saldoAnterior: number;
  programacion: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  entregas: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  consumo: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  saldos: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
}

/**
 * Servicio para exportación de Programación y Seguimiento Anual a Excel
 * Implementa diseño profesional siguiendo el patrón de PlanificacionReportesExportService
 */
export class ProgramacionSeguimientoAnualExportService {
  /**
   * Exportar reporte de Programación y Seguimiento Anual
   */
  static async exportarProgramacionSeguimientoAnual(
    config: ProgramacionSeguimientoAnualExportConfig
  ): Promise<ServiceResult<ProgramacionSeguimientoAnualExcelResult>> {
    try {
      console.log('🔄 Exportando reporte de Programación y Seguimiento Anual a Excel:', config);

      // Obtener datos del reporte
      const result = await ProgramacionAnualCenaresService.getDatosTablaCompleta(config.anio);
      if (!result.success || !result.data || !result.data.items || result.data.items.length === 0) {
        return {
          success: false,
          error: 'No se encontraron datos para exportar'
        };
      }

      // Crear workbook con diseño profesional
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Vacunación';
      workbook.created = new Date();
      workbook.company = 'Gobierno Regional de Apurímac';

      // Crear hoja principal
      const worksheet = workbook.addWorksheet('Programación y Seguimiento Anual');

      // Configurar diseño profesional de la hoja
      this.configurarHojaProfesional(worksheet);

      // Agregar encabezado institucional
      this.agregarEncabezadoInstitucional(worksheet, config);

      // Agregar datos de programación y seguimiento
      this.agregarDatosProgramacionSeguimiento(worksheet, result.data.items, 11);

      // Aplicar estilos profesionales
      this.aplicarEstilosProfesionales(worksheet);

      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `Programacion_Seguimiento_Anual_CENARES_${config.anio}_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ Reporte de Programación y Seguimiento Anual exportado exitosamente');

      return {
        success: true,
        data: {
          workbook,
          filename,
          size: buffer.byteLength
        }
      };

    } catch (error) {
      console.error('❌ Error al exportar reporte de Programación y Seguimiento Anual:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar reporte'
      };
    }
  }

  /**
   * Configurar diseño profesional de la hoja
   */
  private static configurarHojaProfesional(worksheet: ExcelJS.Worksheet): void {
    // Configurar propiedades de la hoja
    worksheet.properties.defaultRowHeight = 18;
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 2, // Congelar las primeras 2 columnas (Descripción y Saldo Anterior)
        ySplit: 12, // Congelar hasta la fila de encabezados
        topLeftCell: 'C13',
        activeCell: 'C13'
      }
    ];

    // Configurar anchos de columnas
    const columnWidths = [
      { column: 1, width: 35 }, // Descripción del Ítem
      { column: 2, width: 12 }, // Saldo Anterior
      // Q1 columns
      { column: 3, width: 12 }, // Programado Q1
      { column: 4, width: 15 }, // Entregado Q1
      { column: 5, width: 12 }, // Diferencia Q1
      { column: 6, width: 12 }, // Consumido Q1
      { column: 7, width: 12 }, // Saldo Q1
      // Q2 columns
      { column: 8, width: 12 }, // Programado Q2
      { column: 9, width: 15 }, // Entregado Q2
      { column: 10, width: 12 }, // Diferencia Q2
      { column: 11, width: 12 }, // Consumido Q2
      { column: 12, width: 12 }, // Saldo Q2
      // Q3 columns
      { column: 13, width: 12 }, // Programado Q3
      { column: 14, width: 15 }, // Entregado Q3
      { column: 15, width: 12 }, // Diferencia Q3
      { column: 16, width: 12 }, // Consumido Q3
      { column: 17, width: 12 }, // Saldo Q3
      // Q4 columns
      { column: 18, width: 12 }, // Programado Q4
      { column: 19, width: 15 }, // Entregado Q4
      { column: 20, width: 12 }, // Diferencia Q4
      { column: 21, width: 12 }, // Consumido Q4
      { column: 22, width: 12 }, // Saldo Q4
      // Annual Totals
      { column: 23, width: 15 }, // Total Programado
      { column: 24, width: 15 }, // Total Entregado
      { column: 25, width: 15 }  // Diferencia Total
    ];

    columnWidths.forEach(({ column, width }) => {
      worksheet.getColumn(column).width = width;
    });

    // Configurar propiedades de impresión
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      },
      printTitlesRow: '11:12' // Repetir encabezados en cada página
    };
  }

  /**
   * Agregar encabezado institucional profesional
   */
  private static agregarEncabezadoInstitucional(
    worksheet: ExcelJS.Worksheet,
    config: ProgramacionSeguimientoAnualExportConfig
  ): void {
    // Fondo degradado para toda la sección del encabezado
    for (let row = 1; row <= 8; row++) {
      for (let col = 1; col <= 25; col++) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFE' }
        };
      }
    }

    // Logo y encabezado principal
    worksheet.mergeCells('A1:Y1');
    const headerCell1 = worksheet.getCell('A1');
    headerCell1.value = '🏛️ GOBIERNO REGIONAL DE APURÍMAC';
    headerCell1.font = {
      bold: true,
      size: 16,
      color: { argb: 'FF1E3A8A' },
      name: 'Segoe UI'
    };
    headerCell1.alignment = { horizontal: 'center', vertical: 'middle' };

    // Subtítulo institucional
    worksheet.mergeCells('A2:Y2');
    const headerCell2 = worksheet.getCell('A2');
    headerCell2.value = 'DIRECCIÓN REGIONAL DE SALUD - SIVAC';
    headerCell2.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF374151' },
      name: 'Segoe UI'
    };
    headerCell2.alignment = { horizontal: 'center', vertical: 'middle' };

    // Título del reporte
    worksheet.mergeCells('A3:Y3');
    const titleCell = worksheet.getCell('A3');
    titleCell.value = `PROGRAMACIÓN Y SEGUIMIENTO ANUAL CENARES - ${config.anio}`;
    titleCell.font = {
      bold: true,
      size: 14,
      color: { argb: 'FF059669' },
      name: 'Segoe UI'
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Información del reporte
    worksheet.mergeCells('A5:M5');
    const infoCell1 = worksheet.getCell('A5');
    infoCell1.value = `📅 Año de Programación: ${config.anio}`;
    infoCell1.font = { size: 12, bold: true, color: { argb: 'FF374151' }, name: 'Segoe UI' };

    worksheet.mergeCells('N5:Y5');
    const infoCell2 = worksheet.getCell('N5');
    infoCell2.value = `📊 Reporte: Programación y Seguimiento Anual CENARES`;
    infoCell2.font = { size: 12, bold: true, color: { argb: 'FF374151' }, name: 'Segoe UI' };

    // Información adicional
    worksheet.mergeCells('A6:M6');
    const infoCell3 = worksheet.getCell('A6');
    infoCell3.value = `👤 Responsable: ${config.responsableReporte}`;
    infoCell3.font = { size: 11, color: { argb: 'FF6B7280' }, name: 'Segoe UI' };

    worksheet.mergeCells('N6:Y6');
    const infoCell4 = worksheet.getCell('N6');
    const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    infoCell4.value = `📊 Generado: ${fechaGeneracion}`;
    infoCell4.font = { size: 11, color: { argb: 'FF6B7280' }, name: 'Segoe UI' };

    // Observaciones si existen
    if (config.observaciones) {
      worksheet.mergeCells('A8:Y8');
      const obsCell = worksheet.getCell('A8');
      obsCell.value = `📝 Observaciones: ${config.observaciones}`;
      obsCell.font = { size: 10, italic: true, color: { argb: 'FF6B7280' }, name: 'Segoe UI' };
    }
  }

  /**
   * Agregar datos de programación y seguimiento
   */
  private static agregarDatosProgramacionSeguimiento(
    worksheet: ExcelJS.Worksheet,
    items: ExportTableItem[],
    startRow: number
  ): void {
    // Encabezados principales
    const mainHeaders = [
      'Descripción del Ítem',
      `Saldo ${new Date().getFullYear() - 1}`,
      'I Trimestre', '', '', '', '',
      'II Trimestre', '', '', '', '',
      'III Trimestre', '', '', '', '',
      'IV Trimestre', '', '', '', '',
      'Totales Anuales', '', ''
    ];

    // Agregar encabezados principales
    mainHeaders.forEach((header, index) => {
      if (header) {
        const cell = worksheet.getCell(startRow, index + 1);
        cell.value = header;
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E79' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });

    // Combinar celdas para encabezados principales
    worksheet.mergeCells(`C${startRow}:G${startRow}`); // I Trimestre
    worksheet.mergeCells(`H${startRow}:L${startRow}`); // II Trimestre
    worksheet.mergeCells(`M${startRow}:Q${startRow}`); // III Trimestre
    worksheet.mergeCells(`R${startRow}:V${startRow}`); // IV Trimestre
    worksheet.mergeCells(`W${startRow}:Y${startRow}`); // Totales Anuales

    // Sub-encabezados
    const subHeaders = [
      '', '', // Descripción y Saldo Anterior
      'Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo', // Q1
      'Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo', // Q2
      'Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo', // Q3
      'Programado', 'Entregado (CENARES)', 'Diferencia', 'Consumido', 'Saldo', // Q4
      'Total Prog.', 'Total Entr.', 'Dif. Total' // Totales
    ];

    // Agregar sub-encabezados
    subHeaders.forEach((header, index) => {
      const cell = worksheet.getCell(startRow + 1, index + 1);
      cell.value = header;
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };

      // Colores diferentes para cada trimestre
      let bgColor = '4472C4'; // Default blue
      if (index >= 2 && index <= 6) bgColor = '2E75B6'; // Q1 - Blue
      else if (index >= 7 && index <= 11) bgColor = '70AD47'; // Q2 - Green
      else if (index >= 12 && index <= 16) bgColor = 'FFC000'; // Q3 - Orange
      else if (index >= 17 && index <= 21) bgColor = 'C55A11'; // Q4 - Brown
      else if (index >= 22) bgColor = '7030A0'; // Totals - Purple

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos de los ítems
    let currentRow = startRow + 2;

    // Separar vacunas y jeringas
    const vacunas = items.filter(item => item.tipo === 'vacuna');
    const jeringas = items.filter(item => item.tipo === 'jeringa');

    // Agregar sección de vacunas
    if (vacunas.length > 0) {
      // Título de sección
      worksheet.mergeCells(`A${currentRow}:Y${currentRow}`);
      const vacunasHeaderCell = worksheet.getCell(`A${currentRow}`);
      vacunasHeaderCell.value = '💉 VACUNAS';
      vacunasHeaderCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFF' } };
      vacunasHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } };
      vacunasHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      vacunasHeaderCell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' }
      };
      currentRow++;

      // Agregar datos de vacunas
      vacunas.forEach(item => {
        this.agregarFilaItem(worksheet, item, currentRow);
        currentRow++;
      });
    }

    // Agregar sección de jeringas
    if (jeringas.length > 0) {
      // Título de sección
      worksheet.mergeCells(`A${currentRow}:Y${currentRow}`);
      const jeringasHeaderCell = worksheet.getCell(`A${currentRow}`);
      jeringasHeaderCell.value = '🩹 JERINGAS';
      jeringasHeaderCell.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FFFFFF' } };
      jeringasHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
      jeringasHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
      jeringasHeaderCell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' }
      };
      currentRow++;

      // Agregar datos de jeringas
      jeringas.forEach(item => {
        this.agregarFilaItem(worksheet, item, currentRow);
        currentRow++;
      });
    }
  }

  /**
   * Agregar fila de datos de un ítem
   */
  private static agregarFilaItem(
    worksheet: ExcelJS.Worksheet,
    item: ExportTableItem,
    row: number
  ): void {
    // Calcular totales
    const totalProgramado = item.programacion.q1 + item.programacion.q2 + item.programacion.q3 + item.programacion.q4;
    const totalEntregado = item.entregas.q1 + item.entregas.q2 + item.entregas.q3 + item.entregas.q4;
    const diferenciaTotal = totalProgramado - totalEntregado;

    // Calcular diferencias por trimestre
    const diferencias = {
      q1: item.programacion.q1 - item.entregas.q1,
      q2: item.programacion.q2 - item.entregas.q2,
      q3: item.programacion.q3 - item.entregas.q3,
      q4: item.programacion.q4 - item.entregas.q4
    };

    // Datos de la fila
    const rowData = [
      item.descripcion, // A
      item.saldoAnterior, // B
      // Q1
      item.programacion.q1, // C
      item.entregas.q1, // D
      diferencias.q1, // E
      item.consumo.q1, // F
      item.saldos.q1, // G
      // Q2
      item.programacion.q2, // H
      item.entregas.q2, // I
      diferencias.q2, // J
      item.consumo.q2, // K
      item.saldos.q2, // L
      // Q3
      item.programacion.q3, // M
      item.entregas.q3, // N
      diferencias.q3, // O
      item.consumo.q3, // P
      item.saldos.q3, // Q
      // Q4
      item.programacion.q4, // R
      item.entregas.q4, // S
      diferencias.q4, // T
      item.consumo.q4, // U
      item.saldos.q4, // V
      // Totales
      totalProgramado, // W
      totalEntregado, // X
      diferenciaTotal // Y
    ];

    // Agregar datos a la fila
    rowData.forEach((value, index) => {
      const cell = worksheet.getCell(row, index + 1);
      cell.value = value;

      // Aplicar formato según el tipo de columna
      if (index === 0) {
        // Descripción
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8F9FA' } };
      } else {
        // Números
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '#,##0';

        // Colores condicionales para diferencias
        if ([4, 9, 14, 19, 24].includes(index)) { // Columnas de diferencia
          if (typeof value === 'number') {
            if (value < 0) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEE' } };
              cell.font = { ...cell.font, color: { argb: 'D32F2F' } };
            } else if (value > 0) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E8' } };
              cell.font = { ...cell.font, color: { argb: '2E7D32' } };
            }
          }
        }

        // Resaltar totales
        if (index >= 22) {
          cell.font = { ...cell.font, bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3E5F5' } };
        }
      }

      // Bordes
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }

  /**
   * Aplicar estilos profesionales
   */
  private static aplicarEstilosProfesionales(worksheet: ExcelJS.Worksheet): void {
    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 11) { // Desde la fila de datos
        row.eachCell((cell) => {
          if (!cell.border) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        });
      }
    });

    // Configurar altura de filas
    worksheet.getRow(1).height = 25; // Título principal
    worksheet.getRow(2).height = 20; // Subtítulo
    worksheet.getRow(3).height = 20; // Título del reporte
    worksheet.getRow(11).height = 25; // Encabezados principales
    worksheet.getRow(12).height = 30; // Sub-encabezados
  }
}
