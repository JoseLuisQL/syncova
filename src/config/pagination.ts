/**
 * Configuración de paginación para el frontend
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

  // Configuración específica por entidad
  ENTITY_LIMITS: {
    VACUNAS: 1000,
    JERINGAS: 1000,
    LOTES_VACUNAS: 1000,
    LOTES_JERINGAS: 1000,
    MOVIMIENTOS: 100,
    USUARIOS: 100
  }
};

/**
 * Obtiene el límite por defecto para una entidad específica
 */
export function getDefaultLimit(entity: keyof typeof PAGINATION_CONFIG.ENTITY_LIMITS): number {
  return PAGINATION_CONFIG.ENTITY_LIMITS[entity] || PAGINATION_CONFIG.DEFAULT_LIMITS.MAIN_LISTING;
}

/**
 * Obtiene el límite para dropdowns/selecciones
 */
export function getDropdownLimit(): number {
  return PAGINATION_CONFIG.DEFAULT_LIMITS.DROPDOWN;
}

/**
 * Obtiene el límite para paginación tradicional
 */
export function getPaginatedLimit(): number {
  return PAGINATION_CONFIG.DEFAULT_LIMITS.PAGINATED;
}

/**
 * Obtiene el límite para búsquedas
 */
export function getSearchLimit(): number {
  return PAGINATION_CONFIG.DEFAULT_LIMITS.SEARCH;
}

/**
 * Obtiene el límite para exportaciones
 */
export function getExportLimit(): number {
  return PAGINATION_CONFIG.DEFAULT_LIMITS.EXPORT;
}
