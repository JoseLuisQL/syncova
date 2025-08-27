import {
  apiClient,
  ApiResponse,
  PaginatedResponse,
  buildQueryParams,
  handleApiError
} from '../config/api';
import {
  PlanificacionAnual,
  CreatePlanificacionDto,
  UpdatePlanificacionDto,
  PlanificacionFilters,
  PlanificacionStats,
  PlanificacionConRelaciones,
  ImportarPlanificacionDto,
  DistribucionAutomaticaDto
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de planificación anual de vacunas
 * Conecta el frontend con el backend API
 */
export class PlanificacionService {
  private static readonly BASE_PATH = '/planificacion';

  /**
   * Obtener todas las planificaciones con filtros opcionales
   */
  static async getAll(filters?: PlanificacionFilters): Promise<{
    planificaciones: PlanificacionConRelaciones[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      logger.debug('Obteniendo planificaciones con filtros:', filters);

      const queryParams = filters ? buildQueryParams(filters) : '';
      const url = queryParams ? `${this.BASE_PATH}?${queryParams}` : this.BASE_PATH;

      const response = await apiClient.get<PaginatedResponse<PlanificacionConRelaciones>>(url);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener planificaciones');
      }

      // Verificar que data existe y tiene la estructura correcta
      if (!response.data.data || !response.data.data.planificaciones || !Array.isArray(response.data.data.planificaciones)) {
        logger.error('Respuesta del backend inválida:', response.data);
        throw new Error('Respuesta del backend inválida: data.planificaciones no es un array');
      }

      // Convertir fechas de string a Date
      const planificaciones = response.data.data.planificaciones.map(planificacion => ({
        ...planificacion,
        createdAt: new Date(planificacion.createdAt),
        updatedAt: new Date(planificacion.updatedAt)
      }));

      const pagination = {
        page: response.data.data.pagination?.page || 1,
        limit: response.data.data.pagination?.limit || 50,
        total: response.data.data.pagination?.total || planificaciones.length,
        totalPages: response.data.data.pagination?.totalPages || 1
      };

      logger.debug(`Planificaciones obtenidas: ${planificaciones.length}/${pagination.total}`);

      return {
        planificaciones,
        total: pagination.total,
        pagination
      };
    } catch (error) {
      logger.error('Error al obtener planificaciones:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener planificación por ID
   */
  static async getById(id: string): Promise<PlanificacionConRelaciones> {
    try {
      logger.debug('Obteniendo planificación por ID:', id);

      const response = await apiClient.get<ApiResponse<PlanificacionConRelaciones>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Planificación no encontrada');
      }

      // Convertir fechas de string a Date
      const planificacion = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Planificación obtenida:', planificacion);
      return planificacion;
    } catch (error) {
      logger.error('Error al obtener planificación por ID:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Crear nueva planificación
   */
  static async create(data: CreatePlanificacionDto): Promise<PlanificacionAnual> {
    try {
      logger.debug('Creando nueva planificación:', data);

      const response = await apiClient.post<ApiResponse<PlanificacionAnual>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear planificación');
      }

      // Convertir fechas de string a Date
      const planificacion = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Planificación creada:', planificacion);
      return planificacion;
    } catch (error) {
      logger.error('Error al crear planificación:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar planificación existente
   */
  static async update(id: string, data: UpdatePlanificacionDto): Promise<PlanificacionAnual> {
    try {
      logger.debug('Actualizando planificación:', { id, data });

      // Agregar usuarioId para sincronización automática
      const dataWithUser = {
        ...data,
        usuarioId: 'temp-user-id' // Usuario temporal hasta implementar autenticación completa
      };

      const response = await apiClient.put<ApiResponse<PlanificacionAnual>>(`${this.BASE_PATH}/${id}`, dataWithUser);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar planificación');
      }

      // Convertir fechas de string a Date
      const planificacion = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Planificación actualizada:', planificacion);
      return planificacion;
    } catch (error) {
      logger.error('Error al actualizar planificación:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Eliminar planificación
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando planificación:', id);

      const response = await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar planificación');
      }

      logger.debug('Planificación eliminada exitosamente');
    } catch (error) {
      logger.error('Error al eliminar planificación:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener estadísticas de planificación
   */
  static async getStats(anio?: number): Promise<PlanificacionStats> {
    try {
      logger.debug('Obteniendo estadísticas de planificación', { anio });

      const queryParams = anio ? `?anio=${anio}` : '';
      const response = await apiClient.get<ApiResponse<PlanificacionStats>>(`${this.BASE_PATH}/estadisticas${queryParams}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener estadísticas');
      }

      logger.debug('Estadísticas obtenidas:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener planificaciones por vacuna y año
   */
  static async getByVacunaAndYear(
    vacunaId: string, 
    anio: number, 
    centroAcopioId?: string
  ): Promise<PlanificacionConRelaciones[]> {
    try {
      logger.debug('Obteniendo planificaciones por vacuna y año', { vacunaId, anio, centroAcopioId });

      const queryParams = centroAcopioId ? `?centroAcopioId=${centroAcopioId}` : '';
      const response = await apiClient.get<ApiResponse<PlanificacionConRelaciones[]>>(
        `${this.BASE_PATH}/vacuna/${vacunaId}/anio/${anio}${queryParams}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener planificaciones por vacuna');
      }

      // Convertir fechas de string a Date
      const planificaciones = response.data.data.map(planificacion => ({
        ...planificacion,
        createdAt: new Date(planificacion.createdAt),
        updatedAt: new Date(planificacion.updatedAt)
      }));

      logger.debug(`Planificaciones por vacuna obtenidas: ${planificaciones.length}`);
      return planificaciones;
    } catch (error) {
      logger.error('Error al obtener planificaciones por vacuna:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Importar planificaciones desde datos estructurados
   */
  static async importar(data: ImportarPlanificacionDto): Promise<{
    creadas: number;
    actualizadas: number;
    errores: string[];
  }> {
    try {
      logger.debug('Importando planificaciones:', data);

      const response = await apiClient.post<ApiResponse<{
        creadas: number;
        actualizadas: number;
        errores: string[];
      }>>(`${this.BASE_PATH}/importar`, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al importar planificaciones');
      }

      logger.debug('Planificaciones importadas:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al importar planificaciones:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Generar distribución automática
   */
  static async distribucionAutomatica(data: DistribucionAutomaticaDto): Promise<PlanificacionConRelaciones[]> {
    try {
      logger.debug('Generando distribución automática:', data);

      const response = await apiClient.post<ApiResponse<PlanificacionConRelaciones[]>>(
        `${this.BASE_PATH}/distribucion-automatica`, 
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al generar distribución automática');
      }

      // Convertir fechas de string a Date
      const planificaciones = response.data.data.map(planificacion => ({
        ...planificacion,
        createdAt: new Date(planificacion.createdAt),
        updatedAt: new Date(planificacion.updatedAt)
      }));

      logger.debug('Distribución automática generada:', planificaciones);
      return planificaciones;
    } catch (error) {
      logger.error('Error al generar distribución automática:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Descargar plantilla Excel para importación por vacuna específica
   */
  static async descargarPlantillaVacuna(vacunaId: string, anio: number): Promise<Blob> {
    try {
      logger.debug('Descargando plantilla de vacuna:', { vacunaId, anio });

      const response = await apiClient.get(
        `${this.BASE_PATH}/plantilla/vacuna/${vacunaId}/anio/${anio}`,
        {
          responseType: 'blob'
        }
      );

      logger.debug('Plantilla de vacuna descargada exitosamente');
      return response.data;
    } catch (error) {
      logger.error('Error al descargar plantilla de vacuna:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Descargar plantilla Excel masiva para todas las vacunas de un año
   */
  static async descargarPlantillaMasiva(anio: number): Promise<Blob> {
    try {
      logger.debug('Descargando plantilla masiva:', { anio });

      const response = await apiClient.get(
        `${this.BASE_PATH}/plantilla/masiva/anio/${anio}`,
        {
          responseType: 'blob'
        }
      );

      logger.debug('Plantilla masiva descargada exitosamente');
      return response.data;
    } catch (error) {
      logger.error('Error al descargar plantilla masiva:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Importar planificaciones desde archivo Excel por vacuna específica
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
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al importar desde Excel');
      }

      logger.debug('Importación desde Excel por vacuna exitosa:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al importar desde Excel por vacuna:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Importar planificaciones masivas desde archivo Excel (múltiples hojas)
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
        }
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al importar masivamente desde Excel');
      }

      logger.debug('Importación masiva desde Excel exitosa:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al importar masivamente desde Excel:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Sincronizar planificación con movimientos
   */
  static async sincronizarConMovimientos(planificacionId: string): Promise<{
    movimientosActualizados: number;
    movimientosCreados: number;
    errores: string[];
  }> {
    try {
      logger.debug('Sincronizando planificación con movimientos:', { planificacionId });

      const response = await apiClient.post<ApiResponse<{
        movimientosActualizados: number;
        movimientosCreados: number;
        errores: string[];
      }>>(`${this.BASE_PATH}/${planificacionId}/sincronizar-movimientos`, {
        usuarioId: 'temp-user-id' // Usuario temporal hasta implementar autenticación completa
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al sincronizar con movimientos');
      }

      logger.debug('Sincronización exitosa:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al sincronizar con movimientos:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Verificar existencia de planificación para un establecimiento específico
   */
  static async verificarExistenciaPlanificacion(
    establecimientoId: string,
    vacunaId: string,
    anio: number
  ): Promise<{
    existe: boolean;
    planificacionId?: string;
    metaAnual: number;
  }> {
    try {
      logger.debug('Verificando existencia de planificación:', { establecimientoId, vacunaId, anio });

      const response = await apiClient.get<ApiResponse<{
        existe: boolean;
        planificacionId?: string;
        metaAnual: number;
      }>>(`${this.BASE_PATH}/verificar/${establecimientoId}/${vacunaId}/${anio}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al verificar planificación');
      }

      logger.debug('Verificación de planificación exitosa:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al verificar existencia de planificación:', error);
      throw handleApiError(error as AxiosError);
    }
  }
}
