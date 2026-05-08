/**
 * Utilidades para debugging y desarrollo
 */
import { getApiBaseUrl } from '../config/api';

export const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';
export const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

/**
 * Logger para desarrollo
 */
export const logger = {
  info: (message: string, data?: any) => {
    // Temporalmente habilitado para debugging
    console.log(`[SIVAC INFO] ${message}`, data || '');
  },

  success: (message: string, data?: any) => {
    // Temporalmente habilitado para debugging
    console.log(`[SIVAC SUCCESS] ${message}`, data || '');
  },

  error: (message: string, error?: any) => {
    // Temporalmente habilitado para debugging
    console.error(`[SIVAC ERROR] ${message}`, error || '');
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[SIVAC WARN] ${message}`, data || '');
    }
  },
  
  debug: (message: string, data?: any) => {
    // Temporalmente habilitado para debugging
    console.debug(`[SIVAC DEBUG] ${message}`, data || '');
  }
};

/**
 * Función para formatear errores de API
 */
export const formatApiError = (error: any): string => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Error desconocido';
};

/**
 * Función para verificar la conexión con el backend
 */
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const backendOrigin = apiBaseUrl.endsWith('/api')
      ? apiBaseUrl.slice(0, -4)
      : apiBaseUrl;
    const response = await fetch(`${backendOrigin}/health`);
    return response.ok;
  } catch (error) {
    logger.error('Error al verificar conexión con backend', error);
    return false;
  }
};
