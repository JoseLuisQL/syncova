import { Request, Response } from 'express';
import { 
  PlanificacionReportesService, 
  PlanificacionReportesFilters 
} from '@/services/PlanificacionReportesService';
import { 
  PlanificacionReportesExportService,
  PlanificacionReportesExportConfig
} from '@/services/PlanificacionReportesExportService';
import { ResponseUtil } from '@/utils/response';
import { validateUUID } from '@/utils/validation';

/**
 * Controlador para reportes de planificación
 */
export class PlanificacionReportesController {
  /**
   * Generar reporte de programación anual
   * GET /api/reportes/planificacion/programacion-anual
   */
  static async generarProgramacionAnual(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        establecimientoId,
        incluirInactivos
      } = req.query;

      // Validaciones
      const anioNum = anio ? parseInt(anio as string, 10) : new Date().getFullYear();
      if (anio && (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const filters: PlanificacionReportesFilters = {
        anio: anioNum,
        vacunaId: vacunaId as string,
        centroAcopioId: centroAcopioId as string,
        establecimientoId: establecimientoId as string,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await PlanificacionReportesService.generarProgramacionAnual(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de programación anual', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de programación anual generado exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionReportesController.generarProgramacionAnual:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de cumplimiento de metas
   * GET /api/reportes/planificacion/cumplimiento-metas
   */
  static async generarCumplimientoMetas(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        establecimientoId,
        incluirInactivos
      } = req.query;

      // Validaciones
      const anioNum = anio ? parseInt(anio as string, 10) : new Date().getFullYear();
      if (anio && (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const filters: PlanificacionReportesFilters = {
        anio: anioNum,
        vacunaId: vacunaId as string,
        centroAcopioId: centroAcopioId as string,
        establecimientoId: establecimientoId as string,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await PlanificacionReportesService.generarCumplimientoMetas(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de cumplimiento de metas', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de cumplimiento de metas generado exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionReportesController.generarCumplimientoMetas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de proyección de demanda
   * GET /api/reportes/planificacion/proyeccion-demanda
   */
  static async generarProyeccionDemanda(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        establecimientoId,
        incluirInactivos
      } = req.query;

      // Validaciones
      const anioNum = anio ? parseInt(anio as string, 10) : new Date().getFullYear();
      if (anio && (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        ResponseUtil.error(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const filters: PlanificacionReportesFilters = {
        anio: anioNum,
        vacunaId: vacunaId as string,
        centroAcopioId: centroAcopioId as string,
        establecimientoId: establecimientoId as string,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await PlanificacionReportesService.generarProyeccionDemanda(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de proyección de demanda', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de proyección de demanda generado exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionReportesController.generarProyeccionDemanda:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar reporte de distribución geográfica
   * GET /api/reportes/planificacion/distribucion-geografica
   */
  static async generarDistribucionGeografica(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        incluirInactivos
      } = req.query;

      // Validaciones
      const anioNum = anio ? parseInt(anio as string, 10) : new Date().getFullYear();
      if (anio && (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const filters: PlanificacionReportesFilters = {
        anio: anioNum,
        vacunaId: vacunaId as string,
        centroAcopioId: centroAcopioId as string,
        incluirInactivos: incluirInactivos === 'true'
      };

      const result = await PlanificacionReportesService.generarDistribucionGeografica(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al generar reporte de distribución geográfica', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Reporte de distribución geográfica generado exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionReportesController.generarDistribucionGeografica:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de programación anual a Excel
   * POST /api/reportes/planificacion/programacion-anual/exportar
   */
  static async exportarProgramacionAnual(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        responsableReporte,
        observaciones
      } = req.body;

      // Validaciones
      if (!anio || isNaN(parseInt(anio)) || anio < 2020 || anio > 2050) {
        ResponseUtil.error(res, 'Año inválido. Debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || responsableReporte.trim() === '') {
        ResponseUtil.error(res, 'Responsable del reporte es requerido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Configurar exportación
      const config: PlanificacionReportesExportConfig = {
        anio: parseInt(anio),
        vacunaId,
        centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim(),
        tipoReporte: 'programacion_anual'
      };

      // Generar exportación
      const result = await PlanificacionReportesExportService.exportarProgramacionAnual(config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Configurar respuesta para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);

      // Escribir workbook a la respuesta
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionReportesController.exportarProgramacionAnual:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de cumplimiento de metas a Excel
   * POST /api/reportes/planificacion/cumplimiento-metas/exportar
   */
  static async exportarCumplimientoMetas(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        responsableReporte,
        observaciones
      } = req.body;

      // Validaciones
      if (!anio || isNaN(parseInt(anio)) || anio < 2020 || anio > 2050) {
        ResponseUtil.error(res, 'Año inválido. Debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || responsableReporte.trim() === '') {
        ResponseUtil.error(res, 'Responsable del reporte es requerido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Configurar exportación
      const config: PlanificacionReportesExportConfig = {
        anio: parseInt(anio),
        vacunaId,
        centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim(),
        tipoReporte: 'cumplimiento_metas'
      };

      // Generar exportación
      const result = await PlanificacionReportesExportService.exportarCumplimientoMetas(config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Configurar respuesta para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);

      // Escribir workbook a la respuesta
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionReportesController.exportarCumplimientoMetas:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de proyección de demanda a Excel
   * POST /api/reportes/planificacion/proyeccion-demanda/exportar
   */
  static async exportarProyeccionDemanda(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        responsableReporte,
        observaciones
      } = req.body;

      // Validaciones
      if (!anio || isNaN(parseInt(anio)) || anio < 2020 || anio > 2050) {
        ResponseUtil.error(res, 'Año inválido. Debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || responsableReporte.trim() === '') {
        ResponseUtil.error(res, 'Responsable del reporte es requerido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Configurar exportación
      const config: PlanificacionReportesExportConfig = {
        anio: parseInt(anio),
        vacunaId,
        centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim(),
        tipoReporte: 'proyeccion_demanda'
      };

      // Generar exportación
      const result = await PlanificacionReportesExportService.exportarProyeccionDemanda(config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Configurar respuesta para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);

      // Escribir workbook a la respuesta
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionReportesController.exportarProyeccionDemanda:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar reporte de distribución geográfica a Excel
   * POST /api/reportes/planificacion/distribucion-geografica/exportar
   */
  static async exportarDistribucionGeografica(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        centroAcopioId,
        responsableReporte,
        observaciones
      } = req.body;

      // Validaciones
      if (!anio || isNaN(parseInt(anio)) || anio < 2020 || anio > 2050) {
        ResponseUtil.error(res, 'Año inválido. Debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || responsableReporte.trim() === '') {
        ResponseUtil.error(res, 'Responsable del reporte es requerido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId)) {
        ResponseUtil.error(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Configurar exportación
      const config: PlanificacionReportesExportConfig = {
        anio: parseInt(anio),
        vacunaId,
        centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim(),
        tipoReporte: 'distribucion_geografica'
      };

      // Generar exportación
      const result = await PlanificacionReportesExportService.exportarDistribucionGeografica(config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Configurar respuesta para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);

      // Escribir workbook a la respuesta
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionReportesController.exportarDistribucionGeografica:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
