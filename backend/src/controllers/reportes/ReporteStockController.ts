import { Request, Response } from 'express';
import {
  ReporteService,
  ReporteInventarioFilters,
  StockCriticoFilters,
  VencimientosFilters
} from '@/services/ReporteService';
import {
  ReporteExportService,
  ReporteExportConfig
} from '@/services/ReporteExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';

/**
 * Controlador para reportes de stock e inventario
 * Módulo: REPORTES DE STOCK
 */
export class ReporteStockController {
  /**
   * Generar reporte de stock actual
   * GET /api/reportes/stock-actual
   */
  static async generarStockActual(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        fechaInicio,
        fechaFin,
        incluirInactivos
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const filters: ReporteInventarioFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        fechaInicio: fechaInicio ? new Date(fechaInicio as string) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin as string) : undefined,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarStockActual(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de stock actual', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de stock actual generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteStockController.generarStockActual:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de stock crítico
   * GET /api/reportes/stock-critico
   */
  static async generarStockCritico(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        porcentajeMinimo,
        cantidadMinima,
        incluirInactivos
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const porcentaje = porcentajeMinimo ? parseInt(porcentajeMinimo as string, 10) : undefined;
      if (porcentaje && (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100)) {
        ResponseUtil.error(res, 'Porcentaje mínimo debe estar entre 0 y 100', 400);
        return;
      }

      const cantidad = cantidadMinima ? parseInt(cantidadMinima as string, 10) : undefined;
      if (cantidad && (isNaN(cantidad) || cantidad < 0)) {
        ResponseUtil.error(res, 'Cantidad mínima debe ser mayor a 0', 400);
        return;
      }

      const filters: StockCriticoFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        porcentajeMinimo: porcentaje,
        cantidadMinima: cantidad,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarStockCritico(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de stock crítico', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de stock crítico generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteStockController.generarStockCritico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de próximos vencimientos
   * GET /api/reportes/proximos-vencimientos
   */
  static async generarProximosVencimientos(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        diasAnticipacion,
        incluirInactivos
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const dias = diasAnticipacion ? parseInt(diasAnticipacion as string, 10) : undefined;
      if (dias && (isNaN(dias) || dias < 1 || dias > 365)) {
        ResponseUtil.error(res, 'Días de anticipación debe estar entre 1 y 365', 400);
        return;
      }

      const filters: VencimientosFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        diasAnticipacion: dias,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarProximosVencimientos(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de próximos vencimientos', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de próximos vencimientos generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteStockController.generarProximosVencimientos:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de lotes vencidos
   * GET /api/reportes/lotes-vencidos
   */
  static async generarLotesVencidos(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        incluirInactivos
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      const filters: ReporteInventarioFilters = {
        centroAcopioId: centroAcopioId as string,
        vacunaId: vacunaId as string,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await ReporteService.generarLotesVencidos(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de lotes vencidos', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de lotes vencidos generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteStockController.generarLotesVencidos:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas generales de reportes
   * GET /api/reportes/estadisticas
   */
  static async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const result = await ReporteService.obtenerEstadisticasGenerales();

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener estadísticas', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en ReporteStockController.obtenerEstadisticas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de stock actual a Excel
   * POST /api/reportes/stock-actual/export/excel
   */
  static async exportarStockActualExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      const reporteResult = await ReporteService.generarStockActual(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      const exportResult = await ReporteExportService.exportarStockActual(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteStockController.exportarStockActualExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de stock crítico a Excel
   * POST /api/reportes/stock-critico/export/excel
   */
  static async exportarStockCriticoExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      const reporteResult = await ReporteService.generarStockCritico(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      const exportResult = await ReporteExportService.exportarStockCritico(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteStockController.exportarStockCriticoExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de próximos vencimientos a Excel
   * POST /api/reportes/proximos-vencimientos/export/excel
   */
  static async exportarProximosVencimientosExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      const reporteResult = await ReporteService.generarProximosVencimientos(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      const exportResult = await ReporteExportService.exportarProximosVencimientos(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteStockController.exportarProximosVencimientosExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de lotes vencidos a Excel
   * POST /api/reportes/lotes-vencidos/export/excel
   */
  static async exportarLotesVencidosExcel(req: Request, res: Response): Promise<void> {
    try {
      const { filters, config } = req.body;

      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      const reporteResult = await ReporteService.generarLotesVencidos(filters);

      if (!reporteResult.success || !reporteResult.data) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar reporte de lotes vencidos', 400);
        return;
      }

      const exportConfig: ReporteExportConfig = {
        incluirDetalles: config.incluirDetalles !== false,
        incluirGraficos: config.incluirGraficos === true,
        incluirEstadisticas: config.incluirEstadisticas !== false,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      const exportResult = await ReporteExportService.exportarLotesVencidos(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success || !exportResult.data) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte de lotes vencidos', 500);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteStockController.exportarLotesVencidosExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
