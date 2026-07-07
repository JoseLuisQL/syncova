/**
 * Configuración del Módulo de Vales de Entrega
 * Centraliza todas las configuraciones y constantes del módulo
 */

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 10,
  SHOW_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Configuración de debounce
export const DEBOUNCE_CONFIG = {
  SEARCH_DELAY: 500, // ms para búsqueda
  FILTER_DELAY: 300, // ms para filtros
  AUTO_SAVE_DELAY: 1000 // ms para auto-guardado
};

// Configuración de cache
export const CACHE_CONFIG = {
  VALES_TTL: 5 * 60 * 1000, // 5 minutos
  ESTABLECIMIENTOS_TTL: 30 * 60 * 1000, // 30 minutos
  VACUNAS_TTL: 60 * 60 * 1000, // 1 hora
  MULTIPLICADORES_TTL: 15 * 60 * 1000 // 15 minutos
};

// Estados de vale disponibles
export const ESTADOS_VALE = [
  { value: 'todos', label: 'Todos los estados', color: 'gray' },
  { value: 'generado', label: 'Generado', color: 'blue' },
  { value: 'impreso', label: 'Impreso', color: 'yellow' },
  { value: 'entregado', label: 'Entregado', color: 'green' }
] as const;

// Configuración de validaciones
export const VALIDATION_CONFIG = {
  MIN_YEAR: 2020,
  MAX_YEAR: new Date().getFullYear() + 2,
  MAX_OBSERVACIONES_LENGTH: 500,
  MIN_CANTIDAD_VALE: 1,
  MAX_CANTIDAD_VALE: 999999
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  SUCCESS_DURATION: 3000, // ms
  ERROR_DURATION: 5000, // ms
  WARNING_DURATION: 4000, // ms
  INFO_DURATION: 3000 // ms
};

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  MODAL_DURATION: 300, // ms
  FADE_DURATION: 200, // ms
  SLIDE_DURATION: 250, // ms
  BOUNCE_DURATION: 400 // ms
};

// Configuración de exportación
export const EXPORT_CONFIG = {
  PDF_MARGINS: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  PDF_FORMAT: 'A4' as const,
  PDF_ORIENTATION: 'portrait' as const,
  EXCEL_SHEET_NAME: 'Vales de Entrega'
};

// Configuración de impresión
export const PRINT_CONFIG = {
  PAGE_SIZE: 'A4',
  MARGINS: '1cm',
  FONT_SIZE: '12px',
  HEADER_HEIGHT: '2cm',
  FOOTER_HEIGHT: '1cm'
};

// Mensajes de confirmación
export const CONFIRMATION_MESSAGES = {
  DELETE_VALE: (numero: string) => `⚠️ ELIMINAR VALE ${numero}

Esta acción:
• Eliminará permanentemente el vale de la base de datos
• Restaurará automáticamente todos los stocks de lotes afectados
• Eliminará los registros del kardex relacionados
• NO SE PUEDE DESHACER

¿Está completamente seguro de continuar?`,

  REVERT_VALE: (numero: string) => `🔄 REVERTIR VALE ${numero}

Esta acción:
• Cambiará el estado del vale a "pendiente"
• Restaurará automáticamente todos los stocks de lotes afectados
• Eliminará los registros del kardex relacionados
• Permitirá regenerar el vale posteriormente

¿Está seguro de revertir este vale?`,

  GENERATE_VALE: (centro: string, periodo: string) => `✅ GENERAR VALE

Centro de Acopio: ${centro}
Período: ${periodo}

Esta acción:
• Generará el vale con todas las entregas programadas
• Afectará automáticamente los stocks de lotes
• Registrará movimientos en el kardex
• Creará un vale con número único

¿Confirma la generación del vale?`
};

// Configuración de colores por estado
export const STATUS_COLORS = {
  generado: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-600'
  },
  impreso: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-600'
  },
  entregado: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-600'
  },
  pendiente: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-200',
    icon: 'text-zinc-600'
  }
} as const;

// Configuración de iconos
export const ICONS_CONFIG = {
  VALE: 'Receipt',
  CENTRO_ACOPIO: 'Building2',
  VACUNA: 'Package',
  JERINGA: 'Syringe',
  CALENDARIO: 'Calendar',
  USUARIO: 'User',
  GENERAR: 'Plus',
  ELIMINAR: 'Trash2',
  REVERTIR: 'RotateCcw',
  VER: 'Eye',
  IMPRIMIR: 'Printer',
  DESCARGAR: 'Download',
  CONFIGURAR: 'Settings',
  BUSCAR: 'Search',
  FILTRAR: 'Filter',
  ACTUALIZAR: 'RefreshCw',
  CERRAR: 'X',
  GUARDAR: 'Save',
  CARGAR: 'Loader2'
} as const;

// Configuración de formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  FILENAME: 'yyyyMMdd_HHmmss'
};

// Configuración de números
export const NUMBER_FORMATS = {
  LOCALE: 'es-PE',
  CURRENCY: 'PEN',
  DECIMAL_PLACES: 2,
  THOUSANDS_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.'
};

// Configuración de URLs de API
export const API_ENDPOINTS = {
  VALES: '/api/vales',
  MULTIPLICADORES: '/api/multiplicadores',
  VISTA_PREVIA: '/api/vales/vista-previa',
  GENERAR: '/api/vales/generar',
  REVERTIR: (id: string) => `/api/vales/${id}/revertir`,
  ESTADO: (id: string) => `/api/vales/${id}/estado`,
  JERINGAS: '/api/jeringas',
  ESTABLECIMIENTOS: '/api/establecimientos',
  VACUNAS: '/api/vacunas'
};

// Configuración de localStorage
export const STORAGE_KEYS = {
  VALES_FILTERS: 'vales_filters',
  VALES_PAGE_SIZE: 'vales_page_size',
  VALES_SORT: 'vales_sort',
  USER_PREFERENCES: 'user_preferences',
  CACHE_PREFIX: 'vales_cache_'
};

// Configuración de logs
export const LOG_CONFIG = {
  ENABLED: import.meta.env.MODE === 'development',
  LEVEL: 'info' as const,
  PREFIX: '[VALES]',
  COLORS: {
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  }
};

// Configuración de performance
export const PERFORMANCE_CONFIG = {
  VIRTUAL_SCROLL_THRESHOLD: 100, // Activar scroll virtual con más de 100 items
  LAZY_LOAD_THRESHOLD: 50, // Cargar más datos cuando quedan 50 items
  DEBOUNCE_RESIZE: 250, // ms para redimensionamiento de ventana
  THROTTLE_SCROLL: 16 // ms para scroll (60fps)
};

// Configuración de accesibilidad
export const A11Y_CONFIG = {
  FOCUS_VISIBLE: true,
  HIGH_CONTRAST: false,
  REDUCED_MOTION: false,
  SCREEN_READER_ANNOUNCEMENTS: true,
  KEYBOARD_NAVIGATION: true
};

// Configuración de responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Configuración de testing
export const TEST_CONFIG = {
  MOCK_DELAY: 1000, // ms para simular latencia de red
  MOCK_ERROR_RATE: 0.1, // 10% de probabilidad de error en mocks
  TEST_IDS: {
    VALES_TABLE: 'vales-table',
    GENERAR_BUTTON: 'generar-vale-button',
    FILTROS_FORM: 'filtros-form',
    DETALLE_MODAL: 'detalle-modal',
    CONFIRMAR_MODAL: 'confirmar-modal'
  }
};

// Función para obtener configuración por entorno
export const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  const isProduction = import.meta.env.MODE === 'production';
  const isTesting = import.meta.env.MODE === 'test';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    || import.meta.env.VITE_API_URL?.replace(/\/api$/, '')
    || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

  return {
    isDevelopment,
    isProduction,
    isTesting,
    apiBaseUrl,
    enableMocks: isDevelopment && import.meta.env.VITE_ENABLE_MOCKS === 'true',
    enableLogs: isDevelopment || import.meta.env.VITE_ENABLE_LOGS === 'true',
    enableAnalytics: isProduction && import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  };
};

// Función para validar configuración
export const validateConfig = () => {
  const errors: string[] = [];

  if (PAGINATION_CONFIG.DEFAULT_PAGE_SIZE > PAGINATION_CONFIG.MAX_PAGE_SIZE) {
    errors.push('DEFAULT_PAGE_SIZE no puede ser mayor que MAX_PAGE_SIZE');
  }

  if (VALIDATION_CONFIG.MIN_YEAR > VALIDATION_CONFIG.MAX_YEAR) {
    errors.push('MIN_YEAR no puede ser mayor que MAX_YEAR');
  }

  if (DEBOUNCE_CONFIG.SEARCH_DELAY < 0) {
    errors.push('SEARCH_DELAY debe ser un número positivo');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Exportar configuración por defecto
export default {
  PAGINATION_CONFIG,
  DEBOUNCE_CONFIG,
  CACHE_CONFIG,
  ESTADOS_VALE,
  VALIDATION_CONFIG,
  NOTIFICATION_CONFIG,
  ANIMATION_CONFIG,
  STATUS_COLORS,
  API_ENDPOINTS,
  getEnvironmentConfig,
  validateConfig
};
