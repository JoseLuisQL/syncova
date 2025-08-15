import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import {
  Establecimiento,
  CreateEstablecimientoDto,
  UpdateEstablecimientoDto,
  EstablecimientoFilters,
  CentroAcopio
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de establecimientos
 * Conecta el frontend con el backend API
 */
export class EstablecimientoService {
  private static readonly BASE_PATH = '/establecimientos';

  /**
   * Obtener todos los establecimientos con filtros opcionales
   */
  static async getAll(filters?: EstablecimientoFilters): Promise<{
    establecimientos: Establecimiento[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryString = filters ? buildQueryParams(filters) : '';
      const url = `${this.BASE_PATH}${queryString}`;

      logger.debug('Obteniendo establecimientos', { url, filters });

      const response = await apiClient.get<PaginatedResponse<Establecimiento>>(url);

      logger.debug('Respuesta del backend recibida', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        pagination: response.data.pagination
      });

      if (response.data.success && response.data.data) {
        const establecimientos = response.data.data;
        const { total, page, limit, totalPages } = response.data.pagination;

        logger.info(`Establecimientos obtenidos: ${establecimientos.length} de ${total}`);

        return {
          establecimientos: establecimientos || [],
          total,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        };
      } else {
        throw new Error('Error al obtener establecimientos');
      }
    } catch (error) {
      logger.error('Error en getAll establecimientos', error);
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener establecimiento por ID
   */
  static async getById(id: string): Promise<Establecimiento> {
    try {
      const response = await apiClient.get<ApiResponse<Establecimiento>>(`${this.BASE_PATH}/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Establecimiento no encontrado');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener establecimiento por código
   */
  static async getByCodigo(codigo: string): Promise<Establecimiento> {
    try {
      const response = await apiClient.get<ApiResponse<Establecimiento>>(`${this.BASE_PATH}/codigo/${codigo}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Establecimiento no encontrado');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener todos los centros de acopio
   */
  static async getCentrosAcopio(): Promise<CentroAcopio[]> {
    try {
      logger.debug('Obteniendo centros de acopio');

      const response = await apiClient.get<ApiResponse<CentroAcopio[]>>(`${this.BASE_PATH}/centros-acopio`);

      if (response.data.success && response.data.data) {
        logger.info(`Centros de acopio obtenidos: ${response.data.data.length}`);
        return response.data.data;
      } else {
        throw new Error('Error al obtener centros de acopio');
      }
    } catch (error) {
      logger.error('Error en getCentrosAcopio', error);
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener establecimientos por centro de acopio
   */
  static async getByCentroAcopio(centroAcopioId: string): Promise<Establecimiento[]> {
    try {
      const response = await apiClient.get<ApiResponse<Establecimiento[]>>(`${this.BASE_PATH}/centro-acopio/${centroAcopioId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Error al obtener establecimientos del centro de acopio');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Crear nuevo establecimiento
   */
  static async create(data: CreateEstablecimientoDto): Promise<Establecimiento> {
    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...data };

      // Para centros de acopio, asegurar que no se envíe centroAcopioId
      if (cleanData.tipo === 'centro_acopio') {
        delete cleanData.centroAcopioId;
      }

      // El campo estado NO se permite en creación (solo en actualización)
      delete (cleanData as any).estado;

      // Limpiar campos vacíos opcionales
      if (cleanData.telefono === '') {
        delete cleanData.telefono;
      }

      logger.debug('Creando establecimiento', cleanData);

      const response = await apiClient.post<ApiResponse<Establecimiento>>(this.BASE_PATH, cleanData);

      if (response.data.success && response.data.data) {
        logger.info(`Establecimiento creado: ${response.data.data.nombre}`);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al crear establecimiento');
      }
    } catch (error) {
      logger.error('Error en create establecimiento', error);
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Actualizar establecimiento
   */
  static async update(id: string, data: UpdateEstablecimientoDto): Promise<Establecimiento> {
    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...data };

      // Para centros de acopio, asegurar que no se envíe centroAcopioId
      if (cleanData.tipo === 'centro_acopio') {
        delete cleanData.centroAcopioId;
      }

      // Limpiar campos vacíos opcionales
      if (cleanData.telefono === '') {
        delete cleanData.telefono;
      }

      // Para actualización, limpiar campos undefined o vacíos
      Object.keys(cleanData).forEach(key => {
        const value = (cleanData as any)[key];
        if (value === undefined || value === null || value === '') {
          delete (cleanData as any)[key];
        }
      });

      logger.debug('Actualizando establecimiento', { id, data: cleanData });

      const response = await apiClient.put<ApiResponse<Establecimiento>>(`${this.BASE_PATH}/${id}`, cleanData);

      if (response.data.success && response.data.data) {
        logger.info(`Establecimiento actualizado: ${response.data.data.nombre}`);
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al actualizar establecimiento');
      }
    } catch (error) {
      logger.error('Error en update establecimiento', error);
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Eliminar establecimiento
   */
  static async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(`${this.BASE_PATH}/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar establecimiento');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Cambiar estado de establecimiento (activar/desactivar)
   */
  static async toggleEstado(id: string, estado: 'activo' | 'inactivo'): Promise<Establecimiento> {
    try {
      const response = await apiClient.patch<ApiResponse<Establecimiento>>(`${this.BASE_PATH}/${id}/estado`, { estado });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al cambiar estado del establecimiento');
      }
    } catch (error) {
      const errorMessage = handleApiError(error as AxiosError);
      throw new Error(errorMessage);
    }
  }

  /**
   * Validar si un código de establecimiento está disponible
   */
  static async validateCodigo(codigo: string, excludeId?: string): Promise<boolean> {
    try {
      const queryParams = excludeId ? `?excludeId=${excludeId}` : '';
      const response = await apiClient.get<ApiResponse<{ available: boolean }>>(`${this.BASE_PATH}/validate-codigo/${codigo}${queryParams}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.available;
      } else {
        return false;
      }
    } catch (error) {
      // Si hay error, asumimos que el código no está disponible
      return false;
    }
  }
}

export default EstablecimientoService;
