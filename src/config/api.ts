import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { STORAGE_KEYS, API_TIMEOUTS, DEFAULT_PORTS, SYSTEM_EVENTS } from '../constants';

/**
 * Configuración base para las llamadas API
 * Detecta automáticamente si se accede desde la red local o localhost
 */
export const getApiBaseUrl = () => {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detectar si estamos accediendo desde la red local
  const currentHost = window.location.hostname;
  
  // Si el hostname es una IP de red local (no localhost), usar esa IP para la API
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:${DEFAULT_PORTS.BACKEND}/api`;
  }
  
  // Por defecto, usar localhost
  return `http://localhost:${DEFAULT_PORTS.BACKEND}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: mostrar la URL que se está usando
console.log('🔗 API Base URL configurada:', API_BASE_URL);

/**
 * Instancia de axios configurada para el backend SIVAC
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUTS.DEFAULT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Instancia de axios para operaciones que pueden tomar más tiempo (como reversiones de vales)
 */
export const apiClientLongTimeout: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUTS.LONG,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Función para configurar interceptors
 */
const setupInterceptors = (client: AxiosInstance) => {
  // Interceptor para requests
  client.interceptors.request.use(
    (config) => {
      // Agregar token de autenticación si existe
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Manejo centralizado de errores
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Intentar refrescar el token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            const response = await client.post('/auth/refresh', { refreshToken });
            const { accessToken } = response.data.data;

            // Actualizar token en localStorage
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            // Si falla el refresh, limpiar datos y redirigir a login
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);

            // Emitir evento personalizado para que el contexto de auth maneje el logout
            window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.AUTH_LOGOUT));
          }
        } else {
          // No hay refresh token, limpiar datos
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);

          // Emitir evento personalizado para logout
          window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.AUTH_LOGOUT));
        }
      } else if (error.response?.status === 403) {
        console.warn('Acceso denegado');
      } else if (error.response?.status >= 500) {
        console.error('Error del servidor:', error.message);
      }

      return Promise.reject(error);
    }
  );
};

// Aplicar interceptors a ambas instancias
setupInterceptors(apiClient);
setupInterceptors(apiClientLongTimeout);



/**
 * Tipos para respuestas estándar del backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

/**
 * Tipos para filtros y parámetros de consulta
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

/**
 * Función helper para construir parámetros de consulta
 */
export const buildQueryParams = (params?: QueryParams): string => {
  if (!params) return '';

  console.log('🔧 buildQueryParams - Parámetros recibidos:', params);

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      console.log(`🔧 buildQueryParams - Agregando: ${key} = ${value}`);
      searchParams.append(key, value.toString());
    } else {
      console.log(`🔧 buildQueryParams - Omitiendo: ${key} = ${value} (undefined/null/empty)`);
    }
  });

  const queryString = searchParams.toString();
  console.log('🔧 buildQueryParams - Query string final:', queryString);
  return queryString ? `?${queryString}` : '';
};

/**
 * Función helper para manejar errores de API
 */
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    return errorData.error || errorData.message || 'Error en la operación';
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Tiempo de espera agotado. La operación está tomando más tiempo del esperado.';
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'Error de conexión. Verifique que el servidor esté funcionando.';
  }
  
  return error.message || 'Error desconocido';
};

export default apiClient;
console.log('API Base URL:', getApiBaseUrl());
