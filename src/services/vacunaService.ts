import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import {
  Vacuna,
  CreateVacunaDto,
  UpdateVacunaDto,
  VacunaFilters
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de vacunas
 * Conecta el frontend con el backend API
 */
export class VacunaService {
  private static readonly BASE_PATH = '/vacunas';

  /**
   * Obtener todas las vacunas con filtros opcionales
   */
  static async getAll(filters?: VacunaFilters): Promise<{
    vacunas: Vacuna[];
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
      const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`;

      logger.debug('Obteniendo vacunas', { url, filters });

      const response = await apiClient.get<PaginatedResponse<Vacuna>>(url);

      logger.debug('Respuesta del backend recibida', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        pagination: response.data.pagination
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener vacunas');
      }

      // Convertir fechas de string a Date
      const vacunas = response.data.data.map(vacuna => ({
        ...vacuna,
        createdAt: new Date(vacuna.createdAt),
        updatedAt: new Date(vacuna.updatedAt),
        lotes: vacuna.lotes?.map(lote => ({
          ...lote,
          fechaVencimiento: new Date(lote.fechaVencimiento)
        }))
      }));

      return {
        vacunas,
        total: response.data.pagination.total,
        pagination: {
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }
      };
    } catch (error) {
      logger.error('Error al obtener vacunas:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }

  /**
   * Obtener vacuna por ID
   */
  static async getById(id: string): Promise<Vacuna> {
    try {
      logger.debug('Obteniendo vacuna por ID', { id });

      const response = await apiClient.get<ApiResponse<Vacuna>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Vacuna no encontrada');
      }

      // Convertir fechas de string a Date
      const vacuna = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        lotes: response.data.data.lotes?.map(lote => ({
          ...lote,
          fechaVencimiento: new Date(lote.fechaVencimiento)
        }))
      };

      logger.debug('Vacuna obtenida exitosamente', { vacuna });
      return vacuna;
    } catch (error) {
      logger.error('Error al obtener vacuna:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }

  /**
   * Obtener vacunas activas (para selects y formularios)
   */
  static async getActivas(): Promise<Vacuna[]> {
    try {
      logger.debug('Obteniendo vacunas activas');
      console.log('🌐 Llamando a API:', `${this.BASE_PATH}/activas`);

      const response = await apiClient.get<ApiResponse<Vacuna[]>>(`${this.BASE_PATH}/activas`);

      console.log('📡 Respuesta de API vacunas activas:', response.data);

      if (!response.data.success || !response.data.data) {
        console.error('❌ Error en respuesta de API:', response.data.error);
        throw new Error(response.data.error || 'Error al obtener vacunas activas');
      }

      // Convertir fechas de string a Date (solo si existen)
      const vacunas = response.data.data.map(vacuna => ({
        ...vacuna,
        estado: 'activo' as const, // Asegurar que todas las vacunas activas tengan estado 'activo'
        createdAt: vacuna.createdAt ? new Date(vacuna.createdAt) : new Date(),
        updatedAt: vacuna.updatedAt ? new Date(vacuna.updatedAt) : new Date()
      }));

      console.log('✅ Vacunas activas procesadas:', vacunas);
      console.log('✅ Cantidad de vacunas activas:', vacunas.length);

      logger.debug('Vacunas activas obtenidas exitosamente', { count: vacunas.length });
      return vacunas;
    } catch (error) {
      logger.error('Error al obtener vacunas activas:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }

  /**
   * Crear nueva vacuna
   */
  static async create(data: CreateVacunaDto): Promise<Vacuna> {
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

      logger.debug('Creando vacuna', { data: cleanData });

      const response = await apiClient.post<ApiResponse<Vacuna>>(this.BASE_PATH, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear vacuna');
      }

      // Convertir fechas de string a Date
      const vacuna = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Vacuna creada exitosamente', { vacuna });
      return vacuna;
    } catch (error) {
      logger.error('Error al crear vacuna:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }

  /**
   * Actualizar vacuna
   */
  static async update(id: string, data: UpdateVacunaDto): Promise<Vacuna> {
    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...data };

      // Para actualización, limpiar campos undefined o vacíos
      Object.keys(cleanData).forEach(key => {
        const value = (cleanData as any)[key];
        if (value === undefined || value === null || value === '') {
          delete (cleanData as any)[key];
        }
      });

      logger.debug('Actualizando vacuna', { id, data: cleanData });

      const response = await apiClient.put<ApiResponse<Vacuna>>(`${this.BASE_PATH}/${id}`, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar vacuna');
      }

      // Convertir fechas de string a Date
      const vacuna = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Vacuna actualizada exitosamente', { vacuna });
      return vacuna;
    } catch (error) {
      logger.error('Error al actualizar vacuna:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }

  /**
   * Eliminar vacuna
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando vacuna', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar vacuna');
      }

      logger.debug('Vacuna eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar vacuna:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }

  /**
   * Obtener estadísticas de stock de vacunas
   */
  static async getStockStats(vacunaId?: string): Promise<any> {
    try {
      const url = vacunaId 
        ? `${this.BASE_PATH}/stats/stock?vacunaId=${vacunaId}`
        : `${this.BASE_PATH}/stats/stock`;

      logger.debug('Obteniendo estadísticas de stock', { vacunaId });

      const response = await apiClient.get<ApiResponse<any>>(url);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al obtener estadísticas de stock');
      }

      logger.debug('Estadísticas de stock obtenidas exitosamente', { data: response.data.data });
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas de stock:', error);
      
      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }
      
      throw error;
    }
  }
}

export default VacunaService;
