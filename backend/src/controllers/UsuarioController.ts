import { Request, Response } from 'express';
import { UsuarioService } from '@/services/UsuarioService';
import { RoleService } from '@/services/RoleService';
import { CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, EstadoGeneral, RolUsuario } from '@/types';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/response';
import { validateRequired, validateEnum, validateUUID } from '@/utils/validation';

/**
 * Controlador para gestión de usuarios
 */
export class UsuarioController {
  /**
   * Obtener todos los usuarios
   * GET /api/usuarios
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        estado = 'todos',
        search,
        rol = 'todos',
        establecimientoId,
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

      if (estado && !['activo', 'inactivo', 'todos'].includes(estado as string)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      if (rol && !['administrador', 'coordinador', 'responsable_acopio', 'operador', 'todos'].includes(rol as string)) {
        errorResponse(res, 'Rol inválido', 400);
        return;
      }

      if (establecimientoId && !validateUUID(establecimientoId as string)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const result = await UsuarioService.getAll({
        estado: estado as EstadoGeneral | 'todos',
        search: search as string,
        rol: rol as RolUsuario | 'todos',
        establecimientoId: establecimientoId as string,
        page: pageNum,
        limit: limitNum
      });

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener usuarios', 500);
        return;
      }

      const { usuarios, total } = result.data!;

      paginatedResponse(res, {
        data: usuarios,
        page: pageNum,
        limit: limitNum,
        total,
        message: 'Usuarios obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error en UsuarioController.getAll:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/usuarios/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de usuario inválido', 400);
        return;
      }

      const result = await UsuarioService.getById(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener usuario', result.error?.includes('no encontrado') ? 404 : 500);
        return;
      }

      successResponse(res, result.data, 'Usuario obtenido exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.getById:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener usuarios activos
   * GET /api/usuarios/activos
   */
  static async getActivos(req: Request, res: Response): Promise<void> {
    try {
      const result = await UsuarioService.getActivos();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener usuarios activos', 500);
        return;
      }

      successResponse(res, result.data, 'Usuarios activos obtenidos exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.getActivos:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener usuarios por rol
   * GET /api/usuarios/rol/:rol
   */
  static async getByRol(req: Request, res: Response): Promise<void> {
    try {
      const { rol } = req.params;

      if (!['administrador', 'coordinador', 'responsable_acopio', 'operador'].includes(rol)) {
        errorResponse(res, 'Rol inválido', 400);
        return;
      }

      const result = await UsuarioService.getByRol(rol as RolUsuario);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener usuarios por rol', 500);
        return;
      }

      successResponse(res, result.data, `Usuarios con rol ${rol} obtenidos exitosamente`);
    } catch (error) {
      console.error('Error en UsuarioController.getByRol:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * GET /api/usuarios/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await UsuarioService.getStats();

      if (!result.success) {
        errorResponse(res, result.error || 'Error al obtener estadísticas de usuarios', 500);
        return;
      }

      successResponse(res, result.data, 'Estadísticas de usuarios obtenidas exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.getStats:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crear nuevo usuario
   * POST /api/usuarios
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUsuarioDto = req.body;

      console.log('📝 Datos recibidos para crear usuario:', JSON.stringify({
        ...data,
        password: '[OCULTA]'
      }, null, 2));

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.nombres, 'nombres'),
        validateRequired(data.apellidos, 'apellidos'),
        validateRequired(data.email, 'email'),
        validateRequired(data.usuario, 'usuario'),
        validateRequired(data.password, 'password'),
        validateRequired(data.rol, 'rol')
      ].filter(Boolean);

      if (validationErrors.length > 0) {
        errorResponse(res, 'Datos inválidos', 400, validationErrors);
        return;
      }

      // Validar rol dinámicamente contra la base de datos
      try {
        const roleResult = await RoleService.getByCodigo(data.rol);
        if (!roleResult.success || !roleResult.data || roleResult.data.estado !== 'activo') {
          errorResponse(res, 'Rol inválido o inactivo', 400);
          return;
        }
      } catch (error) {
        console.error('Error al validar rol:', error);
        errorResponse(res, 'Rol inválido', 400);
        return;
      }

      // Validar establecimiento si se proporciona
      if (data.establecimientoId && !validateUUID(data.establecimientoId)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const result = await UsuarioService.create(data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al crear usuario', 400);
        return;
      }

      console.log('✅ Usuario creado exitosamente:', result.data?.id);
      successResponse(res, result.data, 'Usuario creado exitosamente', 201);
    } catch (error) {
      console.error('Error en UsuarioController.create:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar usuario
   * PUT /api/usuarios/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateUsuarioDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de usuario inválido', 400);
        return;
      }

      console.log('📝 Datos recibidos para actualizar usuario:', JSON.stringify(data, null, 2));

      // Validar rol dinámicamente si se proporciona
      if (data.rol) {
        try {
          const roleResult = await RoleService.getByCodigo(data.rol);
          if (!roleResult.success || !roleResult.data || roleResult.data.estado !== 'activo') {
            errorResponse(res, 'Rol inválido o inactivo', 400);
            return;
          }
        } catch (error) {
          console.error('Error al validar rol:', error);
          errorResponse(res, 'Rol inválido', 400);
          return;
        }
      }

      // Validar estado si se proporciona
      if (data.estado && !['activo', 'inactivo'].includes(data.estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      // Validar establecimiento si se proporciona
      if (data.establecimientoId && !validateUUID(data.establecimientoId)) {
        errorResponse(res, 'ID de establecimiento inválido', 400);
        return;
      }

      const result = await UsuarioService.update(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar usuario', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      console.log('✅ Usuario actualizado exitosamente:', id);
      successResponse(res, result.data, 'Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.update:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Eliminar usuario
   * DELETE /api/usuarios/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de usuario inválido', 400);
        return;
      }

      const result = await UsuarioService.delete(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al eliminar usuario', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      console.log('✅ Usuario eliminado exitosamente:', id);
      successResponse(res, null, 'Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.delete:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Cambiar contraseña
   * POST /api/usuarios/:id/change-password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: ChangePasswordDto = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de usuario inválido', 400);
        return;
      }

      // Validaciones de campos requeridos
      const validationErrors = [
        validateRequired(data.newPassword, 'newPassword')
      ].filter(Boolean);

      if (validationErrors.length > 0) {
        errorResponse(res, 'Datos inválidos', 400, validationErrors);
        return;
      }

      const result = await UsuarioService.changePassword(id, data);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al cambiar contraseña', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      console.log('✅ Contraseña cambiada exitosamente para usuario:', id);
      successResponse(res, null, 'Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.changePassword:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Cambiar estado del usuario
   * PATCH /api/usuarios/:id/estado
   */
  static async changeEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de usuario inválido', 400);
        return;
      }

      if (!estado || !['activo', 'inactivo'].includes(estado)) {
        errorResponse(res, 'Estado inválido', 400);
        return;
      }

      const result = await UsuarioService.changeEstado(id, estado as EstadoGeneral);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al cambiar estado del usuario', result.error?.includes('no encontrado') ? 404 : 400);
        return;
      }

      console.log('✅ Estado del usuario cambiado exitosamente:', id, 'a', estado);
      successResponse(res, result.data, `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error('Error en UsuarioController.changeEstado:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualizar último acceso
   * POST /api/usuarios/:id/ultimo-acceso
   */
  static async updateUltimoAcceso(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!validateUUID(id)) {
        errorResponse(res, 'ID de usuario inválido', 400);
        return;
      }

      const result = await UsuarioService.updateUltimoAcceso(id);

      if (!result.success) {
        errorResponse(res, result.error || 'Error al actualizar último acceso', 500);
        return;
      }

      successResponse(res, null, 'Último acceso actualizado exitosamente');
    } catch (error) {
      console.error('Error en UsuarioController.updateUltimoAcceso:', error);
      errorResponse(res, 'Error interno del servidor', 500);
    }
  }
}
