import { ApiResponse } from '../types/api';
import { apiClient } from '../config/api';
import {
  MultiplicadorJeringa,
  CreateMultiplicadorDto,
  UpdateMultiplicadorDto,
  MultiplicadorFilters,
  ConfiguracionMultiplicadores,
  CalculoJeringas,
  Jeringa
} from '../types/multiplicadores';

/**
 * Servicio para gestión de multiplicadores de jeringas
 * Permite configurar qué jeringas y en qué cantidades se necesitan para cada vacuna
 */
export class MultiplicadoresService {
  private static readonly BASE_URL = '/multiplicadores';

  /**
   * Obtener multiplicadores con filtros
   */
  static async getMultiplicadores(filters: MultiplicadorFilters = {}): Promise<ApiResponse<{ multiplicadores: MultiplicadorJeringa[]; total: number }>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.vacunaId) params.append('vacunaId', filters.vacunaId);
      if (filters.jeringaId) params.append('jeringaId', filters.jeringaId);
      if (filters.activo !== undefined) params.append('activo', filters.activo.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`${this.BASE_URL}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener multiplicadores:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener multiplicadores'
      };
    }
  }

  /**
   * Obtener configuración de multiplicadores para una vacuna
   */
  static async getConfiguracionVacuna(vacunaId: string): Promise<ApiResponse<ConfiguracionMultiplicadores>> {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/vacuna/${vacunaId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración de vacuna:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener configuración de vacuna'
      };
    }
  }

  /**
   * Crear multiplicador
   */
  static async createMultiplicador(data: CreateMultiplicadorDto): Promise<ApiResponse<MultiplicadorJeringa>> {
    try {
      const response = await apiClient.post(this.BASE_URL, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear multiplicador:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear multiplicador'
      };
    }
  }

  /**
   * Actualizar multiplicador
   */
  static async updateMultiplicador(id: string, data: UpdateMultiplicadorDto): Promise<ApiResponse<MultiplicadorJeringa>> {
    try {
      const response = await apiClient.put(`${this.BASE_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar multiplicador:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar multiplicador'
      };
    }
  }

  /**
   * Eliminar multiplicador
   */
  static async deleteMultiplicador(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar multiplicador:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar multiplicador'
      };
    }
  }

  /**
   * Calcular jeringas necesarias para una vacuna y cantidad específica
   */
  static async calcularJeringas(vacunaId: string, cantidadVacunas: number): Promise<ApiResponse<CalculoJeringas>> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/calcular`, {
        vacunaId,
        cantidadVacunas
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al calcular jeringas:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al calcular jeringas'
      };
    }
  }

  /**
   * Obtener jeringas disponibles para configurar multiplicadores
   */
  static async getJeringasDisponibles(): Promise<ApiResponse<Jeringa[]>> {
    try {
      const response = await apiClient.get('/jeringas?estado=activo&limit=1000');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error: any) {
      console.error('Error al obtener jeringas disponibles:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener jeringas disponibles'
      };
    }
  }

  /**
   * Configurar multiplicadores por defecto para una vacuna
   * Crea configuración básica con jeringas comunes
   */
  static async configurarPorDefecto(vacunaId: string): Promise<ApiResponse<ConfiguracionMultiplicadores>> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/configurar-defecto`, {
        vacunaId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al configurar multiplicadores por defecto:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al configurar multiplicadores por defecto'
      };
    }
  }

  /**
   * Clonar configuración de multiplicadores de una vacuna a otra
   */
  static async clonarConfiguracion(vacunaOrigenId: string, vacunaDestinoId: string): Promise<ApiResponse<ConfiguracionMultiplicadores>> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/clonar`, {
        vacunaOrigenId,
        vacunaDestinoId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al clonar configuración:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al clonar configuración'
      };
    }
  }

  /**
   * Validar configuración de multiplicadores
   * Verifica que la configuración sea válida antes de generar vales
   */
  static async validarConfiguracion(vacunaId: string): Promise<ApiResponse<{ valida: boolean; errores: string[] }>> {
    try {
      const response = await apiClient.post(`${this.BASE_URL}/validar`, {
        vacunaId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al validar configuración:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al validar configuración'
      };
    }
  }
}
