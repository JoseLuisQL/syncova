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
  
  // Si no estamos en localhost, asumir proxy reverso bajo el mismo origen
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  
  // Por defecto, usar localhost
  return `http://localhost:${DEFAULT_PORTS.BACKEND}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: mostrar la URL que se está usando
console.log('🔗 API Base URL configurada:', API_BASE_URL);

let refreshTokenPromise: Promise<string> | null = null;

const getErrorStatus = (error: unknown): number | undefined => {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
};

const getRetryAfterSeconds = (error: AxiosError): string | undefined => {
  const data = error.response?.data as any;
  const headerRetryAfter = error.response?.headers?.['retry-after'];
  return data?.retryAfter?.toString() || headerRetryAfter?.toString();
};

export const formatRateLimitMessage = (error: AxiosError): string => {
  const data = error.response?.data as any;
  const retryAfter = getRetryAfterSeconds(error);
  const message = data?.message || 'Demasiadas solicitudes, intente nuevamente más tarde';

  return retryAfter
    ? `${message}. Reintente en ${retryAfter} segundos.`
    : message;
};

const clearStoredAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

const requestNewAccessToken = async (refreshToken: string): Promise<string> => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      timeout: API_TIMEOUTS.DEFAULT,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const accessToken = response.data?.data?.accessToken;
  if (!response.data?.success || !accessToken) {
    throw new Error(response.data?.message || response.data?.error || 'Error al refrescar token');
  }

  return accessToken;
};

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
      const originalRequest = (error.config || {}) as any;

      if (error.response?.status === 429) {
        console.warn('Límite de solicitudes alcanzado:', formatRateLimitMessage(error));
        return Promise.reject(error);
      }

      const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
      const isLoginRequest = originalRequest.url?.includes('/auth/login');

      // Manejo centralizado de errores
      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isLoginRequest) {
        originalRequest._retry = true;

        // Intentar refrescar el token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            if (!refreshTokenPromise) {
              refreshTokenPromise = requestNewAccessToken(refreshToken).finally(() => {
                refreshTokenPromise = null;
              });
            }

            const accessToken = await refreshTokenPromise;

            // Actualizar token en localStorage
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);

            // Reintentar la petición original con el nuevo token
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            if (getErrorStatus(refreshError) === 429) {
              return Promise.reject(refreshError);
            }

            // Si falla el refresh por token inválido, limpiar datos y redirigir a login
            clearStoredAuth();

            // Emitir evento personalizado para que el contexto de auth maneje el logout
            window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.AUTH_LOGOUT));
            return Promise.reject(refreshError);
          }
        } else {
          // No hay refresh token, limpiar datos
          clearStoredAuth();

          // Emitir evento personalizado para logout
          window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.AUTH_LOGOUT));
        }
      } else if (error.response?.status === 403) {
        console.warn('Acceso denegado');
      } else if ((error.response?.status || 0) >= 500) {
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
  if (error.response?.status === 429) {
    return formatRateLimitMessage(error);
  }

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
