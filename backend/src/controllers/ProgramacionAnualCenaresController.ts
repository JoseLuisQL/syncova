import { Request, Response } from 'express';
import { ProgramacionAnualCenaresService } from '../services/ProgramacionAnualCenaresService';
import { ProgramacionSeguimientoAnualExportService, ProgramacionSeguimientoAnualExportConfig } from '../services/ProgramacionSeguimientoAnualExportService';
import { ResponseUtil } from '../utils/response';
import { validateUUID } from '../utils/validation';
import {
  CreateProgramacionAnualCenaresDto,
  UpdateProgramacionAnualCenaresDto,
  ProgramacionAnualCenaresFilters
} from '../types';

/**
 * Controlador para programación anual CENARES
 */
export class ProgramacionAnualCenaresController {
  
  /**
   * Obtener todas las programaciones con filtros
   * GET /api/programacion-anual-cenares
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        vacunaId,
        jeringaId
      } = req.query;

      // Validaciones
      if (anio && (isNaN(parseInt(anio as string)) || parseInt(anio as string) < 2020 || parseInt(anio as string) > 2050)) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (jeringaId && !validateUUID(jeringaId as string)) {
        ResponseUtil.error(res, 'ID de jeringa inválido', 400);
        return;
      }

      const filters: ProgramacionAnualCenaresFilters = {
        ...(anio && { anio: parseInt(anio as string) }),
        ...(vacunaId && { vacunaId: vacunaId as string }),
        ...(jeringaId && { jeringaId: jeringaId as string })
      };

      const result = await ProgramacionAnualCenaresService.getAll(filters);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener programaciones CENARES', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Programaciones CENARES obtenidas exitosamente');
    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.getAll:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener programación por ID
   * GET /api/programacion-anual-cenares/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de programación inválido', 400);
        return;
      }

      const result = await ProgramacionAnualCenaresService.getById(id);

      if (!result.success) {
        const statusCode = result.error === 'Programación no encontrada' ? 404 : 500;
        ResponseUtil.error(res, result.error || 'Error al obtener programación CENARES', statusCode);
        return;
      }

      ResponseUtil.success(res, result.data, 'Programación CENARES obtenida exitosamente');
    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.getById:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva programación
   * POST /api/programacion-anual-cenares
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateProgramacionAnualCenaresDto = req.body;

      // Validaciones básicas
      if (!data.vacunaId && !data.jeringaId) {
        ResponseUtil.error(res, 'Debe especificar vacunaId o jeringaId', 400);
        return;
      }

      if (data.vacunaId && data.jeringaId) {
        ResponseUtil.error(res, 'No puede especificar tanto vacunaId como jeringaId', 400);
        return;
      }

      if (data.vacunaId && !validateUUID(data.vacunaId)) {
        ResponseUtil.error(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (data.jeringaId && !validateUUID(data.jeringaId)) {
        ResponseUtil.error(res, 'ID de jeringa inválido', 400);
        return;
      }

      if (!data.anio || data.anio < 2020 || data.anio > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      // Validar valores de programación (no negativos)
      if (data.programadoQ1 !== undefined && data.programadoQ1 < 0) {
        ResponseUtil.error(res, 'El valor programado Q1 no puede ser negativo', 400);
        return;
      }

      if (data.programadoQ2 !== undefined && data.programadoQ2 < 0) {
        ResponseUtil.error(res, 'El valor programado Q2 no puede ser negativo', 400);
        return;
      }

      if (data.programadoQ3 !== undefined && data.programadoQ3 < 0) {
        ResponseUtil.error(res, 'El valor programado Q3 no puede ser negativo', 400);
        return;
      }

      if (data.programadoQ4 !== undefined && data.programadoQ4 < 0) {
        ResponseUtil.error(res, 'El valor programado Q4 no puede ser negativo', 400);
        return;
      }

      const result = await ProgramacionAnualCenaresService.create(data);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al crear programación CENARES', 400);
        return;
      }

      ResponseUtil.success(res, result.data, 'Programación CENARES creada exitosamente', 201);
    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.create:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar programación existente
   * PUT /api/programacion-anual-cenares/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateProgramacionAnualCenaresDto = req.body;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de programación inválido', 400);
        return;
      }

      // Validar valores de programación (no negativos)
      if (data.programadoQ1 !== undefined && data.programadoQ1 < 0) {
        ResponseUtil.error(res, 'El valor programado Q1 no puede ser negativo', 400);
        return;
      }

      if (data.programadoQ2 !== undefined && data.programadoQ2 < 0) {
        ResponseUtil.error(res, 'El valor programado Q2 no puede ser negativo', 400);
        return;
      }

      if (data.programadoQ3 !== undefined && data.programadoQ3 < 0) {
        ResponseUtil.error(res, 'El valor programado Q3 no puede ser negativo', 400);
        return;
      }

      if (data.programadoQ4 !== undefined && data.programadoQ4 < 0) {
        ResponseUtil.error(res, 'El valor programado Q4 no puede ser negativo', 400);
        return;
      }

      const result = await ProgramacionAnualCenaresService.update(id, data);

      if (!result.success) {
        const statusCode = result.error === 'Programación no encontrada' ? 404 : 400;
        ResponseUtil.error(res, result.error || 'Error al actualizar programación CENARES', statusCode);
        return;
      }

      ResponseUtil.success(res, result.data, 'Programación CENARES actualizada exitosamente');
    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.update:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar programación
   * DELETE /api/programacion-anual-cenares/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        ResponseUtil.error(res, 'ID de programación inválido', 400);
        return;
      }

      const result = await ProgramacionAnualCenaresService.delete(id);

      if (!result.success) {
        const statusCode = result.error === 'Programación no encontrada' ? 404 : 500;
        ResponseUtil.error(res, result.error || 'Error al eliminar programación CENARES', statusCode);
        return;
      }

      ResponseUtil.success(res, null, 'Programación CENARES eliminada exitosamente');
    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.delete:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener datos completos para la tabla dinámica
   * GET /api/programacion-anual-cenares/tabla/:anio
   */
  static async getDatosTablaCompleta(req: Request, res: Response): Promise<void> {
    try {
      const { anio } = req.params;

      // Validaciones
      const anioNum = parseInt(anio, 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await ProgramacionAnualCenaresService.getDatosTablaCompleta(anioNum);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Error al obtener datos de tabla completa', 500);
        return;
      }

      ResponseUtil.success(res, result.data, 'Datos de tabla completa obtenidos exitosamente');
    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.getDatosTablaCompleta:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar programación y seguimiento anual a Excel
   * POST /api/programacion-anual-cenares/exportar
   */
  static async exportarProgramacionSeguimientoAnual(req: Request, res: Response): Promise<void> {
    try {
      const {
        anio,
        responsableReporte,
        observaciones
      } = req.body;

      // Validaciones
      if (!anio || isNaN(parseInt(anio)) || parseInt(anio) < 2020 || parseInt(anio) > 2050) {
        ResponseUtil.error(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || typeof responsableReporte !== 'string' || responsableReporte.trim().length === 0) {
        ResponseUtil.error(res, 'El responsable del reporte es requerido', 400);
        return;
      }

      if (observaciones && typeof observaciones !== 'string') {
        ResponseUtil.error(res, 'Las observaciones deben ser texto', 400);
        return;
      }

      // Configurar exportación
      const config: ProgramacionSeguimientoAnualExportConfig = {
        anio: parseInt(anio),
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim()
      };

      // Generar exportación
      const result = await ProgramacionSeguimientoAnualExportService.exportarProgramacionSeguimientoAnual(config);

      if (!result.success || !result.data) {
        ResponseUtil.error(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Generar buffer del archivo
      const buffer = await result.data.workbook.xlsx.writeBuffer();

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);
      res.setHeader('Content-Length', buffer.byteLength.toString());

      // Enviar archivo
      res.send(buffer);

      console.log(`✅ Exportación de Programación y Seguimiento Anual completada: ${result.data.filename}`);

    } catch (error) {
      console.error('Error en ProgramacionAnualCenaresController.exportarProgramacionSeguimientoAnual:', error);
      ResponseUtil.error(res, 'Error interno del servidor', 500);
    }
  }
}
