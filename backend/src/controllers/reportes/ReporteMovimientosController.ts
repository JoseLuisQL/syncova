import { Request, Response } from 'express';
import {
  ReporteService,
  MovimientosMensualesFilters,
  ConsumoHistoricoFilters,
  EntregasPorEstablecimientoFilters,
  EficienciaDistribucionFilters,
  MovimientosPorEESSFilters
} from '@/services/ReporteService';
import {
  ReporteExportService,
  ReporteExportConfig
} from '@/services/ReporteExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';

/**
 * Controlador para reportes de movimientos y análisis
 * Módulo: REPORTES DE MOVIMIENTOS
 */
export class ReporteMovimientosController {
  /**
   * Generar reporte de movimientos mensuales
   * GET /api/reportes/movimientos-mensuales
   */
  static async generarMovimientosMensuales(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        mes,
        anio,
        incluirInactivos,
        agruparPor
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const mesNum = mes ? parseInt(mes as string, 10) : undefined;
      if (mes && (isNaN(mesNum!) || mesNum! < 1 || mesNum! > 12)) {
        ResponseUtil.error(res, 'El mes debe estar entre 1 y 12', 400);
        return;
      }

      const anioNum = anio ? parseInt(anio as string, 10) : undefined;
      if (anio && (isNaN(anioNum!) || anioNum! < 2020 || anioNum! > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const filters: MovimientosMensualesFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      if (mesNum) filters.mes = mesNum;
      if (anioNum) filters.anio = anioNum;
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      if (agruparPor) filters.agruparPor = agruparPor as 'mes' | 'vacuna' | 'establecimiento';

      const result = await ReporteService.generarMovimientosMensuales(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de movimientos mensuales', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de movimientos mensuales generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteMovimientosController.generarMovimientosMensuales:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de consumo histórico
   * GET /api/reportes/consumo-historico
   */
  static async generarConsumoHistorico(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        periodoMeses,
        incluirInactivos,
        incluirProyecciones
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const periodoMesesNum = periodoMeses ? parseInt(periodoMeses as string, 10) : 12;
      if (periodoMeses && (isNaN(periodoMesesNum) || periodoMesesNum < 1 || periodoMesesNum > 60)) {
        ResponseUtil.error(res, 'El período de meses debe estar entre 1 y 60', 400);
        return;
      }

      const filters: ConsumoHistoricoFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      filters.periodoMeses = periodoMesesNum;
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      filters.incluirProyecciones = incluirProyecciones !== 'false';

      const result = await ReporteService.generarConsumoHistorico(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de consumo histórico', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de consumo histórico generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteMovimientosController.generarConsumoHistorico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de entregas por establecimiento
   * GET /api/reportes/entregas-por-establecimiento
   */
  static async generarEntregasPorEstablecimiento(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        incluirInactivos,
        incluirDetalleVacunas,
        ordenarPor
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const filters: EntregasPorEstablecimientoFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      filters.incluirDetalleVacunas = incluirDetalleVacunas !== 'false';
      if (ordenarPor) filters.ordenarPor = ordenarPor as 'establecimiento' | 'cantidad' | 'fecha';

      const result = await ReporteService.generarEntregasPorEstablecimiento(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de entregas por establecimiento', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de entregas por establecimiento generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteMovimientosController.generarEntregasPorEstablecimiento:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de eficiencia de distribución
   * GET /api/reportes/eficiencia-distribucion
   */
  static async generarEficienciaDistribucion(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        vacunaId,
        establecimientoId,
        fechaInicio,
        fechaFin,
        incluirInactivos,
        incluirIndicadores,
        calcularTendencias
      } = req.query;

      if (centroAcopioId && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const filters: EficienciaDistribucionFilters = {};

      if (centroAcopioId) filters.centroAcopioId = centroAcopioId as string;
      if (vacunaId) filters.vacunaId = vacunaId as string;
      if (establecimientoId) filters.establecimientoId = establecimientoId as string;
      if (fechaInicio) filters.fechaInicio = new Date(fechaInicio as string);
      if (fechaFin) filters.fechaFin = new Date(fechaFin as string);
      if (incluirInactivos) filters.incluirInactivos = incluirInactivos === 'true';
      filters.incluirIndicadores = incluirIndicadores !== 'false';
      filters.calcularTendencias = calcularTendencias !== 'false';

      const result = await ReporteService.generarEficienciaDistribucion(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de eficiencia de distribución', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de eficiencia de distribución generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteMovimientosController.generarEficienciaDistribucion:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de movimientos por EESS
   * POST /api/reportes/movimientos-por-eess
   */
  static async generarMovimientosPorEESS(req: Request, res: Response): Promise<void> {
    try {
      const {
        centroAcopioId,
        fechaInicio,
        fechaFin
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

      if (centroAcopioId && !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const filters: MovimientosPorEESSFilters = {
        centroAcopioId,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate
      };

      const result = await ReporteService.generarMovimientosPorEESS(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de movimientos por EESS', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de movimientos por EESS generado exitosamente');
    } catch (error) {
      console.error('Error en ReporteMovimientosController.generarMovimientosPorEESS:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de movimientos mensuales a Excel
   * POST /api/reportes/movimientos-mensuales/exportar
   */
  static async exportarMovimientosMensuales(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      const reporteResult = await ReporteService.generarMovimientosMensuales(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      const exportResult = await ReporteExportService.exportarMovimientosMensuales(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteMovimientosController.exportarMovimientosMensuales:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de consumo histórico a Excel
   * POST /api/reportes/consumo-historico/exportar
   */
  static async exportarConsumoHistorico(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      const reporteResult = await ReporteService.generarConsumoHistorico(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      const exportResult = await ReporteExportService.exportarConsumoHistorico(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteMovimientosController.exportarConsumoHistorico:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de entregas por establecimiento a Excel
   * POST /api/reportes/entregas-por-establecimiento/exportar
   */
  static async exportarEntregasPorEstablecimiento(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      const reporteResult = await ReporteService.generarEntregasPorEstablecimiento(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      const exportResult = await ReporteExportService.exportarEntregasPorEstablecimiento(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteMovimientosController.exportarEntregasPorEstablecimiento:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de eficiencia de distribución a Excel
   * POST /api/reportes/eficiencia-distribucion/exportar
   */
  static async exportarEficienciaDistribucion(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      const reporteResult = await ReporteService.generarEficienciaDistribucion(filtros);
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
        return;
      }

      const exportResult = await ReporteExportService.exportarEficienciaDistribucion(
        reporteResult.data!,
        config
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteMovimientosController.exportarEficienciaDistribucion:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de movimientos por EESS a Excel
   * POST /api/reportes/movimientos-por-eess/exportar
   */
  static async exportarMovimientosPorEESS(req: Request, res: Response): Promise<void> {
    try {
      const { filtros, config } = req.body;

      if (!config || !config.responsableReporte) {
        ResponseUtil.error(res, 'Configuración de exportación requerida', 400);
        return;
      }

      const reporteResult = await ReporteService.generarMovimientosPorEESS({
        ...filtros,
        usarSaldoSinEntregaParaStock: true,
        usarTotalUltimoMesParaEntrega: true
      });
      if (!reporteResult.success) {
        ResponseUtil.error(res, reporteResult.error || 'Error al generar datos del reporte', 500);
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

      const exportResult = await ReporteExportService.exportarMovimientosPorEESS(
        reporteResult.data!,
        exportConfig
      );

      if (!exportResult.success) {
        ResponseUtil.error(res, exportResult.error || 'Error al exportar reporte', 500);
        return;
      }

      const buffer = await exportResult.data!.workbook.xlsx.writeBuffer() as unknown as Uint8Array;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.data!.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength);

      res.send(buffer);
    } catch (error) {
      console.error('Error en ReporteMovimientosController.exportarMovimientosPorEESS:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
