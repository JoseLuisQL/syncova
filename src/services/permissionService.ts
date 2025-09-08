import {
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionFilters,
  PermissionsResponse,
  PermissionStats
} from '../types';
import {
  apiClient,
  ApiResponse,
  PaginatedResponse
} from '../config/api';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de permisos
 */
export class PermissionService {
  private static readonly BASE_PATH = '/permissions';

  /**
   * Obtener todos los permisos con filtros opcionales
   */
  static async getAll(filters?: PermissionFilters): Promise<{
    permissions: Permission[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      logger.debug('Obteniendo permisos con filtros:', filters);

      const queryParams = new URLSearchParams();
      
      if (filters?.estado && filters.estado !== 'todos') {
        queryParams.append('estado', filters.estado);
      }
      
      if (filters?.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters?.categoria) {
        queryParams.append('categoria', filters.categoria);
      }
      
      if (filters?.recurso) {
        queryParams.append('recurso', filters.recurso);
      }
      
      if (filters?.accion) {
        queryParams.append('accion', filters.accion);
      }
      
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const url = queryParams.toString() ? `${this.BASE_PATH}?${queryParams}` : this.BASE_PATH;
      
      logger.debug('URL construida para permisos:', url);

      const response = await apiClient.get<ApiResponse<{ permissions: Permission[], total: number }>>(url);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener permisos');
      }

      const { permissions, total } = response.data.data;
      const currentPage = filters?.page || 1;
      const limit = filters?.limit || 100;
      const totalPages = Math.ceil(total / limit);

      // Convertir fechas de string a Date
      const permissionsWithDates = permissions.map(permission => ({
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      }));

      return {
        permissions: permissionsWithDates,
        total,
        currentPage,
        totalPages,
      };
    } catch (error) {
      logger.error('Error al obtener permisos:', error);
      throw error;
    }
  }

  /**
   * Obtener un permiso por ID
   */
  static async getById(id: string): Promise<Permission> {
    try {
      logger.debug('Obteniendo permiso por ID:', { id });

      const response = await apiClient.get<ApiResponse<Permission>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener permiso');
      }

      const permission = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      };
    } catch (error) {
      logger.error('Error al obtener permiso por ID:', error);
      throw error;
    }
  }

  /**
   * Obtener un permiso por código
   */
  static async getByCodigo(codigo: string): Promise<Permission> {
    try {
      logger.debug('Obteniendo permiso por código:', codigo);

      const response = await apiClient.get<ApiResponse<Permission>>(`${this.BASE_PATH}/codigo/${codigo}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener permiso');
      }

      const permission = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      };
    } catch (error) {
      logger.error('Error al obtener permiso por código:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo permiso
   */
  static async create(data: CreatePermissionDto): Promise<Permission> {
    try {
      logger.debug('Creando permiso', { data });

      const response = await apiClient.post<ApiResponse<Permission>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear permiso');
      }

      const permission = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      };
    } catch (error) {
      logger.error('Error al crear permiso:', error);
      throw error;
    }
  }

  /**
   * Actualizar permiso
   */
  static async update(id: string, data: UpdatePermissionDto): Promise<Permission> {
    try {
      logger.debug('Actualizando permiso', { id, data });

      const response = await apiClient.put<ApiResponse<Permission>>(`${this.BASE_PATH}/${id}`, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar permiso');
      }

      const permission = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      };
    } catch (error) {
      logger.error('Error al actualizar permiso:', error);
      throw error;
    }
  }

  /**
   * Eliminar permiso
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando permiso', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar permiso');
      }
    } catch (error) {
      logger.error('Error al eliminar permiso:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado del permiso
   */
  static async changeEstado(id: string, estado: 'activo' | 'inactivo'): Promise<Permission> {
    try {
      logger.debug('Cambiando estado del permiso', { id, estado });

      const response = await apiClient.patch<ApiResponse<Permission>>(`${this.BASE_PATH}/${id}/estado`, { estado });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al cambiar estado del permiso');
      }

      const permission = response.data.data;

      // Convertir fechas de string a Date
      return {
        ...permission,
        createdAt: new Date(permission.createdAt),
        updatedAt: new Date(permission.updatedAt),
      };
    } catch (error) {
      logger.error('Error al cambiar estado del permiso:', error);
      throw error;
    }
  }

  /**
   * Obtener categorías de permisos
   */
  static async getCategorias(): Promise<string[]> {
    try {
      logger.debug('Obteniendo categorías de permisos');

      const response = await apiClient.get<ApiResponse<string[]>>(`${this.BASE_PATH}/categorias`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener categorías');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtener recursos de permisos
   */
  static async getRecursos(): Promise<string[]> {
    try {
      logger.debug('Obteniendo recursos de permisos');

      const response = await apiClient.get<ApiResponse<string[]>>(`${this.BASE_PATH}/recursos`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener recursos');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener recursos:', error);
      throw error;
    }
  }

  /**
   * Obtener acciones de permisos
   */
  static async getAcciones(): Promise<string[]> {
    try {
      logger.debug('Obteniendo acciones de permisos');

      const response = await apiClient.get<ApiResponse<string[]>>(`${this.BASE_PATH}/acciones`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener acciones');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener acciones:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de permisos
   */
  static async getStats(): Promise<PermissionStats> {
    try {
      logger.debug('Obteniendo estadísticas de permisos');

      const response = await apiClient.get<ApiResponse<PermissionStats>>(`${this.BASE_PATH}/stats`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas de permisos:', error);
      throw error;
    }
  }

  /**
   * Obtener permisos agrupados por categoría
   */
  static async getGroupedByCategory(): Promise<Record<string, Permission[]>> {
    try {
      logger.debug('Obteniendo permisos agrupados por categoría');

      const response = await apiClient.get<ApiResponse<Record<string, Permission[]>>>(`${this.BASE_PATH}/grouped`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener permisos agrupados');
      }

      const groupedPermissions = response.data.data;

      // Convertir fechas de string a Date para todos los permisos
      const result: Record<string, Permission[]> = {};

      for (const [category, permissions] of Object.entries(groupedPermissions)) {
        result[category] = permissions.map(permission => ({
          ...permission,
          createdAt: new Date(permission.createdAt),
          updatedAt: new Date(permission.updatedAt),
        }));
      }

      return result;
    } catch (error) {
      logger.error('Error al obtener permisos agrupados:', error);
      throw error;
    }
  }
}
