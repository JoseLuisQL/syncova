import {
  apiClient,
  ApiResponse,
  handleApiError
} from '../config/api';
import {
  ProgramacionAnualCenares,
  CreateProgramacionAnualCenaresDto,
  UpdateProgramacionAnualCenaresDto,
  ProgramacionAnualCenaresFilters
} from '../types';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

/**
 * Servicio para gestión de programación anual CENARES
 * Conecta el frontend con el backend API
 */
export class ProgramacionAnualCenaresService {
  private static readonly BASE_PATH = '/programacion-anual-cenares';

  /**
   * Obtener todas las programaciones con filtros
   */
  static async getAll(filters?: ProgramacionAnualCenaresFilters): Promise<ProgramacionAnualCenares[]> {
    try {
      logger.debug('Obteniendo programaciones CENARES con filtros:', filters);

      let url = this.BASE_PATH;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.anio) params.append('anio', filters.anio.toString());
        if (filters.vacunaId) params.append('vacunaId', filters.vacunaId);
        if (filters.jeringaId) params.append('jeringaId', filters.jeringaId);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await apiClient.get<ApiResponse<ProgramacionAnualCenares[]>>(url);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener programaciones CENARES');
      }

      // Convertir fechas de string a Date
      const programaciones = response.data.data.map(prog => ({
        ...prog,
        createdAt: new Date(prog.createdAt),
        updatedAt: new Date(prog.updatedAt)
      }));

      logger.debug('Programaciones CENARES obtenidas:', programaciones.length);
      return programaciones;
    } catch (error) {
      logger.error('Error al obtener programaciones CENARES:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener programación por ID
   */
  static async getById(id: string): Promise<ProgramacionAnualCenares> {
    try {
      logger.debug('Obteniendo programación CENARES por ID:', id);

      const response = await apiClient.get<ApiResponse<ProgramacionAnualCenares>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener programación CENARES');
      }

      // Convertir fechas de string a Date
      const programacion = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Programación CENARES obtenida:', programacion);
      return programacion;
    } catch (error) {
      logger.error('Error al obtener programación CENARES:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Crear nueva programación
   */
  static async create(data: CreateProgramacionAnualCenaresDto): Promise<ProgramacionAnualCenares> {
    try {
      logger.debug('Creando nueva programación CENARES:', data);

      const response = await apiClient.post<ApiResponse<ProgramacionAnualCenares>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear programación CENARES');
      }

      // Convertir fechas de string a Date
      const programacion = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Programación CENARES creada:', programacion);
      return programacion;
    } catch (error) {
      logger.error('Error al crear programación CENARES:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar programación existente
   */
  static async update(id: string, data: UpdateProgramacionAnualCenaresDto): Promise<ProgramacionAnualCenares> {
    try {
      logger.debug('Actualizando programación CENARES:', { id, data });

      const response = await apiClient.put<ApiResponse<ProgramacionAnualCenares>>(`${this.BASE_PATH}/${id}`, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar programación CENARES');
      }

      // Convertir fechas de string a Date
      const programacion = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: new Date(response.data.data.updatedAt)
      };

      logger.debug('Programación CENARES actualizada:', programacion);
      return programacion;
    } catch (error) {
      logger.error('Error al actualizar programación CENARES:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Eliminar programación
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Eliminando programación CENARES:', id);

      const response = await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar programación CENARES');
      }

      logger.debug('Programación CENARES eliminada exitosamente');
    } catch (error) {
      logger.error('Error al eliminar programación CENARES:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener datos completos para la tabla dinámica
   */
  static async getDatosTablaCompleta(anio: number): Promise<any> {
    try {
      logger.debug('Obteniendo datos de tabla completa para año:', anio);

      const response = await apiClient.get<ApiResponse<any>>(`${this.BASE_PATH}/tabla/${anio}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener datos de tabla completa');
      }

      logger.debug('Datos de tabla completa obtenidos:', response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener datos de tabla completa:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar valor de programación trimestral (para auto-save)
   */
  static async updateProgramacionTrimestral(
    itemId: string,
    tipo: 'vacuna' | 'jeringa',
    anio: number,
    trimestre: 'q1' | 'q2' | 'q3' | 'q4',
    valor: number
  ): Promise<ProgramacionAnualCenares> {
    try {
      logger.debug('Actualizando programación trimestral:', { itemId, tipo, anio, trimestre, valor });

      // Primero verificar si existe una programación para este ítem
      const filters: ProgramacionAnualCenaresFilters = {
        anio,
        ...(tipo === 'vacuna' ? { vacunaId: itemId } : { jeringaId: itemId })
      };

      const existingProgramaciones = await this.getAll(filters);
      
      if (existingProgramaciones.length > 0) {
        // Actualizar existente
        const programacion = existingProgramaciones[0];
        const updateData: UpdateProgramacionAnualCenaresDto = {};
        
        switch (trimestre) {
          case 'q1':
            updateData.programadoQ1 = valor;
            break;
          case 'q2':
            updateData.programadoQ2 = valor;
            break;
          case 'q3':
            updateData.programadoQ3 = valor;
            break;
          case 'q4':
            updateData.programadoQ4 = valor;
            break;
        }

        return await this.update(programacion.id, updateData);
      } else {
        // Crear nueva programación
        const createData: CreateProgramacionAnualCenaresDto = {
          anio,
          ...(tipo === 'vacuna' ? { vacunaId: itemId } : { jeringaId: itemId }),
          programadoQ1: trimestre === 'q1' ? valor : 0,
          programadoQ2: trimestre === 'q2' ? valor : 0,
          programadoQ3: trimestre === 'q3' ? valor : 0,
          programadoQ4: trimestre === 'q4' ? valor : 0
        };

        return await this.create(createData);
      }
    } catch (error) {
      logger.error('Error al actualizar programación trimestral:', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Sincronizar y recalcular saldos anteriores para un año
   */
  static async sincronizarSaldos(anio: number): Promise<{
    saldosCalculados: number;
    detalles: Array<{ id: string; nombre: string; tipo: string; saldoAnterior: number }>;
  }> {
    try {
      logger.debug('Sincronizando saldos para año:', anio);

      const response = await apiClient.post<ApiResponse<{
        saldosCalculados: number;
        detalles: Array<{ id: string; nombre: string; tipo: string; saldoAnterior: number }>;
      }>>(`${this.BASE_PATH}/sincronizar-saldos`, { anio });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al sincronizar saldos');
      }

      logger.debug('Saldos sincronizados:', response.data.data.saldosCalculados);
      return response.data.data;
    } catch (error) {
      logger.error('Error al sincronizar saldos:', error);
      throw handleApiError(error as AxiosError);
    }
  }
}
