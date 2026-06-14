import {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioFilters
} from '../types';
import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams
} from '../config/api';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de usuarios
 */
class UsuarioService {
  private static readonly BASE_PATH = '/usuarios';

  /**
   * Obtener todos los usuarios con filtros opcionales
   */
  static async getAll(filters?: UsuarioFilters): Promise<{
    usuarios: Usuario[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      logger.debug('Obteniendo usuarios con filtros:', filters);

      const queryParams = buildQueryParams(filters || {});
      const url = queryParams ? `${this.BASE_PATH}?${queryParams}` : this.BASE_PATH;

      logger.debug('URL construida para usuarios:', url);
      logger.debug('Query params:', queryParams);

      const response = await apiClient.get<PaginatedResponse<Usuario>>(url);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener usuarios');
      }

      // Convertir fechas de string a Date
      const usuarios = response.data.data.map(usuario => ({
        ...usuario,
        createdAt: new Date(usuario.createdAt),
        updatedAt: new Date(usuario.updatedAt),
        ultimoAcceso: usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso) : undefined
      }));

      logger.debug(`Usuarios obtenidos: ${usuarios.length}`);

      return {
        usuarios,
        total: response.data.pagination?.total || usuarios.length,
        pagination: response.data.pagination || {
          page: 1,
          limit: usuarios.length,
          total: usuarios.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      logger.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getById(id: string): Promise<Usuario> {
    try {
      logger.debug('Obteniendo usuario por ID:', id);

      const response = await apiClient.get<ApiResponse<Usuario>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener usuario');
      }

      // Convertir fechas de string a Date
      const usuario = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        ultimoAcceso: response.data.data.ultimoAcceso ? new Date(response.data.data.ultimoAcceso) : undefined
      };

      logger.debug('Usuario obtenido:', usuario);
      return usuario;
    } catch (error) {
      logger.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios activos (para selects y formularios)
   */
  static async getActivos(): Promise<Usuario[]> {
    try {
      logger.debug('Obteniendo usuarios activos');

      const response = await apiClient.get<ApiResponse<Usuario[]>>(`${this.BASE_PATH}/activos`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener usuarios activos');
      }

      // Convertir fechas de string a Date
      const usuarios = response.data.data.map(usuario => ({
        ...usuario,
        createdAt: new Date(usuario.createdAt),
        updatedAt: new Date(usuario.updatedAt),
        ultimoAcceso: usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso) : undefined
      }));

      logger.debug(`Usuarios activos obtenidos: ${usuarios.length}`);
      return usuarios;
    } catch (error) {
      logger.error('Error al obtener usuarios activos:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario
   */
  static async create(data: CreateUsuarioDto): Promise<Usuario> {
    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...data };

      // Limpiar campos vacíos opcionales
      Object.keys(cleanData).forEach(key => {
        const value = (cleanData as any)[key];
        if (value === undefined || value === null || value === '') {
          delete (cleanData as any)[key];
        }
      });

      logger.debug('Creando usuario', { data: { ...cleanData, password: '[OCULTA]' } });

      const response = await apiClient.post<ApiResponse<Usuario>>(this.BASE_PATH, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear usuario');
      }

      // Convertir fechas de string a Date
      const usuario = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        ultimoAcceso: response.data.data.ultimoAcceso ? new Date(response.data.data.ultimoAcceso) : undefined
      };

      logger.debug('Usuario creado exitosamente:', usuario);
      return usuario;
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  static async update(id: string, data: UpdateUsuarioDto): Promise<Usuario> {
    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...data };

      // Limpiar campos vacíos opcionales
      Object.keys(cleanData).forEach(key => {
        const value = (cleanData as any)[key];
        if (value === undefined || value === null || value === '') {
          delete (cleanData as any)[key];
        }
      });

      logger.debug('Actualizando usuario', { id, data: cleanData });

      const response = await apiClient.put<ApiResponse<Usuario>>(`${this.BASE_PATH}/${id}`, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar usuario');
      }

      // Convertir fechas de string a Date
      const usuario = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        ultimoAcceso: response.data.data.ultimoAcceso ? new Date(response.data.data.ultimoAcceso) : undefined
      };

      logger.debug('Usuario actualizado exitosamente:', usuario);
      return usuario;
    } catch (error) {
      logger.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  static async delete(id: string): Promise<boolean> {
    try {
      logger.debug('Servicio - Eliminando usuario:', id);

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      logger.debug('Servicio - Respuesta del servidor:', {
        status: response.status,
        success: response.data.success,
        error: response.data.error
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar usuario');
      }

      logger.debug('Servicio - Usuario eliminado exitosamente');
      return true;
    } catch (error) {
      logger.error('Servicio - Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña de usuario
   */
  static async changePassword(id: string, data: ChangePasswordDto): Promise<void> {
    try {
      logger.debug('Cambiando contraseña de usuario:', id);

      const response = await apiClient.post<ApiResponse<void>>(
        `${this.BASE_PATH}/${id}/change-password`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al cambiar contraseña');
      }

      logger.debug('Contraseña cambiada exitosamente');
    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de usuario
   */
  static async changeEstado(id: string, estado: 'activo' | 'inactivo'): Promise<Usuario> {
    try {
      logger.debug('Cambiando estado de usuario:', { id, estado });

      const response = await apiClient.patch<ApiResponse<Usuario>>(
        `${this.BASE_PATH}/${id}/estado`,
        { estado }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al cambiar estado');
      }

      // Convertir fechas de string a Date
      const usuario = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        ultimoAcceso: response.data.data.ultimoAcceso ? new Date(response.data.data.ultimoAcceso) : undefined
      };

      logger.debug('Estado cambiado exitosamente:', usuario);
      return usuario;
    } catch (error) {
      logger.error('Error al cambiar estado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getStats(): Promise<any> {
    try {
      logger.debug('Obteniendo estadísticas de usuarios');

      const response = await apiClient.get<ApiResponse<any>>(`${this.BASE_PATH}/stats`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }

      logger.debug('Estadísticas obtenidas:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

export default UsuarioService;
