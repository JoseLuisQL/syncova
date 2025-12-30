import { Request, Response } from 'express';
import {
  ReporteService,
  KardexDetalladoFilters
} from '@/services/ReporteService';
import { KardexExportService, KardexExportConfig } from '@/services/KardexExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';

/**
 * Controlador para reportes de kardex
 * Módulo: REPORTES DE KARDEX
 */
export class ReporteKardexController {
  /**
   * Generar reporte de kardex detallado
   * POST /api/reportes/kardex-detallado
   */
  static async generarKardexDetallado(req: Request, res: Response): Promise<void> {
    try {
      const {
        tipo,
        itemId,
        loteId,
        establecimientoId,
        tipoMovimiento,
        fechaInicio,
        fechaFin,
        incluirTrazabilidad
      } = req.body;

      if (!fechaInicio || !fechaFin) {
        ResponseUtil.error(res, 'Las fechas de inicio y fin son requeridas', 400);
        return;
      }

      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(fechaFin);

      if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        ResponseUtil.error(res, 'Formato de fecha inválido', 400);
        return;
      }

      if (fechaInicioDate > fechaFinDate) {
        ResponseUtil.error(res, 'La fecha de inicio debe ser menor a la fecha de fin', 400);
        return;
      }

      if (itemId && !validateUUID(itemId)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (loteId && !validateUUID(loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (tipo && !['vacuna', 'jeringa'].includes(tipo)) {
        ResponseUtil.error(res, 'Tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      if (tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      const filters: KardexDetalladoFilters = {
        tipo: tipo as 'vacuna' | 'jeringa',
        itemId,
        loteId,
        establecimientoId,
        tipoMovimiento: tipoMovimiento as 'ingreso' | 'salida' | 'transferencia' | 'ajuste',
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        incluirTrazabilidad: incluirTrazabilidad === true
      };

      const result = await ReporteService.generarKardexDetallado(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de kardex detallado', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de kardex detallado generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteKardexController.generarKardexDetallado:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de kardex detallado a Excel
   * POST /api/reportes/kardex-detallado/export/excel
   */
  static async exportarKardexDetalladoExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      console.log('Iniciando exportación de Kardex detallado');
      console.log('Filtros recibidos:', JSON.stringify(filters, null, 2));

      if (!filters || !filters.fechaInicio || !filters.fechaFin) {
        ResponseUtil.error(res, 'Los filtros con fechas de inicio y fin son requeridos', 400);
        return;
      }

      const fechaInicioDate = new Date(filters.fechaInicio + 'T00:00:00.000');
      const fechaFinDate = new Date(filters.fechaFin + 'T23:59:59.999');

      if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
        ResponseUtil.error(res, 'Formato de fecha inválido', 400);
        return;
      }

      if (fechaInicioDate > fechaFinDate) {
        ResponseUtil.error(res, 'La fecha de inicio debe ser menor a la fecha de fin', 400);
        return;
      }

      if (filters.itemId && !validateUUID(filters.itemId)) {
        ResponseUtil.error(res, 'ID de item inválido', 400);
        return;
      }

      if (filters.loteId && !validateUUID(filters.loteId)) {
        ResponseUtil.error(res, 'ID de lote inválido', 400);
        return;
      }

      if (filters.establecimientoId && !validateUUID(filters.establecimientoId)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (filters.tipo && !['vacuna', 'jeringa'].includes(filters.tipo)) {
        ResponseUtil.error(res, 'Tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      if (filters.tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(filters.tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      const kardexExportConfig: KardexExportConfig = {
        incluirDetalleCompleto: config?.incluirDetalles !== false,
        incluirTrazabilidad: false,
        incluirEstadisticas: config?.incluirEstadisticas !== false,
        formatoExportacion: 'excel',
        filtros: {
          tipo: filters.tipo as 'vacuna' | 'jeringa',
          itemId: filters.itemId,
          loteId: filters.loteId,
          tipoMovimiento: filters.tipoMovimiento as 'ingreso' | 'salida' | 'transferencia' | 'ajuste',
          establecimientoOrigenId: filters.establecimientoId,
          establecimientoDestinoId: filters.establecimientoId,
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate,
          search: filters.search
        }
      };

      const exportResult = await KardexExportService.exportToExcel(kardexExportConfig);

      if (!exportResult.success) {
        console.error('Error en exportación:', exportResult.error);
        ResponseUtil.error(res, exportResult.error || 'Error al exportar kardex detallado', 400);
        return;
      }

      const buffer = await exportResult.data.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      console.log(`Archivo generado: ${exportResult.data.filename} (${buffer.byteLength} bytes)`);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength.toString());

      res.send(buffer);

      console.log('Kardex detallado exportado exitosamente');
    } catch (error) {
      console.error('Error en ReporteKardexController.exportarKardexDetalladoExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
