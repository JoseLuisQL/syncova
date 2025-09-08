import { Request, Response } from 'express';
import { PermissionService, CreatePermissionDto, UpdatePermissionDto } from '@/services/PermissionService';
import { successResponse, errorResponse } from '@/utils/response';
import { validateRequired, validateUUID } from '@/utils/validation';
import { EstadoGeneral } from '@prisma/client';

/**
 * Controlador para gestión de permisos
 */
export class PermissionController {
  /**
   * Obtener todos los permisos con filtros opcionales
   * GET /api/permissions
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { estado, search, categoria, recurso, accion, page, limit } = req.query;

      // Validar parámetros
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 100;

      if (pageNum < 1) {
        errorResponse(res, 'El número de página debe ser mayor a 0', 400);
        return;
      }

      if (limitNum < 1 || limitNum > 200) {
        errorResponse(res, 'El límite debe estar entre 1 y 200', 400);
        return;
      }

      if (estado && !['activo', 'inactivo', 'todos'].includes(estado as string)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await PermissionService.getAll({
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        categoria: categoria as string,
        recurso: recurso as string,
        accion: accion as string,
        page: pageNum,
        limit: limitNum
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener permisos', 500);
        return;
      }

      successResponse(res, result.data, 'Permisos obtenidos exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener un permiso por ID
   * GET /api/permissions/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de permiso inválido', 400);
        return;
      }

      const result = await PermissionService.getById(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener permiso', result.error?.includes('no encontrado') ? 404 : 500);
        return;
      }

      successResponse(res, result.data, 'Permiso obtenido exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getById:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener un permiso por código
   * GET /api/permissions/codigo/:codigo
   */
  static async getByCodigo(req: Request, res: Response): Promise<void> {
    try {
      const { codigo } = req.params;

      if (!codigo) {
        errorResponse(res, 'Código de permiso requerido', 400);
        return;
      }

      const result = await PermissionService.getByCodigo(codigo);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener permiso', result.error?.includes('no encontrado') ? 404 : 500);
        return;
      }

      successResponse(res, result.data, 'Permiso obtenido exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getByCodigo:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo permiso
   * POST /api/permissions
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreatePermissionDto = req.body;

      console.log('📝 Datos recibidos para crear permiso:', JSON.stringify(data, null, 2));

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.nombre, 'nombre'),
        validateRequired(data.codigo, 'codigo'),
        validateRequired(data.recurso, 'recurso'),
        validateRequired(data.accion, 'accion'),
        validateRequired(data.categoria, 'categoria')
      ].filter(Boolean);

      if (validationErrors.length > 0) {
        errorResponse(res, 'Datos inválidos', 400, validationErrors);
        return;
      }

      // Validar estado si se proporciona
      if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await PermissionService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear permiso', 400);
        return;
      }

      successResponse(res, result.data, 'Permiso creado exitosamente', 201);
    } catch (error) {
      console.error('Error en PermissionController.create:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar permiso
   * PUT /api/permissions/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdatePermissionDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de permiso inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar permiso:', JSON.stringify(data, null, 2));

      // Validar estado si se proporciona
      if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await PermissionService.update(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar permiso', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, result.data, 'Permiso actualizado exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.update:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar permiso
   * DELETE /api/permissions/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de permiso inválido', 400);
        return;
      }

      const result = await PermissionService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar permiso', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, null, 'Permiso eliminado exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.delete:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Cambiar estado del permiso
   * PATCH /api/permissions/:id/estado
   */
  static async changeEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de permiso inválido', 400);
        return;
      }

      if (!estado || !['activo', 'inactivo'].includes(estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await PermissionService.changeEstado(id, estado as EstadoGeneral);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al cambiar estado del permiso', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, result.data, 'Estado del permiso actualizado exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.changeEstado:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener categorías de permisos
   * GET /api/permissions/categorias
   */
  static async getCategorias(req: Request, res: Response): Promise<void> {
    try {
      const result = await PermissionService.getCategorias();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener categorías', 500);
        return;
      }

      successResponse(res, result.data, 'Categorías obtenidas exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getCategorias:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener recursos de permisos
   * GET /api/permissions/recursos
   */
  static async getRecursos(req: Request, res: Response): Promise<void> {
    try {
      const result = await PermissionService.getRecursos();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener recursos', 500);
        return;
      }

      successResponse(res, result.data, 'Recursos obtenidos exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getRecursos:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener acciones de permisos
   * GET /api/permissions/acciones
   */
  static async getAcciones(req: Request, res: Response): Promise<void> {
    try {
      const result = await PermissionService.getAcciones();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener acciones', 500);
        return;
      }

      successResponse(res, result.data, 'Acciones obtenidas exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getAcciones:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de permisos
   * GET /api/permissions/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await PermissionService.getStats();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener estadísticas', 500);
        return;
      }

      successResponse(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getStats:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener permisos agrupados por categoría
   * GET /api/permissions/grouped
   */
  static async getGroupedByCategory(req: Request, res: Response): Promise<void> {
    try {
      const result = await PermissionService.getGroupedByCategory();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener permisos agrupados', 500);
        return;
      }

      successResponse(res, result.data, 'Permisos agrupados obtenidos exitosamente');
    } catch (error) {
      console.error('Error en PermissionController.getGroupedByCategory:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}
