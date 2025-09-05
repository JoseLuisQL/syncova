import { Request, Response } from 'express';
import { PlanificacionService } from '@/services/PlanificacionService';
import { PlanificacionExportService, PlanificacionExportConfig } from '@/services/PlanificacionExportService';
import { successResponse, errorResponse } from '@/utils/response';
import { validateUUID } from '@/utils/validation';
import { prisma } from '@/config/database';
import {
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
  PlanificacionFilters,
  ImportarPlanificacionDto,
  DistribucionAutomaticaDto
} from '@/types';

/**
 * Controlador para gestión de planificación anual de vacunas
 */
export class PlanificacionController {
  /**
   * Obtener todas las planificaciones con filtros opcionales
   * GET /api/planificacion
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        establecimientoId,
        vacunaId,
        anio,
        estado = 'todos',
        centroAcopioId,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        errorResponse(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        errorResponse(res, 'El parámetro limit debe ser un número entre 1 y 100', 400);
        return;
      }

      // Validar UUIDs si se proporcionan
      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (vacunaId && !validateUUID(vacunaId as string)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      // Validar año
      const anioNum = anio ? parseInt(anio as string, 10) : undefined;
      if (anio && (isNaN(anioNum!) || anioNum! < 2020 || anioNum! > 2050)) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const filters: PlanificacionFilters = {
        establecimientoId: establecimientoId as string,
        vacunaId: vacunaId as string,
        anio: anioNum || 2025, // Valor por defecto
        estado: estado as any,
        centroAcopioId: centroAcopioId as string,
        search: search as string,
        page: pageNum,
        limit: limitNum
      };

      const result = await PlanificacionService.getAll(filters);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener planificaciones', 500);
        return;
      }

      successResponse(res, {
        planificaciones: result.data?.planificaciones || [],
        total: result.data?.total || 0,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.data?.total || 0,
          totalPages: Math.ceil((result.data?.total || 0) / limitNum)
        }
      }, 'Planificaciones obtenidas exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener planificación por ID
   * GET /api/planificacion/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de planificación inválido', 400);
        return;
      }

      const result = await PlanificacionService.getById(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener planificación', 500);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Planificación no encontrada', 404);
        return;
      }

      successResponse(res, result.data, 'Planificación obtenida exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.getById:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva planificación
   * POST /api/planificacion
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreatePlanificacionDto = req.body;

      // Validaciones básicas
      if (!data.establecimientoId || !validateUUID(data.establecimientoId)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (!data.vacunaId || !validateUUID(data.vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!data.anio || data.anio < 2020 || data.anio > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!data.metaAnual || data.metaAnual <= 0) {
        errorResponse(res, 'La meta anual debe ser mayor a 0', 400);
        return;
      }

      if (!Array.isArray(data.distribucionMensual) || data.distribucionMensual.length !== 12) {
        errorResponse(res, 'La distribución mensual debe ser un array de 12 elementos', 400);
        return;
      }

      const result = await PlanificacionService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear planificación', 400);
        return;
      }

      successResponse(res, result.data, 'Planificación creada exitosamente', 201);
    } catch (error) {
      console.error('Error en PlanificacionController.create:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar planificación
   * PUT /api/planificacion/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdatePlanificacionDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de planificación inválido', 400);
        return;
      }

      // Validaciones opcionales para actualización
      // Nota: El año no se puede actualizar, solo meta anual, distribución y estado

      if (data.metaAnual && data.metaAnual <= 0) {
        errorResponse(res, 'La meta anual debe ser mayor a 0', 400);
        return;
      }

      if (data.distribucionMensual && (!Array.isArray(data.distribucionMensual) || data.distribucionMensual.length !== 12)) {
        errorResponse(res, 'La distribución mensual debe ser un array de 12 elementos', 400);
        return;
      }

      // Obtener usuarioId para sincronización automática
      let { usuarioId } = req.body;

      // Manejar usuario temporal hasta implementar autenticación completa
      if (!usuarioId || usuarioId === 'temp-user-id' || !validateUUID(usuarioId)) {
        // Buscar un usuario administrador para usar como temporal
        const usuarioAdmin = await prisma.usuario.findFirst({
          where: { rol: 'administrador', estado: 'activo' }
        });

        if (usuarioAdmin) {
          usuarioId = usuarioAdmin.id;
        }
      }

      const result = await PlanificacionService.update(id, data, usuarioId);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar planificación', 400);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Planificación no encontrada', 404);
        return;
      }

      successResponse(res, result.data, 'Planificación actualizada exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.update:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar planificación
   * DELETE /api/planificacion/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de planificación inválido', 400);
        return;
      }

      const result = await PlanificacionService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar planificación', 500);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Planificación no encontrada', 404);
        return;
      }

      successResponse(res, null, 'Planificación eliminada exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.delete:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de planificación
   * GET /api/planificacion/estadisticas
   */
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const { anio } = req.query;

      // Validar año si se proporciona
      const anioNum = anio ? parseInt(anio as string, 10) : undefined;
      if (anio && (isNaN(anioNum!) || anioNum! < 2020 || anioNum! > 2050)) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await PlanificacionService.getEstadisticas(anioNum);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener estadísticas', 500);
        return;
      }

      successResponse(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.getEstadisticas:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener planificaciones por vacuna y año
   * GET /api/planificacion/vacuna/:vacunaId/anio/:anio
   */
  static async getByVacunaAndYear(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId, anio } = req.params;
      const { centroAcopioId } = req.query;

      // Validaciones
      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const anioNum = parseInt(anio || '0', 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (centroAcopioId && centroAcopioId !== 'todos' && !validateUUID(centroAcopioId as string)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const result = await PlanificacionService.getByVacunaAndYear(
        vacunaId || '',
        anioNum,
        centroAcopioId as string
      );

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener planificaciones', 500);
        return;
      }

      successResponse(res, result.data, 'Planificaciones obtenidas exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.getByVacunaAndYear:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Importar planificaciones desde datos estructurados
   * POST /api/planificacion/importar
   */
  static async importar(req: Request, res: Response): Promise<void> {
    try {
      const data: ImportarPlanificacionDto = req.body;

      // Validaciones básicas
      if (!data.vacunaId || !validateUUID(data.vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!data.anio || data.anio < 2020 || data.anio > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!Array.isArray(data.registros) || data.registros.length === 0) {
        errorResponse(res, 'Debe proporcionar al menos un registro para importar', 400);
        return;
      }

      // Validar cada registro
      for (const registro of data.registros) {
        if (!registro.establecimientoId || !validateUUID(registro.establecimientoId)) {
          errorResponse(res, 'ID de establecimiento inválido en uno de los registros', 400);
          return;
        }

        if (!registro.metaAnual || registro.metaAnual <= 0) {
          errorResponse(res, 'La meta anual debe ser mayor a 0 en todos los registros', 400);
          return;
        }

        if (!Array.isArray(registro.distribucionMensual) || registro.distribucionMensual.length !== 12) {
          errorResponse(res, 'La distribución mensual debe ser un array de 12 elementos en todos los registros', 400);
          return;
        }
      }

      const result = await PlanificacionService.importarPlanificaciones(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al importar planificaciones', 400);
        return;
      }

      successResponse(res, result.data, 'Planificaciones importadas exitosamente', 201);
    } catch (error) {
      console.error('Error en PlanificacionController.importar:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Generar distribución automática
   * POST /api/planificacion/distribucion-automatica
   */
  static async distribucionAutomatica(req: Request, res: Response): Promise<void> {
    try {
      const data: DistribucionAutomaticaDto = req.body;

      // Validaciones básicas
      if (!data.vacunaId || !validateUUID(data.vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      if (!data.anio || data.anio < 2020 || data.anio > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!data.criterio || !['uniforme', 'estacional', 'poblacional', 'historico'].includes(data.criterio)) {
        errorResponse(res, 'Criterio de distribución inválido', 400);
        return;
      }

      if (data.centroAcopioId && data.centroAcopioId !== 'todos' && !validateUUID(data.centroAcopioId)) {
        errorResponse(res, 'ID de centro de acopio inválido', 400);
        return;
      }

      const result = await PlanificacionService.generarDistribucionAutomatica(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al generar distribución automática', 400);
        return;
      }

      successResponse(res, result.data, 'Distribución automática generada exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.distribucionAutomatica:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Descargar plantilla Excel para importación por vacuna específica
   * GET /api/planificacion/plantilla/vacuna/:vacunaId/anio/:anio
   */
  static async descargarPlantillaVacuna(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId, anio } = req.params;

      // Validaciones
      if (!vacunaId || !validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const anioNum = parseInt(anio || '0', 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await PlanificacionService.generarPlantillaVacuna(vacunaId, anioNum);

      if (!result.success || !result.data) {
        errorResponse(res, result.error || 'Error al generar plantilla', 400);
        return;
      }

      // Configurar headers para descarga
      const filename = `Plantilla_Programacion_${anioNum}_Vacuna.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo Excel al response
      await result.data.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionController.descargarPlantillaVacuna:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Descargar plantilla Excel masiva para todas las vacunas de un año
   * GET /api/planificacion/plantilla/masiva/anio/:anio
   */
  static async descargarPlantillaMasiva(req: Request, res: Response): Promise<void> {
    try {
      const { anio } = req.params;
      console.log('Descargando plantilla masiva para año:', anio);

      const anioNum = parseInt(anio || '0', 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        console.log('Año inválido:', anioNum);
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      console.log('Generando plantilla masiva para año:', anioNum);
      const result = await PlanificacionService.generarPlantillaMasiva(anioNum);

      if (!result.success || !result.data) {
        console.log('Error al generar plantilla masiva:', result.error);
        errorResponse(res, result.error || 'Error al generar plantilla masiva', 400);
        return;
      }

      console.log('Plantilla masiva generada exitosamente');

      // Configurar headers para descarga
      const filename = `Plantilla_Programacion_Masiva_${anioNum}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo Excel al response
      await result.data.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionController.descargarPlantillaMasiva:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Importar planificaciones desde archivo Excel por vacuna específica
   * POST /api/planificacion/importar/vacuna/:vacunaId/anio/:anio
   */
  static async importarDesdeExcelVacuna(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId, anio } = req.params;

      // Validaciones
      if (!vacunaId || !validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const anioNum = parseInt(anio || '0', 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      // Verificar que se subió un archivo
      if (!req.file) {
        errorResponse(res, 'Archivo Excel requerido', 400);
        return;
      }

      // Verificar tipo de archivo
      if (!req.file.mimetype.includes('spreadsheet') && !req.file.originalname.endsWith('.xlsx')) {
        errorResponse(res, 'El archivo debe ser un Excel (.xlsx)', 400);
        return;
      }

      const result = await PlanificacionService.importarDesdeExcelVacuna(
        vacunaId,
        anioNum,
        req.file.buffer
      );

      if (!result.success) {
        errorResponse(res, result.error || 'Error al importar desde Excel', 400);
        return;
      }

      successResponse(res, result.data, 'Planificaciones importadas exitosamente desde Excel');

    } catch (error) {
      console.error('Error en PlanificacionController.importarDesdeExcelVacuna:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Importar planificaciones masivas desde archivo Excel (múltiples hojas)
   * POST /api/planificacion/importar/masivo/anio/:anio
   */
  static async importarDesdeExcelMasivo(req: Request, res: Response): Promise<void> {
    try {
      const { anio } = req.params;

      const anioNum = parseInt(anio || '0', 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      // Verificar que se subió un archivo
      if (!req.file) {
        errorResponse(res, 'Archivo Excel requerido', 400);
        return;
      }

      // Verificar tipo de archivo
      if (!req.file.mimetype.includes('spreadsheet') && !req.file.originalname.endsWith('.xlsx')) {
        errorResponse(res, 'El archivo debe ser un Excel (.xlsx)', 400);
        return;
      }

      const result = await PlanificacionService.importarDesdeExcelMasivo(
        anioNum,
        req.file.buffer
      );

      if (!result.success) {
        errorResponse(res, result.error || 'Error al importar masivamente desde Excel', 400);
        return;
      }

      successResponse(res, result.data, 'Planificaciones importadas masivamente exitosamente desde Excel');

    } catch (error) {
      console.error('Error en PlanificacionController.importarDesdeExcelMasivo:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Sincronizar planificación con movimientos
   * POST /api/planificacion/:id/sincronizar-movimientos
   */
  static async sincronizarConMovimientos(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let { usuarioId } = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de planificación inválido', 400);
        return;
      }

      // Manejar usuario temporal hasta implementar autenticación completa
      if (!usuarioId || usuarioId === 'temp-user-id' || !validateUUID(usuarioId)) {
        // Buscar un usuario administrador para usar como temporal
        const usuarioAdmin = await prisma.usuario.findFirst({
          where: { rol: 'administrador', estado: 'activo' }
        });

        if (!usuarioAdmin) {
          errorResponse(res, 'No se encontró usuario válido para la operación', 400);
          return;
        }

        usuarioId = usuarioAdmin.id;
      }

      const result = await PlanificacionService.sincronizarConMovimientosManual(id, usuarioId);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al sincronizar con movimientos', result.error === 'Planificación no encontrada' ? 404 : 400);
        return;
      }

      successResponse(res, result.data, 'Sincronización completada exitosamente');
    } catch (error) {
      console.error('Error en PlanificacionController.sincronizarConMovimientos:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Verificar existencia de planificación para un establecimiento
   * GET /api/planificacion/verificar/:establecimientoId/:vacunaId/:anio
   */
  static async verificarExistenciaPlanificacion(req: Request, res: Response): Promise<void> {
    try {
      const { establecimientoId, vacunaId, anio } = req.params;

      if (!validateUUID(establecimientoId)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const anioNum = parseInt(anio, 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      const result = await PlanificacionService.verificarExistenciaPlanificacion(
        establecimientoId,
        vacunaId,
        anioNum
      );

      if (!result.success) {
        errorResponse(res, result.error || 'Error al verificar planificación', 500);
        return;
      }

      successResponse(res, result.data, 'Verificación de planificación completada');
    } catch (error) {
      console.error('Error en PlanificacionController.verificarExistenciaPlanificacion:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar planificación por vacuna específica a Excel
   * POST /api/planificacion/exportar/vacuna/:vacunaId
   */
  static async exportarPorVacuna(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId } = req.params;
      const { anio, centroAcopioId, incluirEstablecimientosSinProgramacion, responsableReporte, observaciones } = req.body;

      // Validar parámetros
      if (!validateUUID(vacunaId)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const anioNum = parseInt(anio, 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || responsableReporte.trim() === '') {
        errorResponse(res, 'Responsable del reporte es requerido', 400);
        return;
      }

      // Configurar exportación
      const config: PlanificacionExportConfig = {
        anio: anioNum,
        vacunaId,
        centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
        incluirEstablecimientosSinProgramacion: incluirEstablecimientosSinProgramacion === true,
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim()
      };

      // Generar exportación
      const result = await PlanificacionExportService.exportarPorVacuna(config);

      if (!result.success || !result.data) {
        errorResponse(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo Excel al response
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionController.exportarPorVacuna:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Exportar todas las vacunas a Excel (hojas separadas)
   * POST /api/planificacion/exportar/todas-vacunas
   */
  static async exportarTodasVacunas(req: Request, res: Response): Promise<void> {
    try {
      const { anio, centroAcopioId, incluirEstablecimientosSinProgramacion, responsableReporte, observaciones } = req.body;

      // Validar parámetros
      const anioNum = parseInt(anio, 10);
      if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2050) {
        errorResponse(res, 'El año debe estar entre 2020 y 2050', 400);
        return;
      }

      if (!responsableReporte || responsableReporte.trim() === '') {
        errorResponse(res, 'Responsable del reporte es requerido', 400);
        return;
      }

      // Configurar exportación
      const config: PlanificacionExportConfig = {
        anio: anioNum,
        centroAcopioId: centroAcopioId && centroAcopioId !== 'todos' ? centroAcopioId : undefined,
        incluirEstablecimientosSinProgramacion: incluirEstablecimientosSinProgramacion === true,
        responsableReporte: responsableReporte.trim(),
        observaciones: observaciones?.trim()
      };

      // Generar exportación
      const result = await PlanificacionExportService.exportarTodasVacunas(config);

      if (!result.success || !result.data) {
        errorResponse(res, result.error || 'Error al generar exportación', 500);
        return;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Escribir el archivo Excel al response
      await result.data.workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error en PlanificacionController.exportarTodasVacunas:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}
