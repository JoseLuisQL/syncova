import { Request, Response } from 'express';
import { VacunaService } from '@/services/VacunaService';
import { CreateVacunaDto, UpdateVacunaDto, EstadoGeneral } from '@/types';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/response';
import { validateRequired, validateEnum, validateUUID } from '@/utils/validation';

/**
 * Controlador para gestión de vacunas
 */
export class VacunaController {
  /**
   * Obtener todas las vacunas
   * GET /api/vacunas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        estado = 'todos',
        search,
        tipo,
        page = '1',
        limit = '1000'
      } = req.query;

      // Validaciones de parámetros
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        errorResponse(res, 'El parámetro page debe ser un número mayor a 0', 400);
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        errorResponse(res, 'El parámetro limit debe ser un número entre 1 y 1000', 400);
        return;
      }

      if (estado && !['activo', 'inactivo', 'todos'].includes(estado as string)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await VacunaService.getAll({
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        tipo: tipo as string,
        page: pageNum,
        limit: limitNum
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener vacunas', 500);
        return;
      }

      const { vacunas, total } = result.data!;

      paginatedResponse(res, {
        data: vacunas,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        },
        message: 'Vacunas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error en VacunaController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener vacuna por ID
   * GET /api/vacunas/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const result = await VacunaService.getById(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener vacuna', 500);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Vacuna no encontrada', 404);
        return;
      }

      successResponse(res, result.data, 'Vacuna obtenida exitosamente');
    } catch (error) {
      console.error('Error en VacunaController.getById:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nueva vacuna
   * POST /api/vacunas
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateVacunaDto = req.body;

      console.log('📝 Datos recibidos para crear vacuna:', JSON.stringify(data, null, 2));

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.nombre, 'nombre'),
        validateRequired(data.tipo, 'tipo'),
        validateRequired(data.presentacion, 'presentacion'),
        validateRequired(data.dosisPorFrasco, 'dosisPorFrasco'),
        validateRequired(data.tiempoVidaUtil, 'tiempoVidaUtil'),
        validateRequired(data.temperaturaAlmacenamiento, 'temperaturaAlmacenamiento')
      ].filter(Boolean);

      // Validaciones de tipo
      if (data.dosisPorFrasco && (typeof data.dosisPorFrasco !== 'number' || data.dosisPorFrasco <= 0)) {
        validationErrors.push('Las dosis por frasco deben ser un número mayor a 0');
      }

      if (data.tiempoVidaUtil && (typeof data.tiempoVidaUtil !== 'number' || data.tiempoVidaUtil <= 0)) {
        validationErrors.push('El tiempo de vida útil debe ser un número mayor a 0');
      }

      console.log('🔍 Errores de validación en creación:', validationErrors);

      if (validationErrors.length > 0) {
        errorResponse(res, `Errores de validación: ${validationErrors.join(', ')}`, 400);
        return;
      }

      const result = await VacunaService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear vacuna', 400);
        return;
      }

      console.log('✅ Vacuna creada exitosamente:', result.data?.id);
      successResponse(res, result.data, 'Vacuna creada exitosamente', 201);
    } catch (error) {
      console.error('Error en VacunaController.create:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar vacuna
   * PUT /api/vacunas/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateVacunaDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar vacuna:', JSON.stringify(data, null, 2));

      // Validaciones opcionales
      const validationErrors = [];

      if (data.estado) {
        const estadoError = validateEnum(data.estado, ['activo', 'inactivo'], 'estado');
        if (estadoError) {
          validationErrors.push(estadoError);
        }
      }

      if (data.dosisPorFrasco !== undefined && (typeof data.dosisPorFrasco !== 'number' || data.dosisPorFrasco <= 0)) {
        validationErrors.push('Las dosis por frasco deben ser un número mayor a 0');
      }

      if (data.tiempoVidaUtil !== undefined && (typeof data.tiempoVidaUtil !== 'number' || data.tiempoVidaUtil <= 0)) {
        validationErrors.push('El tiempo de vida útil debe ser un número mayor a 0');
      }

      console.log('🔍 Errores de validación en actualización:', validationErrors);

      if (validationErrors.length > 0) {
        errorResponse(res, `Errores de validación: ${validationErrors.join(', ')}`, 400);
        return;
      }

      const result = await VacunaService.update(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar vacuna', 400);
        return;
      }

      console.log('✅ Vacuna actualizada exitosamente:', id);
      successResponse(res, result.data, 'Vacuna actualizada exitosamente');
    } catch (error) {
      console.error('Error en VacunaController.update:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar vacuna
   * DELETE /api/vacunas/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const result = await VacunaService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar vacuna', 400);
        return;
      }

      console.log('✅ Vacuna eliminada exitosamente:', id);
      successResponse(res, null, 'Vacuna eliminada exitosamente');
    } catch (error) {
      console.error('Error en VacunaController.delete:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de stock
   * GET /api/vacunas/stats/stock
   */
  static async getStockStats(req: Request, res: Response): Promise<void> {
    try {
      const { vacunaId } = req.query;

      if (vacunaId && !validateUUID(vacunaId as string)) {
        errorResponse(res, 'ID de vacuna inválido', 400);
        return;
      }

      const result = await VacunaService.getStockStats(vacunaId as string);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener estadísticas', 500);
        return;
      }

      successResponse(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en VacunaController.getStockStats:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener vacunas activas (para selects y formularios)
   * GET /api/vacunas/activas
   */
  static async getActivas(req: Request, res: Response): Promise<void> {
    try {
      const result = await VacunaService.getAll({
        estado: 'activo',
        page: 1,
        limit: 1000 // Obtener todas las vacunas activas
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener vacunas activas', 500);
        return;
      }

      const vacunasSimples = result.data!.vacunas.map(vacuna => ({
        id: vacuna.id,
        nombre: vacuna.nombre,
        tipo: vacuna.tipo,
        presentacion: vacuna.presentacion,
        dosisPorFrasco: vacuna.dosisPorFrasco
      }));

      successResponse(res, vacunasSimples, 'Vacunas activas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en VacunaController.getActivas:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}
