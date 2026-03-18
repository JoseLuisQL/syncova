import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import {
  LoteJeringa,
  CreateLoteJeringaDto,
  UpdateLoteJeringaDto,
  LoteJeringaFilters,
  LoteJeringaStats
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de lotes de jeringas
 * Conecta el frontend con el backend API
 */
export class LoteJeringaService {
  private static readonly BASE_PATH = '/lotes-jeringas';

  /**
   * Obtener todos los lotes de jeringas con filtros opcionales
   */
  static async getAll(filters?: LoteJeringaFilters): Promise<{
    lotes: LoteJeringa[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      logger.debug('Obteniendo lotes de jeringas con filtros:', filters);

      const queryParams = filters ? buildQueryParams(filters) : '';
      const url = `${this.BASE_PATH}${queryParams}`;

      const response = await apiClient.get<PaginatedResponse<LoteJeringa>>(url);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener lotes de jeringas');
      }

      // Verificar que data existe y es un array
      if (!response.data.data || !Array.isArray(response.data.data)) {
        logger.error('Respuesta del backend inválida:', response.data);
        throw new Error('Respuesta del backend inválida: data no es un array');
      }

      // Convertir fechas de string a Date
      const lotes = response.data.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: lote.fechaVencimiento ? new Date(lote.fechaVencimiento) : undefined,
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));

      logger.debug('Lotes de jeringas obtenidos exitosamente', { 
        count: lotes.length, 
        total: response.data.pagination.total 
      });

      return {
        lotes,
        total: response.data.pagination.total,
        pagination: response.data.pagination
      };
    } catch (error) {
      logger.error('Error al obtener lotes de jeringas:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener lote de jeringa por ID
   */
  static async getById(id: string): Promise<LoteJeringa> {
    try {
      logger.debug('Obteniendo lote de jeringa por ID', { id });

      const response = await apiClient.get<ApiResponse<LoteJeringa>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Lote de jeringa no encontrado');
      }

      // Convertir fechas de string a Date
      const lote = {
        ...response.data.data,
        fechaIngreso: new Date(response.data.data.fechaIngreso),
        fechaVencimiento: response.data.data.fechaVencimiento ? new Date(response.data.data.fechaVencimiento) : undefined,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Lote de jeringa obtenido exitosamente', { id, numero: lote.numero });
      return lote;
    } catch (error) {
      logger.error('Error al obtener lote de jeringa por ID:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Crear nuevo lote de jeringa
   */
  static async create(data: CreateLoteJeringaDto): Promise<LoteJeringa> {
    try {
      logger.debug('Creando nuevo lote de jeringa:', data);

      const response = await apiClient.post<ApiResponse<LoteJeringa>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear lote de jeringa');
      }

      // Convertir fechas de string a Date
      const lote = {
        ...response.data.data,
        fechaIngreso: new Date(response.data.data.fechaIngreso),
        fechaVencimiento: response.data.data.fechaVencimiento ? new Date(response.data.data.fechaVencimiento) : undefined,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Lote de jeringa creado exitosamente', { id: lote.id, numero: lote.numero });
      return lote;
    } catch (error) {
      logger.error('Error al crear lote de jeringa:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Actualizar lote de jeringa
   */
  static async update(id: string, data: UpdateLoteJeringaDto): Promise<LoteJeringa> {
    try {
      logger.debug('Actualizando lote de jeringa:', { id, data });

      const response = await apiClient.put<ApiResponse<LoteJeringa>>(`${this.BASE_PATH}/${id}`, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar lote de jeringa');
      }

      // Convertir fechas de string a Date
      const lote = {
        ...response.data.data,
        fechaIngreso: new Date(response.data.data.fechaIngreso),
        fechaVencimiento: response.data.data.fechaVencimiento ? new Date(response.data.data.fechaVencimiento) : undefined,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Lote de jeringa actualizado exitosamente', { id, numero: lote.numero });
      return lote;
    } catch (error) {
      logger.error('Error al actualizar lote de jeringa:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Eliminar lote de jeringa
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando lote de jeringa:', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar lote de jeringa');
      }

      logger.debug('Lote de jeringa eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar lote de jeringa:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener estadísticas de lotes de jeringas
   */
  static async getStats(): Promise<LoteJeringaStats> {
    try {
      logger.debug('Obteniendo estadísticas de lotes de jeringas');

      const response = await apiClient.get<ApiResponse<LoteJeringaStats>>(`${this.BASE_PATH}/stats`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }

      logger.debug('Estadísticas obtenidas exitosamente', { data: response.data.data });
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener lotes con stock bajo
   */
  static async getStockBajo(porcentaje: number = 20): Promise<LoteJeringa[]> {
    try {
      logger.debug('Obteniendo lotes con stock bajo', { porcentaje });

      const response = await apiClient.get<ApiResponse<LoteJeringa[]>>(`${this.BASE_PATH}/stock-bajo?porcentaje=${porcentaje}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener lotes con stock bajo');
      }

      // Convertir fechas de string a Date
      const lotes = response.data.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: lote.fechaVencimiento ? new Date(lote.fechaVencimiento) : undefined,
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));

      logger.debug('Lotes con stock bajo obtenidos exitosamente', { count: lotes.length });
      return lotes;
    } catch (error) {
      logger.error('Error al obtener lotes con stock bajo:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener lotes por jeringa específica
   */
  static async getByJeringa(jeringaId: string): Promise<LoteJeringa[]> {
    try {
      logger.debug('Obteniendo lotes por jeringa', { jeringaId });

      const response = await apiClient.get<ApiResponse<LoteJeringa[]>>(`${this.BASE_PATH}/jeringa/${jeringaId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener lotes por jeringa');
      }

      // Convertir fechas de string a Date
      const lotes = response.data.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: lote.fechaVencimiento ? new Date(lote.fechaVencimiento) : undefined,
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));

      logger.debug('Lotes por jeringa obtenidos exitosamente', { jeringaId, count: lotes.length });
      return lotes;
    } catch (error) {
      logger.error('Error al obtener lotes por jeringa:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }
}

export default LoteJeringaService;
