/**
 * Configuración de paginación para el sistema
 * Permite ajustar los límites según el caso de uso
 */

export const PAGINATION_CONFIG = {
  // Límites por defecto para diferentes tipos de consultas
  DEFAULT_LIMITS: {
    // Para listados principales (inventario, gestión)
    MAIN_LISTING: 1000,
    
    // Para paginación tradicional (cuando se requiere navegación por páginas)
    PAGINATED: 50,
    
    // Para dropdowns y selecciones
    DROPDOWN: 1000,
    
    // Para reportes y exportaciones
    EXPORT: 5000,
    
    // Para búsquedas y filtros
    SEARCH: 1000
  },

  // Límites máximos permitidos
  MAX_LIMITS: {
    // Límite máximo general
    GENERAL: 1000,
    
    // Límite máximo para exportaciones
    EXPORT: 5000,
    
    // Límite máximo para administradores
    ADMIN: 10000
  },

  // Configuración específica por entidad
  ENTITY_LIMITS: {
    VACUNAS: {
      default: 1000,
      max: 1000
    },
    JERINGAS: {
      default: 1000,
      max: 1000
    },
    LOTES_VACUNAS: {
      default: 1000,
      max: 1000
    },
    LOTES_JERINGAS: {
      default: 1000,
      max: 1000
    },
    MOVIMIENTOS: {
      default: 100,
      max: 1000
    },
    USUARIOS: {
      default: 100,
      max: 500
    }
  }
};

/**
 * Obtiene el límite por defecto para una entidad específica
 */
export function getDefaultLimit(entity: keyof typeof PAGINATION_CONFIG.ENTITY_LIMITS): number {
  return PAGINATION_CONFIG.ENTITY_LIMITS[entity]?.default || PAGINATION_CONFIG.DEFAULT_LIMITS.MAIN_LISTING;
}

/**
 * Obtiene el límite máximo para una entidad específica
 */
export function getMaxLimit(entity: keyof typeof PAGINATION_CONFIG.ENTITY_LIMITS): number {
  return PAGINATION_CONFIG.ENTITY_LIMITS[entity]?.max || PAGINATION_CONFIG.MAX_LIMITS.GENERAL;
}

/**
 * Valida si un límite es válido para una entidad específica
 */
export function validateLimit(limit: number, entity: keyof typeof PAGINATION_CONFIG.ENTITY_LIMITS): boolean {
  const maxLimit = getMaxLimit(entity);
  return limit > 0 && limit <= maxLimit;
}

/**
 * Obtiene un límite seguro (aplica el máximo si excede)
 */
export function getSafeLimit(limit: number, entity: keyof typeof PAGINATION_CONFIG.ENTITY_LIMITS): number {
  const maxLimit = getMaxLimit(entity);
  return Math.min(Math.max(limit, 1), maxLimit);
}
