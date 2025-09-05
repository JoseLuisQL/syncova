import { Request, Response } from 'express';
import {
  ReporteService,
  ReporteInventarioFilters,
  StockCriticoFilters,
  VencimientosFilters,
  KardexDetalladoFilters
} from '@/services/ReporteService';
import {
  ReporteExportService,
  ReporteExportConfig
} from '@/services/ReporteExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';

/**
 * Controlador para gestión de reportes de inventario
 * Módulo: REPORTES DE INVENTARIO Y STOCK
 */
export class ReporteController {
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

      // Validaciones
      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      // Construir filtros
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
      console.error('Error en ReporteController.generarStockActual:', error);
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

      // Validaciones
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

      // Construir filtros
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
      console.error('Error en ReporteController.generarStockCritico:', error);
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

      // Validaciones
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

      // Construir filtros
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
      console.error('Error en ReporteController.generarProximosVencimientos:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

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

      // Validaciones requeridas
      if (!fechaInicio || !fechaFin) {
        ResponseUtil.error(res, 'Las fechas de inicio y fin son requeridas', 400);
        return;
      }

      // Validar fechas
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

      // Validar UUIDs si se proporcionan
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

      // Validar tipo si se proporciona
      if (tipo && !['vacuna', 'jeringa'].includes(tipo)) {
        ResponseUtil.error(res, 'Tipo debe ser "vacuna" o "jeringa"', 400);
        return;
      }

      // Validar tipo de movimiento si se proporciona
      if (tipoMovimiento && !['ingreso', 'salida', 'transferencia', 'ajuste'].includes(tipoMovimiento)) {
        ResponseUtil.error(res, 'Tipo de movimiento inválido', 400);
        return;
      }

      // Construir filtros
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
      console.error('Error en ReporteController.generarKardexDetallado:', error);
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
      console.error('Error en ReporteController.obtenerEstadisticas:', error);
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

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarStockActual(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      // Configuración por defecto para exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarStockActual(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      // Configurar respuesta para descarga
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarStockActualExcel:', error);
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

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarStockCritico(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      // Configuración por defecto para exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarStockCritico(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      // Configurar respuesta para descarga
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarStockCriticoExcel:', error);
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

      // Validar configuración de exportación
      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      // Generar datos del reporte
      const reporteResult = await ReporteService.generarProximosVencimientos(filters || {});
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 400);
        return;
      }

      // Configuración por defecto para exportación
      const exportConfig: ReporteExportConfig = {
        incluirDetalles: true,
        incluirGraficos: false,
        incluirEstadisticas: true,
        formatoFecha: 'dd/mm/yyyy',
        responsableReporte: config.responsableReporte,
        observaciones: config.observaciones
      };

      // Exportar a Excel
      const exportResult = await ReporteExportService.exportarProximosVencimientos(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 400);
        return;
      }

      // Configurar respuesta para descarga
      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteController.exportarProximosVencimientosExcel:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  // Métodos adicionales de exportación se pueden agregar aquí
}