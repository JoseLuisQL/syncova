import {
  Jeringa,
  CreateJeringaDto,
  UpdateJeringaDto,
  JeringaFilters
} from '../types';
import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams
} from '../config/api';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de jeringas
 */
class JeringaService {
  private static readonly BASE_PATH = '/jeringas';

  /**
   * Obtener todas las jeringas con filtros opcionales
   */
  static async getAll(filters?: JeringaFilters): Promise<{
    jeringas: Jeringa[];
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
      const queryString = filters ? buildQueryParams(filters) : '';
      const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`;

      logger.debug('Obteniendo jeringas', { url, filters });

      const response = await apiClient.get<PaginatedResponse<Jeringa>>(url);

      logger.debug('Respuesta del backend recibida', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        pagination: response.data.pagination
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener jeringas');
      }

      // Convertir fechas de string a Date
      const jeringas = response.data.data.map(jeringa => ({
        ...jeringa,
        createdAt: new Date(jeringa.createdAt),
        updatedAt: new Date(jeringa.updatedAt),
        lotes: jeringa.lotes?.map(lote => ({
          ...lote
        }))
      }));

      return {
        jeringas,
        total: response.data.pagination.total,
        pagination: response.data.pagination
      };
    } catch (error) {
      logger.error('Error al obtener jeringas:', error);
      throw error instanceof Error ? error : new Error('Error al obtener jeringas');
    }
  }

  /**
   * Obtener jeringa por ID
   */
  static async getById(id: string): Promise<Jeringa> {
    try {
      logger.debug('Obteniendo jeringa por ID', { id });

      const response = await apiClient.get<ApiResponse<Jeringa>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Jeringa no encontrada');
      }

      // Convertir fechas de string a Date
      const jeringa = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt),
        lotes: response.data.data.lotes?.map(lote => ({
          ...lote
        }))
      };

      logger.debug('Jeringa obtenida exitosamente', { jeringa });
      return jeringa;
    } catch (error) {
      logger.error('Error al obtener jeringa por ID:', error);
      throw error instanceof Error ? error : new Error('Error al obtener jeringa');
    }
  }

  /**
   * Obtener jeringas activas (para selects y formularios)
   */
  static async getActivas(): Promise<Jeringa[]> {
    try {
      logger.debug('Obteniendo jeringas activas');

      const response = await apiClient.get<ApiResponse<Jeringa[]>>(`${this.BASE_PATH}/activas`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener jeringas activas');
      }

      // Convertir fechas de string a Date
      const jeringas = response.data.data.map(jeringa => ({
        ...jeringa,
        createdAt: new Date(jeringa.createdAt),
        updatedAt: new Date(jeringa.updatedAt)
      }));

      logger.debug('Jeringas activas obtenidas exitosamente', { count: jeringas.length });
      return jeringas;
    } catch (error) {
      logger.error('Error al obtener jeringas activas:', error);
      throw error instanceof Error ? error : new Error('Error al obtener jeringas activas');
    }
  }

  /**
   * Crear nueva jeringa
   */
  static async create(data: CreateJeringaDto): Promise<Jeringa> {
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

      logger.debug('Creando jeringa', { data: cleanData });

      const response = await apiClient.post<ApiResponse<Jeringa>>(this.BASE_PATH, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear jeringa');
      }

      // Convertir fechas de string a Date
      const jeringa = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Jeringa creada exitosamente', { jeringa });
      return jeringa;
    } catch (error) {
      logger.error('Error al crear jeringa:', error);
      throw error instanceof Error ? error : new Error('Error al crear jeringa');
    }
  }

  /**
   * Actualizar jeringa
   */
  static async update(id: string, data: UpdateJeringaDto): Promise<Jeringa> {
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

      logger.debug('Actualizando jeringa', { id, data: cleanData });

      const response = await apiClient.put<ApiResponse<Jeringa>>(`${this.BASE_PATH}/${id}`, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar jeringa');
      }

      // Convertir fechas de string a Date
      const jeringa = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Jeringa actualizada exitosamente', { jeringa });
      return jeringa;
    } catch (error) {
      logger.error('Error al actualizar jeringa:', error);
      throw error instanceof Error ? error : new Error('Error al actualizar jeringa');
    }
  }

  /**
   * Eliminar jeringa
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando jeringa', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar jeringa');
      }

      logger.debug('Jeringa eliminada exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar jeringa:', error);
      throw error instanceof Error ? error : new Error('Error al eliminar jeringa');
    }
  }

  /**
   * Obtener estadísticas de stock de jeringas
   */
  static async getStockStats(jeringaId?: string): Promise<any> {
    try {
      const url = jeringaId 
        ? `${this.BASE_PATH}/stats/stock?jeringaId=${jeringaId}`
        : `${this.BASE_PATH}/stats/stock`;

      logger.debug('Obteniendo estadísticas de stock', { jeringaId });

      const response = await apiClient.get<ApiResponse<any>>(url);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al obtener estadísticas de stock');
      }

      logger.debug('Estadísticas de stock obtenidas exitosamente', { stats: response.data.data });
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas de stock:', error);
      throw error instanceof Error ? error : new Error('Error al obtener estadísticas de stock');
    }
  }
}

export default JeringaService;
