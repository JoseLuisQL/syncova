import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import {
  Lote,
  CreateLoteVacunaDto,
  UpdateLoteVacunaDto,
  LoteVacunaFilters,
  LoteVacunaStats
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de lotes de vacunas
 * Conecta el frontend con el backend API
 */
export class LoteVacunaService {
  private static readonly BASE_PATH = '/lotes-vacunas';

  /**
   * Obtener todos los lotes de vacunas con filtros opcionales
   */
  static async getAll(filters?: LoteVacunaFilters): Promise<{
    lotes: Lote[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      logger.debug('Obteniendo lotes de vacunas con filtros:', filters);

      const queryParams = filters ? buildQueryParams(filters) : '';
      const url = queryParams ? `${this.BASE_PATH}?${queryParams}` : this.BASE_PATH;

      const response = await apiClient.get<PaginatedResponse<Lote>>(url);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener lotes de vacunas');
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
        fechaVencimiento: new Date(lote.fechaVencimiento),
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));

      logger.debug('Lotes de vacunas obtenidos exitosamente', { 
        count: lotes.length, 
        total: response.data.pagination.total 
      });

      return {
        lotes,
        total: response.data.pagination.total,
        pagination: response.data.pagination
      };
    } catch (error) {
      logger.error('Error al obtener lotes de vacunas:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener lote de vacuna por ID
   */
  static async getById(id: string): Promise<Lote> {
    try {
      logger.debug('Obteniendo lote de vacuna por ID', { id });

      const response = await apiClient.get<ApiResponse<Lote>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Lote de vacuna no encontrado');
      }

      // Convertir fechas de string a Date
      const lote = {
        ...response.data.data,
        fechaIngreso: new Date(response.data.data.fechaIngreso),
        fechaVencimiento: new Date(response.data.data.fechaVencimiento),
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Lote de vacuna obtenido exitosamente', { id, numero: lote.numero });
      return lote;
    } catch (error) {
      logger.error('Error al obtener lote de vacuna por ID:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Crear nuevo lote de vacuna
   */
  static async create(data: CreateLoteVacunaDto): Promise<Lote> {
    try {
      logger.debug('Creando nuevo lote de vacuna:', data);

      const response = await apiClient.post<ApiResponse<Lote>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear lote de vacuna');
      }

      // Convertir fechas de string a Date
      const lote = {
        ...response.data.data,
        fechaIngreso: new Date(response.data.data.fechaIngreso),
        fechaVencimiento: new Date(response.data.data.fechaVencimiento),
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Lote de vacuna creado exitosamente', { id: lote.id, numero: lote.numero });
      return lote;
    } catch (error) {
      logger.error('Error al crear lote de vacuna:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Actualizar lote de vacuna
   */
  static async update(id: string, data: UpdateLoteVacunaDto): Promise<Lote> {
    try {
      logger.debug('Actualizando lote de vacuna:', { id, data });

      const response = await apiClient.put<ApiResponse<Lote>>(`${this.BASE_PATH}/${id}`, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar lote de vacuna');
      }

      // Convertir fechas de string a Date
      const lote = {
        ...response.data.data,
        fechaIngreso: new Date(response.data.data.fechaIngreso),
        fechaVencimiento: new Date(response.data.data.fechaVencimiento),
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Lote de vacuna actualizado exitosamente', { id, numero: lote.numero });
      return lote;
    } catch (error) {
      logger.error('Error al actualizar lote de vacuna:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Eliminar lote de vacuna
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando lote de vacuna:', { id });

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar lote de vacuna');
      }

      logger.debug('Lote de vacuna eliminado exitosamente', { id });
    } catch (error) {
      logger.error('Error al eliminar lote de vacuna:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener estadísticas de lotes de vacunas
   */
  static async getStats(): Promise<LoteVacunaStats> {
    try {
      logger.debug('Obteniendo estadísticas de lotes de vacunas');

      const response = await apiClient.get<ApiResponse<LoteVacunaStats>>(`${this.BASE_PATH}/stats`);

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
   * Obtener lotes próximos a vencer
   */
  static async getProximosVencer(dias: number = 30): Promise<Lote[]> {
    try {
      logger.debug('Obteniendo lotes próximos a vencer', { dias });

      const response = await apiClient.get<ApiResponse<Lote[]>>(`${this.BASE_PATH}/proximos-vencer?dias=${dias}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener lotes próximos a vencer');
      }

      // Convertir fechas de string a Date
      const lotes = response.data.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: new Date(lote.fechaVencimiento),
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));

      logger.debug('Lotes próximos a vencer obtenidos exitosamente', { count: lotes.length });
      return lotes;
    } catch (error) {
      logger.error('Error al obtener lotes próximos a vencer:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }

  /**
   * Obtener lotes por vacuna específica
   */
  static async getByVacuna(vacunaId: string): Promise<Lote[]> {
    try {
      logger.debug('Obteniendo lotes por vacuna', { vacunaId });

      const response = await apiClient.get<ApiResponse<Lote[]>>(`${this.BASE_PATH}/vacuna/${vacunaId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener lotes por vacuna');
      }

      // Convertir fechas de string a Date
      const lotes = response.data.data.map(lote => ({
        ...lote,
        fechaIngreso: new Date(lote.fechaIngreso),
        fechaVencimiento: new Date(lote.fechaVencimiento),
        createdAt: new Date(lote.createdAt),
        updatedAt: new Date(lote.updatedAt)
      }));

      logger.debug('Lotes por vacuna obtenidos exitosamente', { vacunaId, count: lotes.length });
      return lotes;
    } catch (error) {
      logger.error('Error al obtener lotes por vacuna:', error);

      if (error instanceof AxiosError) {
        throw new Error(handleApiError(error));
      }

      throw error;
    }
  }
}

export default LoteVacunaService;
