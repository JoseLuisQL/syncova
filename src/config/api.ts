import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

/**
 * Configuración base para las llamadas API
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Instancia de axios configurada para el backend SIVAC
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos para operaciones normales
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Instancia de axios para operaciones que pueden tomar más tiempo (como reversiones de vales)
 */
export const apiClientLongTimeout: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutos para operaciones pesadas
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
      const token = localStorage.getItem('sivac_auth_token');
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
        const refreshToken = localStorage.getItem('sivac_refresh_token');
        if (refreshToken) {
          try {
            const response = await client.post('/auth/refresh', { refreshToken });
            const { accessToken } = response.data.data;

            // Actualizar token en localStorage
            localStorage.setItem('sivac_auth_token', accessToken);

            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return client(originalRequest);
          } catch (refreshError) {
            // Si falla el refresh, limpiar datos y redirigir a login
            localStorage.removeItem('sivac_auth_token');
            localStorage.removeItem('sivac_refresh_token');
            localStorage.removeItem('sivac_user');

            // Emitir evento personalizado para que el contexto de auth maneje el logout
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        } else {
          // No hay refresh token, limpiar datos
          localStorage.removeItem('sivac_auth_token');
          localStorage.removeItem('sivac_user');

          // Emitir evento personalizado para logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
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

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const queryString = searchParams.toString();
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
