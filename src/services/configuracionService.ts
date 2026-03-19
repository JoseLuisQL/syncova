import {
  apiClient,
  ApiResponse,
  handleApiError,
  getApiBaseUrl
} from '../config/api';
import { AxiosError } from 'axios';
import { logger } from '../utils/debug';

export interface ConfiguracionSistema {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipoDato: string;
  categoria: string;
  esPublico: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfiguracionMap {
  [clave: string]: string;
}

/**
 * Servicio para gestión de configuraciones del sistema
 */
export class ConfiguracionService {
  private static readonly BASE_PATH = '/configuracion';

  /**
   * Obtener todas las configuraciones públicas
   */
  static async getPublic(): Promise<ConfiguracionSistema[]> {
    try {
      logger.debug('Obteniendo configuraciones públicas');
      const response = await apiClient.get<ApiResponse<ConfiguracionSistema[]>>(`${this.BASE_PATH}/public`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener configuraciones');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener configuraciones públicas', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener todas las configuraciones (requiere autenticación de admin)
   */
  static async getAll(): Promise<ConfiguracionSistema[]> {
    try {
      logger.debug('Obteniendo todas las configuraciones');
      const response = await apiClient.get<ApiResponse<ConfiguracionSistema[]>>(this.BASE_PATH);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener configuraciones');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener configuraciones', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener configuración por clave
   */
  static async getByKey(clave: string): Promise<ConfiguracionSistema | null> {
    try {
      logger.debug('Obteniendo configuración por clave', { clave });
      const response = await apiClient.get<ApiResponse<ConfiguracionSistema>>(`${this.BASE_PATH}/${clave}`);

      if (!response.data.success) {
        return null;
      }

      return response.data.data || null;
    } catch (error) {
      logger.error('Error al obtener configuración por clave', { clave, error });
      return null;
    }
  }

  /**
   * Obtener configuraciones por categoría
   */
  static async getByCategory(categoria: string): Promise<ConfiguracionSistema[]> {
    try {
      logger.debug('Obteniendo configuraciones por categoría', { categoria });
      const response = await apiClient.get<ApiResponse<ConfiguracionSistema[]>>(`${this.BASE_PATH}/categoria/${categoria}`);

      if (!response.data.success || !response.data.data) {
        return [];
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener configuraciones por categoría', { categoria, error });
      return [];
    }
  }

  /**
   * Crear nueva configuración
   */
  static async create(data: {
    clave: string;
    valor: string;
    descripcion?: string;
    tipoDato?: string;
    categoria?: string;
    esPublico?: boolean;
  }): Promise<ConfiguracionSistema> {
    try {
      logger.debug('Creando configuración', { data });
      const response = await apiClient.post<ApiResponse<ConfiguracionSistema>>(this.BASE_PATH, data);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al crear configuración');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al crear configuración', { data, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar valor de configuración por clave
   */
  static async updateByKey(clave: string, valor: string): Promise<ConfiguracionSistema> {
    try {
      logger.debug('Actualizando configuración por clave', { clave, valor });
      const response = await apiClient.patch<ApiResponse<ConfiguracionSistema>>(
        `${this.BASE_PATH}/${clave}/valor`,
        { valor }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al actualizar configuración');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al actualizar configuración', { clave, valor, error });
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Actualizar múltiples configuraciones
   */
  static async bulkUpdate(configuraciones: Array<{ clave: string; valor: string }>): Promise<ConfiguracionSistema[]> {
    try {
      logger.debug('Actualizando múltiples configuraciones', { count: configuraciones.length });
      const response = await apiClient.put<ApiResponse<ConfiguracionSistema[]>>(
        `${this.BASE_PATH}/bulk`,
        { configuraciones }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al actualizar configuraciones');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al actualizar múltiples configuraciones', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener información del sistema
   */
  static async getSystemInfo(): Promise<{ configuraciones: ConfiguracionMap; timestamp: string }> {
    try {
      logger.debug('Obteniendo información del sistema');
      const response = await apiClient.get<ApiResponse<{ configuraciones: ConfiguracionMap; timestamp: string }>>(
        `${this.BASE_PATH}/sistema/info`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener información del sistema');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al obtener información del sistema', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Convertir array de configuraciones a mapa clave-valor
   */
  static toMap(configuraciones: ConfiguracionSistema[]): ConfiguracionMap {
    const map: ConfiguracionMap = {};
    configuraciones.forEach(config => {
      map[config.clave] = config.valor;
    });
    return map;
  }

  /**
   * Obtener valor tipado de una configuración
   */
  static getValue<T>(configuraciones: ConfiguracionSistema[], clave: string, defaultValue: T): T {
    const config = configuraciones.find(c => c.clave === clave);
    if (!config) return defaultValue;

    try {
      switch (config.tipoDato) {
        case 'number':
          return parseFloat(config.valor) as unknown as T;
        case 'boolean':
          return (config.valor.toLowerCase() === 'true' || config.valor === '1') as unknown as T;
        case 'json':
          return JSON.parse(config.valor) as T;
        default:
          return config.valor as unknown as T;
      }
    } catch {
      return defaultValue;
    }
  }

  /**
   * Subir logo institucional
   */
  static async uploadLogo(file: File): Promise<{ url: string; filename: string }> {
    try {
      logger.debug('Subiendo logo institucional');
      const formData = new FormData();
      formData.append('logo', file);

      const response = await apiClient.post<ApiResponse<{ url: string; filename: string }>>(
        `${this.BASE_PATH}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Error al subir logo');
      }

      return response.data.data;
    } catch (error) {
      logger.error('Error al subir logo', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener información del logo
   */
  static async getLogo(): Promise<{ url: string; exists: boolean } | null> {
    try {
      logger.debug('Obteniendo logo institucional');
      const response = await apiClient.get<ApiResponse<{ url: string; exists: boolean }>>(
        `${this.BASE_PATH}/logo`
      );

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch {
      logger.debug('No hay logo configurado');
      return null;
    }
  }

  /**
   * Eliminar logo institucional
   */
  static async deleteLogo(): Promise<boolean> {
    try {
      logger.debug('Eliminando logo institucional');
      const response = await apiClient.delete<ApiResponse<void>>(
        `${this.BASE_PATH}/logo`
      );

      return response.data.success;
    } catch (error) {
      logger.error('Error al eliminar logo', error);
      throw handleApiError(error as AxiosError);
    }
  }

  /**
   * Obtener URL del logo para mostrar
   */
  static getLogoFileUrl(): string {
    return `${getApiBaseUrl()}${this.BASE_PATH}/logo/file`;
  }
}
