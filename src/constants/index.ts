/**
 * Constantes de configuración del sistema SIVAC
 */

// Claves de LocalStorage para autenticación
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sivac_auth_token',
  REFRESH_TOKEN: 'sivac_refresh_token',
  USER: 'sivac_user',
} as const;

// Timeouts para peticiones API (en milisegundos)
export const API_TIMEOUTS = {
  DEFAULT: 30000,     // 30 segundos para operaciones normales
  LONG: 120000,       // 2 minutos para operaciones pesadas
  EXPORT: 180000,     // 3 minutos para exportaciones grandes
} as const;

// Puertos por defecto
export const DEFAULT_PORTS = {
  BACKEND: 3001,
  FRONTEND: 5173,
} as const;

// Límites de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Rangos de años válidos
export const YEAR_RANGE = {
  MIN: 2020,
  MAX: 2050,
} as const;

// Eventos del sistema
export const SYSTEM_EVENTS = {
  AUTH_LOGOUT: 'auth:logout',
} as const;
