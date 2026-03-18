import { Request, Response } from 'express';
import { JeringaService } from '@/services/JeringaService';
import { CreateJeringaDto, UpdateJeringaDto, EstadoGeneral } from '@/types';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/response';
import { validateRequired, validateEnum, validateUUID } from '@/utils/validation';

/**
 * Controlador para gestión de jeringas
 */
export class JeringaController {
  /**
   * Obtener todas las jeringas
   * GET /api/jeringas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        estado = 'todos',
        search,
        tipo,
        capacidad,
        color,
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

      const result = await JeringaService.getAll({
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        tipo: tipo as string,
        capacidad: capacidad as string,
        color: color as string,
        page: pageNum,
        limit: limitNum
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener jeringas', result.statusCode || 500);
        return;
      }

      const { jeringas, total } = result.data!;

      paginatedResponse(res, {
        data: jeringas,
        page: pageNum,
        limit: limitNum,
        total,
        message: 'Jeringas obtenidas exitosamente'
      });
    } catch (error: any) {
      console.error('Error en JeringaController.getAll:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener jeringa por ID
   * GET /api/jeringas/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const result = await JeringaService.getById(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener jeringa', result.statusCode || 500);
        return;
      }

      if (!result.data) {
        errorResponse(res, 'Jeringa no encontrada', 404);
        return;
      }

      successResponse(res, result.data, 'Jeringa obtenida exitosamente');
    } catch (error: any) {
      console.error('Error en JeringaController.getById:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Crear nueva jeringa
   * POST /api/jeringas
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateJeringaDto = req.body;

      console.log('📝 Datos recibidos para crear jeringa:', JSON.stringify(data, null, 2));

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.tipo, 'tipo'),
        validateRequired(data.capacidad, 'capacidad'),
        validateRequired(data.color, 'color')
      ].filter(Boolean);

      if (validationErrors.length > 0) {
        errorResponse(res, 'Datos inválidos', 400, validationErrors);
        return;
      }

      const result = await JeringaService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear jeringa', result.statusCode || 400);
        return;
      }

      console.log('✅ Jeringa creada exitosamente:', result.data?.id);
      successResponse(res, result.data, 'Jeringa creada exitosamente', 201);
    } catch (error: any) {
      console.error('Error en JeringaController.create:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Actualizar jeringa
   * PUT /api/jeringas/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateJeringaDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar jeringa:', JSON.stringify(data, null, 2));

      // Validaciones opcionales
      const validationErrors = [];

      if (data.estado) {
        const estadoError = validateEnum(data.estado, ['activo', 'inactivo'], 'estado');
        if (estadoError) {
          validationErrors.push(estadoError);
        }
      }

      if (validationErrors.length > 0) {
        errorResponse(res, 'Datos inválidos', 400, validationErrors);
        return;
      }

      const result = await JeringaService.update(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar jeringa', result.statusCode || 400);
        return;
      }

      console.log('✅ Jeringa actualizada exitosamente:', id);
      successResponse(res, result.data, 'Jeringa actualizada exitosamente');
    } catch (error: any) {
      console.error('Error en JeringaController.update:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Eliminar jeringa
   * DELETE /api/jeringas/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const result = await JeringaService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar jeringa', result.statusCode || 400);
        return;
      }

      console.log('✅ Jeringa eliminada exitosamente:', id);
      successResponse(res, null, 'Jeringa eliminada exitosamente');
    } catch (error: any) {
      console.error('Error en JeringaController.delete:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener jeringas activas
   * GET /api/jeringas/activas
   */
  static async getActivas(req: Request, res: Response): Promise<void> {
    try {
      const result = await JeringaService.getActivas();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener jeringas activas', result.statusCode || 500);
        return;
      }

      successResponse(res, result.data, 'Jeringas activas obtenidas exitosamente');
    } catch (error: any) {
      console.error('Error en JeringaController.getActivas:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }

  /**
   * Obtener estadísticas de stock
   * GET /api/jeringas/stats/stock
   */
  static async getStockStats(req: Request, res: Response): Promise<void> {
    try {
      const { jeringaId } = req.query;

      if (jeringaId && !validateUUID(jeringaId as string)) {
        errorResponse(res, 'ID de jeringa inválido', 400);
        return;
      }

      const result = await JeringaService.getStockStats(jeringaId as string);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener estadísticas de stock', result.statusCode || 500);
        return;
      }

      successResponse(res, result.data, 'Estadísticas de stock obtenidas exitosamente');
    } catch (error: any) {
      console.error('Error en JeringaController.getStockStats:', error);
      errorResponse(res, error.message || 'Error interno del servidor', error.statusCode || 500);
    }
  }
}
