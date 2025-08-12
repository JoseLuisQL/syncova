import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import {
  MovimientoVacuna,
  CreateMovimientoDto,
  UpdateMovimientoDto,
  MovimientosFilters,
  MovimientoConRelaciones,
  EntregaAdicional,
  CreateEntregaAdicionalDto,
  MovimientosStats
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de movimientos de vacunas
 * Conecta el frontend con el backend API
 */
export class MovimientosService {
  private static readonly BASE_PATH = '/movimientos';

  /**
   * Obtener todos los movimientos con filtros opcionales
   */
  static async getAll(filters?: MovimientosFilters): Promise<{
    movimientos: MovimientoConRelaciones[];
    total: number;
  }> {
    try {
      logger.debug('Obteniendo movimientos con filtros:', filters);

      const queryParams = buildQueryParams(filters);
      const response = await apiClient.get<ApiResponse<{
        movimientos: MovimientoConRelaciones[];
        total: number;
      }>>(`${this.BASE_PATH}${queryParams}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener movimientos');
      }

      logger.debug('Movimientos obtenidos exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener movimientos:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener movimiento por ID
   */
  static async getById(id: string): Promise<MovimientoConRelaciones> {
    try {
      logger.debug('Obteniendo movimiento por ID:', id);

      const response = await apiClient.get<ApiResponse<MovimientoConRelaciones>>(
        `${this.BASE_PATH}/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener movimiento');
      }

      logger.debug('Movimiento obtenido exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener movimiento:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Crear nuevo movimiento
   */
  static async create(data: CreateMovimientoDto): Promise<MovimientoVacuna> {
    try {
      logger.debug('Creando movimiento:', data);

      const response = await apiClient.post<ApiResponse<MovimientoVacuna>>(
        this.BASE_PATH,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear movimiento');
      }

      logger.debug('Movimiento creado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al crear movimiento:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar movimiento existente
   */
  static async update(id: string, data: UpdateMovimientoDto): Promise<MovimientoVacuna> {
    try {
      logger.debug('Actualizando movimiento:', { id, data });

      const response = await apiClient.put<ApiResponse<MovimientoVacuna>>(
        `${this.BASE_PATH}/${id}`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar movimiento');
      }

      logger.debug('Movimiento actualizado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al actualizar movimiento:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Eliminar movimiento
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando movimiento:', id);

      const response = await apiClient.delete<ApiResponse<void>>(
        `${this.BASE_PATH}/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar movimiento');
      }

      logger.debug('Movimiento eliminado exitosamente');
    } catch (error) {
      logger.error('Error al eliminar movimiento:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar movimientos desde planificación anual
   */
  static async generarDesdePlanificacion(
    planificacionId: string,
    usuarioId: string
  ): Promise<{
    creados: number;
    actualizados: number;
    errores: string[];
  }> {
    try {
      logger.debug('Generando movimientos desde planificación:', { planificacionId, usuarioId });

      const response = await apiClient.post<ApiResponse<{
        creados: number;
        actualizados: number;
        errores: string[];
      }>>(`${this.BASE_PATH}/generar-desde-planificacion/${planificacionId}`, {
        usuarioId
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al generar movimientos desde planificación');
      }

      logger.debug('Movimientos generados exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al generar movimientos desde planificación:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener estadísticas de movimientos
   */
  static async getEstadisticas(anio?: number): Promise<MovimientosStats> {
    try {
      logger.debug('Obteniendo estadísticas de movimientos:', { anio });

      const queryParams = anio ? `?anio=${anio}` : '';
      const response = await apiClient.get<ApiResponse<MovimientosStats>>(
        `${this.BASE_PATH}/estadisticas${queryParams}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }

      logger.debug('Estadísticas obtenidas exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Crear entrega adicional con sincronización automática
   */
  static async createEntregaAdicional(data: CreateEntregaAdicionalDto): Promise<EntregaAdicional> {
    try {
      logger.debug('Creando entrega adicional con sincronización:', data);

      // Usar el endpoint que incluye sincronización con planificación
      const response = await apiClient.post<ApiResponse<EntregaAdicional>>(
        `/movimientos/${data.movimientoVacunaId}/entregas-adicionales`,
        {
          numeroEntrega: data.numeroEntrega,
          cantidad: data.cantidad,
          fechaEntrega: data.fechaEntrega,
          motivo: data.motivo,
          usuarioId: data.usuarioId
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear entrega adicional');
      }

      logger.debug('Entrega adicional creada exitosamente con sincronización:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al crear entrega adicional:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar entrega adicional con sincronización automática
   */
  static async updateEntregaAdicional(
    id: string,
    data: { cantidad: number; motivo?: string }
  ): Promise<EntregaAdicional> {
    try {
      logger.debug('Actualizando entrega adicional con sincronización:', { id, data });

      // Usar el endpoint que incluye sincronización con planificación
      const response = await apiClient.put<ApiResponse<EntregaAdicional>>(
        `/movimientos/entregas-adicionales/${id}`,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar entrega adicional');
      }

      logger.debug('Entrega adicional actualizada exitosamente con sincronización:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al actualizar entrega adicional:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Eliminar entrega adicional con sincronización automática
   */
  static async deleteEntregaAdicional(id: string): Promise<void> {
    try {
      logger.debug('Eliminando entrega adicional con sincronización:', id);

      // Usar el endpoint que incluye sincronización con planificación
      const response = await apiClient.delete<ApiResponse<void>>(
        `/movimientos/entregas-adicionales/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar entrega adicional');
      }

      logger.debug('Entrega adicional eliminada exitosamente con sincronización');
    } catch (error) {
      logger.error('Error al eliminar entrega adicional:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener stock disponible por vacuna
   */
  static async getStockDisponible(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<{
    stockInicial: number;
    totalEntregas: number;
    stockDisponible: number;
    porcentajeUtilizado: number;
    estado: 'bueno' | 'medio' | 'critico';
    lotes: Array<{
      id: string;
      numero: string;
      cantidadActual: number;
      fechaVencimiento: Date;
      estado: string;
    }>;
  }> {
    try {
      logger.debug('Obteniendo stock disponible:', { vacunaId, mes, anio });

      const response = await apiClient.get<ApiResponse<{
        stockInicial: number;
        totalEntregas: number;
        stockDisponible: number;
        porcentajeUtilizado: number;
        estado: 'bueno' | 'medio' | 'critico';
        lotes: Array<{
          id: string;
          numero: string;
          cantidadActual: number;
          fechaVencimiento: Date;
          estado: string;
        }>;
      }>>(`${this.BASE_PATH}/stock-disponible`, {
        params: { vacunaId, mes, anio }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener stock disponible');
      }

      logger.debug('Stock disponible obtenido exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener stock disponible:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Sincronizar saldo anterior del siguiente mes
   */
  static async sincronizarSaldoAnterior(
    establecimientoId: string,
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<{ actualizado: boolean; stockCalculado: number }> {
    try {
      logger.debug('Sincronizando saldo anterior:', { establecimientoId, vacunaId, mes, anio });

      const response = await apiClient.post<ApiResponse<{ actualizado: boolean; stockCalculado: number }>>(
        `${this.BASE_PATH}/sincronizar-saldo-anterior`,
        {
          establecimientoId,
          vacunaId,
          mes,
          anio
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al sincronizar saldo anterior');
      }

      logger.debug('Saldo anterior sincronizado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al sincronizar saldo anterior:', error);
      throw handleApiError(error as AxiosError);
    }
  }
}
