import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleFilters,
  RolesResponse,
  RoleStats,
  Permission,
  RolePermissionAssignment
} from '../types';
import {
  apiClient,
  ApiResponse,
  PaginatedResponse
} from '../config/api';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de roles
 */
export class RoleService {
  private static readonly BASE_PATH = '/roles';

  /**
   * Obtener todos los roles con filtros opcionales
   */
  static async getAll(filters?: RoleFilters): Promise<{
    roles: Role[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      logger.debug('Obteniendo roles con filtros:', filters);

      const queryParams = new URLSearchParams();
      
      if (filters?.estado && filters.estado !== 'todos') {
        queryParams.append('estado', filters.estado);
      }
      
      if (filters?.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters?.includePermissions) {
        queryParams.append('includePermissions', 'true');
      }
      
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const url = queryParams.toString() ? `${this.BASE_PATH}?${queryParams}` : this.BASE_PATH;
      
      logger.debug('URL construida para roles:', url);

      const response = await apiClient.get<ApiResponse<{ roles: Role[], total: number }>>(url);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener roles');
      }

      const { roles, total } = response.data.data;
      const currentPage = filters?.page || 1;
      const limit = filters?.limit || 50;
      const totalPages = Math.ceil(total / limit);

      // Convertir fechas de string a Date
      const rolesWithDates = roles.map(role => ({
        ...role,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
        permissions: role.permissions?.map(permission => ({
          ...permission,
          createdAt: new Date(permission.createdAt),
          updatedAt: new Date(permission.updatedAt),
        }))
      }));

      return {
        roles: rolesWithDates,
        total,
        currentPage,
        totalPages,
      };
    } catch (error) {
      logger.error('Error al obtener roles:', error);
      throw error;
    }
  }

  /**
   * Obtener un rol por ID
   */
  static async getById(id: string, includePermissions = false): Promise<Role> {
    try {
      const url = includePermissions 
        ? `${this.BASE_PATH}/${id}?includePermissions=true`
        : `${this.BASE_PATH}/${id}`;

      logger.debug('Obteniendo rol por ID:', { id, includePermissions });

      const response = await apiClient.get<ApiResponse<Role>>(url);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener rol');
      }

      const role = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...role,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
        permissions: role.permissions?.map(permission => ({
          ...permission,
          createdAt: new Date(permission.createdAt),
          updatedAt: new Date(permission.updatedAt),
        }))
      };
    } catch (error) {
      logger.error('Error al obtener rol por ID:', error);
      throw error;
    }
  }

  /**
   * Obtener un rol por código
   */
  static async getByCodigo(codigo: string): Promise<Role> {
    try {
      logger.debug('Obteniendo rol por código:', codigo);

      const response = await apiClient.get<ApiResponse<Role>>(`${this.BASE_PATH}/codigo/${codigo}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener rol');
      }

      const role = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...role,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
      };
    } catch (error) {
      logger.error('Error al obtener rol por código:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo rol
   */
  static async create(data: CreateRoleDto): Promise<Role> {
    try {
      logger.debug('Creando rol', { data });

      const response = await apiClient.post<ApiResponse<Role>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear rol');
      }

      const role = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...role,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
      };
    } catch (error) {
      logger.error('Error al crear rol:', error);
      throw error;
    }
  }

  /**
   * Actualizar rol
   */
  static async update(id: string, data: UpdateRoleDto): Promise<Role> {
    try {
      logger.debug('Actualizando rol', { id, data });

      const response = await apiClient.put<ApiResponse<Role>>(`${this.BASE_PATH}/${id}`, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar rol');
      }

      const role = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...role,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
      };
    } catch (error) {
      logger.error('Error al actualizar rol:', error);
      throw error;
    }
  }

  /**
   * Eliminar rol
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando rol', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar rol');
      }
    } catch (error) {
      logger.error('Error al eliminar rol:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado del rol
   */
  static async changeEstado(id: string, estado: 'activo' | 'inactivo'): Promise<Role> {
    try {
      logger.debug('Cambiando estado del rol', { id, estado });

      const response = await apiClient.patch<ApiResponse<Role>>(`${this.BASE_PATH}/${id}/estado`, { estado });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al cambiar estado del rol');
      }

      const role = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...role,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
      };
    } catch (error) {
      logger.error('Error al cambiar estado del rol:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  static async getStats(): Promise<RoleStats> {
    try {
      logger.debug('Obteniendo estadísticas de roles');

      const response = await apiClient.get<ApiResponse<RoleStats>>(`${this.BASE_PATH}/stats`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas de roles:', error);
      throw error;
    }
  }

  /**
   * Asignar permisos a un rol
   */
  static async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      logger.debug('Asignando permisos a rol', { roleId, permissionIds });

      const response = await apiClient.post<ApiResponse<void>>(
        `${this.BASE_PATH}/${roleId}/permissions`,
        { permissionIds }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al asignar permisos');
      }
    } catch (error) {
      logger.error('Error al asignar permisos:', error);
      throw error;
    }
  }

  /**
   * Obtener permisos de un rol
   */
  static async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      logger.debug('Obteniendo permisos del rol', { roleId });

      const response = await apiClient.get<ApiResponse<Permission[]>>(`${this.BASE_PATH}/${roleId}/permissions`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener permisos del rol');
      }

      const permissions = response.data.data;

      // Convertir fechas de string a Date
      return permissions.map(permission => ({
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      }));
    } catch (error) {
      logger.error('Error al obtener permisos del rol:', error);
      throw error;
    }
  }
}
