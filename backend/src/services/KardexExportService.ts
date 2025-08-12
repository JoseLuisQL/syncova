import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { KardexService, KardexFilters } from './KardexService';
import { ServiceResult } from '@/types';

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
 * Resultado de exportación CSV
 */
export interface CSVExportResult {
  content: string;
  filename: string;
  size: number;
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
 * Servicio para exportación del Kardex
 * Maneja la generación de archivos Excel, PDF y CSV con configuraciones personalizadas
 */
class KardexExportService {
  /**
   * Exportar kardex a Excel
   */
  static async exportToExcel(config: KardexExportConfig): Promise<ServiceResult<ExcelExportResult>> {
    try {
      // Obtener datos del kardex
      const result = await KardexService.getAll({
        ...config.filtros,
        page: 1,
        limit: 10000 // Obtener todos los registros para exportación
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'SIVAC - Sistema de Gestión de Vacunas';
      workbook.created = new Date();

      // Hoja principal: Movimientos de Kardex
      const worksheetMovimientos = workbook.addWorksheet('Movimientos de Kardex');
      
      // Configurar columnas
      worksheetMovimientos.columns = [
        { header: 'Fecha y Hora', key: 'fechaMovimiento', width: 20 },
        { header: 'Tipo', key: 'tipo', width: 12 },
        { header: 'Item', key: 'itemNombre', width: 30 },
        { header: 'Lote', key: 'loteNumero', width: 20 },
        { header: 'Tipo Movimiento', key: 'tipoMovimiento', width: 15 },
        { header: 'Cantidad', key: 'cantidad', width: 12 },
        { header: 'Saldo Anterior', key: 'saldoAnterior', width: 15 },
        { header: 'Saldo Actual', key: 'saldoActual', width: 15 },
        { header: 'Establecimiento Origen', key: 'establecimientoOrigen', width: 25 },
        { header: 'Establecimiento Destino', key: 'establecimientoDestino', width: 25 },
        { header: 'Documento', key: 'documento', width: 15 },
        { header: 'Número Documento', key: 'numeroDocumento', width: 20 },
        { header: 'Observaciones', key: 'observaciones', width: 40 },
        { header: 'Usuario', key: 'usuario', width: 25 }
      ];

      // Estilo del encabezado
      const headerRow = worksheetMovimientos.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '366092' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      // Agregar datos
      movimientos.forEach((movimiento, index) => {
        const row = worksheetMovimientos.addRow({
          fechaMovimiento: movimiento.fechaMovimiento,
          tipo: movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1),
          itemNombre: movimiento.item?.nombre || 'N/A',
          loteNumero: movimiento.lote?.numero || 'N/A',
          tipoMovimiento: movimiento.tipoMovimiento.charAt(0).toUpperCase() + movimiento.tipoMovimiento.slice(1),
          cantidad: movimiento.cantidad,
          saldoAnterior: movimiento.saldoAnterior,
          saldoActual: movimiento.saldoActual,
          establecimientoOrigen: movimiento.establecimientoOrigen?.nombre || '-',
          establecimientoDestino: movimiento.establecimientoDestino?.nombre || '-',
          documento: movimiento.documento,
          numeroDocumento: movimiento.numeroDocumento,
          observaciones: movimiento.observaciones || '-',
          usuario: `${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}`
        });

        // Alternar colores de filas
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8F9FA' }
          };
        }

        // Formatear cantidad según tipo de movimiento
        const cantidadCell = row.getCell('cantidad');
        if (movimiento.tipoMovimiento === 'ingreso') {
          cantidadCell.font = { color: { argb: '28A745' } };
        } else if (movimiento.tipoMovimiento === 'salida' || movimiento.tipoMovimiento === 'transferencia') {
          cantidadCell.font = { color: { argb: 'DC3545' } };
        } else if (movimiento.tipoMovimiento === 'ajuste') {
          cantidadCell.font = { color: { argb: 'FFC107' } };
        }
      });

      // Agregar estadísticas si se solicita
      if (config.incluirEstadisticas) {
        const statsResult = await KardexService.getEstadisticas(config.filtros);
        if (statsResult.success && statsResult.data) {
          await this.addEstadisticasSheet(workbook, statsResult.data);
        }
      }

      // Agregar bordes a todas las celdas
      worksheetMovimientos.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Generar nombre de archivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `kardex_${timestamp}.xlsx`;

      // Calcular tamaño aproximado
      const buffer = await workbook.xlsx.writeBuffer();
      const size = buffer.length;

      return {
        success: true,
        data: {
          workbook,
          filename,
          size
        }
      };
    } catch (error) {
      console.error('Error en KardexExportService.exportToExcel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar a Excel'
      };
    }
  }

  /**
   * Exportar kardex a PDF
   */
  static async exportToPDF(config: KardexExportConfig): Promise<ServiceResult<PDFExportResult>> {
    try {
      // Obtener datos del kardex
      const result = await KardexService.getAll({
        ...config.filtros,
        page: 1,
        limit: 10000
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Crear documento PDF
      const doc = new PDFDocument({ 
        size: 'A4',
        layout: 'landscape',
        margin: 30
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));

      // Encabezado
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('REPORTE DE KARDEX', { align: 'center' });
      doc.fontSize(12).font('Helvetica');
      doc.text(`Generado el: ${new Date().toLocaleString('es-PE')}`, { align: 'center' });
      doc.moveDown();

      // Tabla de movimientos (simplificada para PDF)
      const tableTop = doc.y;
      const itemHeight = 20;
      let currentY = tableTop;

      // Encabezados de tabla
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('Fecha', 50, currentY, { width: 60 });
      doc.text('Tipo', 110, currentY, { width: 40 });
      doc.text('Item', 150, currentY, { width: 80 });
      doc.text('Movimiento', 230, currentY, { width: 60 });
      doc.text('Cantidad', 290, currentY, { width: 50 });
      doc.text('Saldo', 340, currentY, { width: 50 });
      doc.text('Documento', 390, currentY, { width: 80 });
      doc.text('Usuario', 470, currentY, { width: 80 });

      currentY += itemHeight;

      // Datos
      doc.font('Helvetica');
      movimientos.forEach((movimiento) => {
        if (currentY > 500) { // Nueva página si es necesario
          doc.addPage();
          currentY = 50;
        }

        doc.text(movimiento.fechaMovimiento.toLocaleDateString(), 50, currentY, { width: 60 });
        doc.text(movimiento.tipo, 110, currentY, { width: 40 });
        doc.text(movimiento.item?.nombre || 'N/A', 150, currentY, { width: 80 });
        doc.text(movimiento.tipoMovimiento, 230, currentY, { width: 60 });
        doc.text(movimiento.cantidad.toString(), 290, currentY, { width: 50 });
        doc.text(movimiento.saldoActual.toString(), 340, currentY, { width: 50 });
        doc.text(movimiento.numeroDocumento, 390, currentY, { width: 80 });
        doc.text(`${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}`, 470, currentY, { width: 80 });

        currentY += itemHeight;
      });

      doc.end();

      return new Promise((resolve) => {
        doc.on('end', () => {
          const buffer = Buffer.concat(buffers);
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const filename = `kardex_${timestamp}.pdf`;

          resolve({
            success: true,
            data: {
              buffer,
              filename,
              size: buffer.length
            }
          });
        });
      });
    } catch (error) {
      console.error('Error en KardexExportService.exportToPDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar a PDF'
      };
    }
  }

  /**
   * Exportar kardex a CSV
   */
  static async exportToCSV(config: KardexExportConfig): Promise<ServiceResult<CSVExportResult>> {
    try {
      // Obtener datos del kardex
      const result = await KardexService.getAll({
        ...config.filtros,
        page: 1,
        limit: 10000
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Crear contenido CSV
      const headers = [
        'Fecha y Hora',
        'Tipo',
        'Item',
        'Lote',
        'Tipo Movimiento',
        'Cantidad',
        'Saldo Anterior',
        'Saldo Actual',
        'Establecimiento Origen',
        'Establecimiento Destino',
        'Documento',
        'Número Documento',
        'Observaciones',
        'Usuario'
      ];

      let csvContent = headers.join(',') + '\n';

      movimientos.forEach((movimiento) => {
        const row = [
          `"${movimiento.fechaMovimiento.toLocaleString()}"`,
          `"${movimiento.tipo}"`,
          `"${movimiento.item?.nombre || 'N/A'}"`,
          `"${movimiento.lote?.numero || 'N/A'}"`,
          `"${movimiento.tipoMovimiento}"`,
          movimiento.cantidad,
          movimiento.saldoAnterior,
          movimiento.saldoActual,
          `"${movimiento.establecimientoOrigen?.nombre || '-'}"`,
          `"${movimiento.establecimientoDestino?.nombre || '-'}"`,
          `"${movimiento.documento}"`,
          `"${movimiento.numeroDocumento}"`,
          `"${movimiento.observaciones || '-'}"`,
          `"${movimiento.usuario.nombres} ${movimiento.usuario.apellidos}"`
        ];

        csvContent += row.join(',') + '\n';
      });

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `kardex_${timestamp}.csv`;

      return {
        success: true,
        data: {
          content: csvContent,
          filename,
          size: Buffer.byteLength(csvContent, 'utf8')
        }
      };
    } catch (error) {
      console.error('Error en KardexExportService.exportToCSV:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar a CSV'
      };
    }
  }

  /**
   * Agregar hoja de estadísticas al workbook de Excel
   */
  private static async addEstadisticasSheet(workbook: ExcelJS.Workbook, estadisticas: any): Promise<void> {
    const worksheetStats = workbook.addWorksheet('Estadísticas');

    // Configurar columnas
    worksheetStats.columns = [
      { header: 'Métrica', key: 'metrica', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 }
    ];

    // Estilo del encabezado
    const headerRow = worksheetStats.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };

    // Agregar estadísticas generales
    const statsData = [
      { metrica: 'Total de Movimientos', valor: estadisticas.totalMovimientos },
      { metrica: 'Total Ingresos', valor: estadisticas.totalIngresos },
      { metrica: 'Total Salidas', valor: estadisticas.totalSalidas },
      { metrica: 'Total Transferencias', valor: estadisticas.totalTransferencias },
      { metrica: 'Total Ajustes', valor: estadisticas.totalAjustes },
      { metrica: 'Saldo Actual Total', valor: estadisticas.saldoActualTotal }
    ];

    statsData.forEach((stat, index) => {
      const row = worksheetStats.addRow(stat);
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }
    });

    // Agregar movimientos por tipo si existen
    if (estadisticas.movimientosPorTipo && estadisticas.movimientosPorTipo.length > 0) {
      worksheetStats.addRow({}); // Fila vacía
      worksheetStats.addRow({ metrica: 'MOVIMIENTOS POR TIPO', valor: '' });

      estadisticas.movimientosPorTipo.forEach((item: any) => {
        worksheetStats.addRow({
          metrica: `${item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}`,
          valor: item.cantidad
        });
      });
    }

    // Agregar movimientos por mes si existen
    if (estadisticas.movimientosPorMes && estadisticas.movimientosPorMes.length > 0) {
      worksheetStats.addRow({}); // Fila vacía
      worksheetStats.addRow({ metrica: 'MOVIMIENTOS POR MES', valor: '' });

      estadisticas.movimientosPorMes.forEach((item: any) => {
        worksheetStats.addRow({
          metrica: item.mes,
          valor: `I:${item.ingresos} S:${item.salidas} T:${item.transferencias} A:${item.ajustes}`
        });
      });
    }

    // Agregar bordes
    worksheetStats.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  }

  /**
   * Obtener estadísticas de exportación
   */
  static async getExportStats(filtros?: KardexFilters): Promise<ServiceResult<KardexExportStats>> {
    try {
      const result = await KardexService.getAll({
        ...filtros,
        page: 1,
        limit: 10000
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Error al obtener datos del kardex'
        };
      }

      const { movimientos } = result.data;

      // Calcular estadísticas
      const stats: KardexExportStats = {
        totalMovimientos: movimientos.length,
        totalIngresos: movimientos.filter(m => m.tipoMovimiento === 'ingreso').length,
        totalSalidas: movimientos.filter(m => m.tipoMovimiento === 'salida').length,
        totalTransferencias: movimientos.filter(m => m.tipoMovimiento === 'transferencia').length,
        totalAjustes: movimientos.filter(m => m.tipoMovimiento === 'ajuste').length,
        itemsUnicos: new Set(movimientos.map(m => m.itemId)).size,
        lotesUnicos: new Set(movimientos.map(m => m.loteId)).size,
        establecimientosUnicos: new Set([
          ...movimientos.map(m => m.establecimientoOrigenId).filter(Boolean),
          ...movimientos.map(m => m.establecimientoDestinoId).filter(Boolean)
        ]).size
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error en KardexExportService.getExportStats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas de exportación'
      };
    }
  }
}

export { KardexExportService };
