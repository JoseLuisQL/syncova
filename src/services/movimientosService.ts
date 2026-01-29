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
      // Preservar el error original para que el componente pueda acceder a response.data
      throw error;
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
    stockInicialHistorico: number | null;
    fechaCapturaStockInicial: Date | null;
    stockActual: number;
    totalEntregas: number;
    stockDisponible: number;
    estado: 'bueno' | 'medio' | 'critico';
    tieneHistorialInicial: boolean;
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
        stockInicialHistorico: number | null;
        fechaCapturaStockInicial: Date | null;
        stockActual: number;
        totalEntregas: number;
        stockDisponible: number;
        estado: 'bueno' | 'medio' | 'critico';
        tieneHistorialInicial: boolean;
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

  /**
   * Descargar plantilla Excel para importación por vacuna específica
   */
  static async descargarPlantillaVacuna(vacunaId: string, anio: number): Promise<boolean> {
    try {
      logger.debug('Descargando plantilla de vacuna:', { vacunaId, anio });

      const response = await apiClient.get(
        `${this.BASE_PATH}/plantilla/vacuna/${vacunaId}/anio/${anio}`,
        {
          responseType: 'blob'
        }
      );

      // Crear blob y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_movimientos_${vacunaId}_${anio}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logger.debug('Plantilla de vacuna descargada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error al descargar plantilla de vacuna:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Descargar plantilla Excel masiva para todas las vacunas
   */
  static async descargarPlantillaMasiva(anio: number): Promise<boolean> {
    try {
      logger.debug('Descargando plantilla masiva:', { anio });

      const response = await apiClient.get(
        `${this.BASE_PATH}/plantilla/masiva/anio/${anio}`,
        {
          responseType: 'blob'
        }
      );

      // Crear blob y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_movimientos_masiva_${anio}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logger.debug('Plantilla masiva descargada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error al descargar plantilla masiva:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Importar movimientos desde archivo Excel por vacuna específica
   */
  static async importarDesdeExcelVacuna(
    vacunaId: string,
    anio: number,
    archivo: File
  ): Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  }> {
    try {
      logger.debug('Importando desde Excel por vacuna:', { vacunaId, anio, archivo: archivo.name });

      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await apiClient.post<ApiResponse<{
        creadas: number;
        actualizadas: number;
        errores: string[];
      }>>(`${this.BASE_PATH}/importar/vacuna/${vacunaId}/anio/${anio}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutos para importaciones
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al importar desde Excel');
      }

      logger.debug('Importación por vacuna completada:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al importar desde Excel por vacuna:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Importar movimientos masivos desde archivo Excel (múltiples hojas)
   */
  static async importarDesdeExcelMasivo(
    anio: number,
    archivo: File
  ): Promise<{
    totalCreadas: number;
    totalActualizadas: number;
    erroresPorVacuna: { vacuna: string; errores: string[] }[];
    vacunasProcesadas: number;
  }> {
    try {
      logger.debug('Importando masivamente desde Excel:', { anio, archivo: archivo.name });

      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await apiClient.post<ApiResponse<{
        totalCreadas: number;
        totalActualizadas: number;
        erroresPorVacuna: { vacuna: string; errores: string[] }[];
        vacunasProcesadas: number;
      }>>(`${this.BASE_PATH}/importar/masivo/anio/${anio}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 600000 // 10 minutos para importaciones masivas
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al importar masivamente desde Excel');
      }

      logger.debug('Importación masiva completada:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al importar masivamente desde Excel:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar reporte de errores en Excel
   */
  static async generarReporteErrores(erroresPorVacuna: any[]): Promise<boolean> {
    try {
      logger.debug('Generando reporte de errores:', { totalVacunas: erroresPorVacuna.length });

      const response = await apiClient.post(
        `${this.BASE_PATH}/reporte-errores`,
        { erroresPorVacuna },
        {
          responseType: 'blob'
        }
      );

      // Crear blob y descargar archivo
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `reporte_errores_importacion_${timestamp}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logger.debug('Reporte de errores generado exitosamente');
      return true;
    } catch (error) {
      logger.error('Error al generar reporte de errores:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * 🚀 NUEVA FUNCIONALIDAD: Actualizar stock inicial del siguiente mes automáticamente
   * 
   * Calcula el disponible actual (Stock Inicial - Entregas) y lo registra como
   * stock_inicial del siguiente mes en la tabla stock_inicial_mensual
   * 
   * @param vacunaId - ID de la vacuna
   * @param mes - Mes actual (1-12)
   * @param anio - Año actual
   * @returns Información del registro creado/actualizado
   */
  static async actualizarStockInicialSiguienteMes(
    vacunaId: string,
    mes: number,
    anio: number
  ): Promise<{
    mesActual: { mes: number; anio: number; stockInicial: number; entregas: number; disponible: number };
    mesSiguiente: { mes: number; anio: number; stockInicialRegistrado: number };
    mensaje: string;
  }> {
    try {
      logger.debug('Actualizando stock inicial siguiente mes:', { vacunaId, mes, anio });

      const response = await apiClient.post<ApiResponse<{
        mesActual: { mes: number; anio: number; stockInicial: number; entregas: number; disponible: number };
        mesSiguiente: { mes: number; anio: number; stockInicialRegistrado: number };
        mensaje: string;
      }>>(`${this.BASE_PATH}/actualizar-stock-siguiente-mes`, {
        vacunaId,
        mes,
        anio
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar stock inicial del siguiente mes');
      }

      logger.debug('Stock inicial siguiente mes actualizado exitosamente:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al actualizar stock inicial siguiente mes:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener años disponibles con movimientos registrados
   */
  static async getAniosDisponibles(): Promise<{
    anios: number[];
    anioActual: number;
  }> {
    try {
      logger.debug('Obteniendo años disponibles para movimientos');

      const response = await apiClient.get<ApiResponse<{
        anios: number[];
        anioActual: number;
      }>>(`${this.BASE_PATH}/anios-disponibles`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener años disponibles');
      }

      logger.debug('Años disponibles obtenidos:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener años disponibles:', error);
      // Fallback: devolver año actual y siguiente si hay error
      const currentYear = new Date().getFullYear();
      return {
        anios: [currentYear - 1, currentYear, currentYear + 1],
        anioActual: currentYear
      };
    }
  }

  /**
   * Obtener progreso de generación de vales
   */
  static async getProgresoVales(
    vacunaId: string,
    mes: number,
    anio: number,
    centroAcopioId?: string
  ): Promise<ProgresoValesResponse> {
    try {
      logger.debug('Obteniendo progreso de vales:', { vacunaId, mes, anio, centroAcopioId });

      const params = new URLSearchParams({
        vacunaId,
        mes: mes.toString(),
        anio: anio.toString()
      });

      if (centroAcopioId && centroAcopioId !== 'todos') {
        params.append('centroAcopioId', centroAcopioId);
      }

      const response = await apiClient.get<ApiResponse<ProgresoValesResponse>>(
        `${this.BASE_PATH}/progreso-vales?${params.toString()}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener progreso de vales');
      }

      logger.debug('Progreso de vales obtenido:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener progreso de vales:', error);
      // Retornar estado por defecto en caso de error
      return {
        totalEstablecimientosConEntregas: 0,
        establecimientosConValeCompleto: 0,
        porcentajeProgreso: 0,
        estado: 'sin_vales',
        totalEntregas: 0,
        establecimientosPendientes: []
      };
    }
  }
}

/**
 * Interfaces for voucher progress
 */
export interface EstablecimientoPendiente {
  id: string;
  nombre: string;
  codigo: string;
  tipoEntregaPendiente: 'base' | 'adicional' | 'ambos';
  cantidadEntregaBase: number;
  entregasAdicionalesPendientes: number;
  totalCantidadPendiente: number;
}

export interface CentroAcopioConPendientes {
  centroAcopio: {
    id: string;
    nombre: string;
    codigo: string;
  };
  establecimientos: EstablecimientoPendiente[];
  totalPendientes: number;
}

export interface ProgresoValesResponse {
  totalEstablecimientosConEntregas: number;
  establecimientosConValeCompleto: number;
  porcentajeProgreso: number;
  estado: 'sin_vales' | 'en_progreso' | 'completo';
  totalEntregas: number;
  establecimientosPendientes: CentroAcopioConPendientes[];
}
