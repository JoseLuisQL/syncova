import { Request, Response } from 'express';
import { RoleService, CreateRoleDto, UpdateRoleDto } from '@/services/RoleService';
import { successResponse, errorResponse } from '@/utils/response';
import { validateRequired, validateUUID } from '@/utils/validation';
import { EstadoGeneral } from '@prisma/client';

/**
 * Controlador para gestión de roles
 */
export class RoleController {
  /**
   * Obtener todos los roles con filtros opcionales
   * GET /api/roles
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { estado, search, includePermissions, page, limit } = req.query;

      // Validar parámetros
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 50;

      if (pageNum < 1) {
        errorResponse(res, 'El número de página debe ser mayor a 0', 400);
        return;
      }

      if (limitNum < 1 || limitNum > 100) {
        errorResponse(res, 'El límite debe estar entre 1 y 100', 400);
        return;
      }

      if (estado && !['activo', 'inactivo', 'todos'].includes(estado as string)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await RoleService.getAll({
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        includePermissions: includePermissions === 'true',
        page: pageNum,
        limit: limitNum
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener roles', 500);
        return;
      }

      successResponse(res, result.data, 'Roles obtenidos exitosamente');
    } catch (error) {
      console.error('Error en RoleController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener un rol por ID
   * GET /api/roles/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includePermissions } = req.query;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de rol inválido', 400);
        return;
      }

      const result = await RoleService.getById(id, includePermissions === 'true');

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener rol', result.error?.includes('no encontrado') ? 404 : 500);
        return;
      }

      successResponse(res, result.data, 'Rol obtenido exitosamente');
    } catch (error) {
      console.error('Error en RoleController.getById:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener un rol por código
   * GET /api/roles/codigo/:codigo
   */
  static async getByCodigo(req: Request, res: Response): Promise<void> {
    try {
      const { codigo } = req.params;

      if (!codigo) {
        errorResponse(res, 'Código de rol requerido', 400);
        return;
      }

      const result = await RoleService.getByCodigo(codigo);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener rol', result.error?.includes('no encontrado') ? 404 : 500);
        return;
      }

      successResponse(res, result.data, 'Rol obtenido exitosamente');
    } catch (error) {
      console.error('Error en RoleController.getByCodigo:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo rol
   * POST /api/roles
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateRoleDto = req.body;

      console.log('📝 Datos recibidos para crear rol:', JSON.stringify(data, null, 2));

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.nombre, 'nombre'),
        validateRequired(data.codigo, 'codigo')
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

      const result = await RoleService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear rol', 400);
        return;
      }

      successResponse(res, result.data, 'Rol creado exitosamente', 201);
    } catch (error) {
      console.error('Error en RoleController.create:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar rol
   * PUT /api/roles/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateRoleDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de rol inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar rol:', JSON.stringify(data, null, 2));

      // Validar estado si se proporciona
      if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await RoleService.update(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar rol', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, result.data, 'Rol actualizado exitosamente');
    } catch (error) {
      console.error('Error en RoleController.update:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar rol
   * DELETE /api/roles/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de rol inválido', 400);
        return;
      }

      const result = await RoleService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar rol', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, null, 'Rol eliminado exitosamente');
    } catch (error) {
      console.error('Error en RoleController.delete:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Cambiar estado del rol
   * PATCH /api/roles/:id/estado
   */
  static async changeEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de rol inválido', 400);
        return;
      }

      if (!estado || !['activo', 'inactivo'].includes(estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await RoleService.changeEstado(id, estado as EstadoGeneral);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al cambiar estado del rol', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, result.data, 'Estado del rol actualizado exitosamente');
    } catch (error) {
      console.error('Error en RoleController.changeEstado:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de roles
   * GET /api/roles/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await RoleService.getStats();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener estadísticas', 500);
        return;
      }

      successResponse(res, result.data, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      console.error('Error en RoleController.getStats:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Asignar permisos a un rol
   * POST /api/roles/:id/permissions
   */
  static async assignPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de rol inválido', 400);
        return;
      }

      if (!Array.isArray(permissionIds)) {
        errorResponse(res, 'Los IDs de permisos deben ser un array', 400);
        return;
      }

      // Validar que todos los IDs sean UUIDs válidos
      const invalidIds = permissionIds.filter(permId => !validateUUID(permId));
      if (invalidIds.length > 0) {
        errorResponse(res, 'Uno o más IDs de permisos son inválidos', 400);
        return;
      }

      const result = await RoleService.assignPermissions(id, permissionIds);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al asignar permisos', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      successResponse(res, null, 'Permisos asignados exitosamente');
    } catch (error) {
      console.error('Error en RoleController.assignPermissions:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener permisos de un rol
   * GET /api/roles/:id/permissions
   */
  static async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de rol inválido', 400);
        return;
      }

      const result = await RoleService.getRolePermissions(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener permisos del rol', 500);
        return;
      }

      successResponse(res, result.data, 'Permisos del rol obtenidos exitosamente');
    } catch (error) {
      console.error('Error en RoleController.getRolePermissions:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}
