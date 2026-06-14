import {
  apiClient,
  ApiResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import { Alerta, CreateAlertaDto, UpdateAlertaDto, AlertaFilters, AlertaStats } from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de alertas del sistema
 * Conecta el frontend con el backend API
 */
export class AlertasService {
  private static readonly BASE_PATH = '/alertas';

  /**
   * Convertir fechas de string a Date en una alerta
   */
  private static convertirFechasAlerta(alerta: any): Alerta {
    return {
      ...alerta,
      fechaCreacion: new Date(alerta.fechaCreacion),
      fechaVencimiento: alerta.fechaVencimiento ? new Date(alerta.fechaVencimiento) : undefined,
      createdAt: new Date(alerta.createdAt),
      updatedAt: new Date(alerta.updatedAt)
    };
  }

  /**
   * Obtener todas las alertas con filtros opcionales
   */
  static async getAll(filters?: AlertaFilters): Promise<{
    alertas: Alerta[];
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

      logger.debug('Obteniendo alertas', { url, filters });

      const response = await apiClient.get<ApiResponse<{ alertas: Alerta[]; total: number }>>(url);

      logger.debug('Respuesta del backend recibida', {
        success: response.data.success,
        dataLength: response.data.data?.alertas?.length || 0,
        total: response.data.data?.total || 0
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener alertas');
      }

      const alertasRaw = response.data.data?.alertas || [];
      const total = response.data.data?.total || 0;

      // Convertir fechas de string a Date
      const alertas = alertasRaw.map(alerta => this.convertirFechasAlerta(alerta));

      return {
        alertas,
        total,
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 50,
          total,
          totalPages: Math.ceil(total / (filters?.limit || 50))
        }
      };
    } catch (error) {
      logger.error('Error al obtener alertas', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener alerta por ID
   */
  static async getById(id: string): Promise<Alerta> {
    try {
      logger.debug('Obteniendo alerta por ID', { id });

      const response = await apiClient.get<ApiResponse<Alerta>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener alerta');
      }

      // Convertir fechas de string a Date
      return this.convertirFechasAlerta(response.data.data);
    } catch (error) {
      logger.error('Error al obtener alerta por ID', { id, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Crear nueva alerta
   */
  static async create(data: CreateAlertaDto): Promise<Alerta> {
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

      logger.debug('Creando alerta', { data: cleanData });

      const response = await apiClient.post<ApiResponse<Alerta>>(this.BASE_PATH, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear alerta');
      }

      // Convertir fechas de string a Date
      return this.convertirFechasAlerta(response.data.data);
    } catch (error) {
      logger.error('Error al crear alerta', { data, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar alerta existente
   */
  static async update(id: string, data: UpdateAlertaDto): Promise<Alerta> {
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

      logger.debug('Actualizando alerta', { id, data: cleanData });

      const response = await apiClient.put<ApiResponse<Alerta>>(`${this.BASE_PATH}/${id}`, cleanData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar alerta');
      }

      // Convertir fechas de string a Date
      return this.convertirFechasAlerta(response.data.data);
    } catch (error) {
      logger.error('Error al actualizar alerta', { id, data, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Eliminar alerta
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando alerta', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar alerta');
      }
    } catch (error) {
      logger.error('Error al eliminar alerta', { id, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Marcar alerta como leída
   */
  static async markAsRead(id: string): Promise<Alerta> {
    try {
      logger.debug('Marcando alerta como leída', { id });

      const response = await apiClient.put<ApiResponse<Alerta>>(`${this.BASE_PATH}/${id}/leer`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al marcar alerta como leída');
      }

      // Convertir fechas de string a Date
      return this.convertirFechasAlerta(response.data.data);
    } catch (error) {
      logger.error('Error al marcar alerta como leída', { id, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Marcar múltiples alertas como leídas
   */
  static async markMultipleAsRead(ids: string[]): Promise<{ count: number }> {
    try {
      logger.debug('Marcando múltiples alertas como leídas', { ids });

      const response = await apiClient.put<ApiResponse<{ count: number }>>(`${this.BASE_PATH}/leer-multiples`, { ids });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al marcar alertas como leídas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al marcar múltiples alertas como leídas', { ids, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  static async getStats(): Promise<AlertaStats> {
    try {
      logger.debug('Obteniendo estadísticas de alertas');

      const response = await apiClient.get<ApiResponse<AlertaStats>>(`${this.BASE_PATH}/stats`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas de alertas', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener alertas no leídas para el usuario autenticado
   */
  static async getUnreadForUser(): Promise<Alerta[]> {
    try {
      logger.debug('Obteniendo alertas no leídas para el usuario');

      const response = await apiClient.get<ApiResponse<Alerta[]>>(`${this.BASE_PATH}/no-leidas`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener alertas no leídas');
      }

      // Convertir fechas de string a Date
      return response.data.data.map(alerta => this.convertirFechasAlerta(alerta));
    } catch (error) {
      logger.error('Error al obtener alertas no leídas', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Limpiar alertas antiguas
   */
  static async cleanupOldAlerts(days: number = 30): Promise<{ count: number }> {
    try {
      logger.debug('Limpiando alertas antiguas', { days });

      const response = await apiClient.delete<ApiResponse<{ count: number }>>(`${this.BASE_PATH}/limpiar-antiguas?days=${days}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al limpiar alertas antiguas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al limpiar alertas antiguas', { days, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar alertas automáticas (vencimiento y stock bajo)
   */
  static async generarAutomaticas(diasAnticipacion: number = 30, stockMinimo: number = 100): Promise<{
    alertasGeneradas: number;
    alertasVencimiento: number;
    alertasStockBajo: number;
    detalles: string[];
  }> {
    try {
      logger.debug('Generando alertas automáticas', { diasAnticipacion, stockMinimo });

      const response = await apiClient.post<ApiResponse<{
        alertasGeneradas: number;
        alertasVencimiento: number;
        alertasStockBajo: number;
        detalles: string[];
      }>>(`${this.BASE_PATH}/generar-automaticas`, { diasAnticipacion, porcentajeMinimo: stockMinimo });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al generar alertas automáticas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al generar alertas automáticas', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Limpiar alertas antiguas leídas
   */
  static async limpiarAntiguas(dias: number = 30): Promise<{ eliminadas: number }> {
    try {
      logger.debug('Limpiando alertas antiguas', { dias });

      const response = await apiClient.delete<ApiResponse<{ eliminadas: number }>>(`${this.BASE_PATH}/limpiar-resueltas?days=${dias}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al limpiar alertas antiguas');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al limpiar alertas antiguas', error);
      throw handleApiError(error as AxiosError);
    }
  }
}
