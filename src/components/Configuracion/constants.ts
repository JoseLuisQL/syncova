import {
  Bell,
  Server,
  Building2,
} from 'lucide-react';

// Paleta de colores unificada con Inventario/Movimientos (teal/cyan)
export const COLORS = {
  primary: {
    gradient: 'from-teal-600 to-cyan-600',
    gradientHover: 'from-teal-700 to-cyan-700',
    bg: 'bg-teal-50',
    bgHover: 'hover:bg-teal-100',
    text: 'text-teal-700',
    textDark: 'text-teal-800',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    ring: 'ring-teal-500',
    focus: 'focus:ring-teal-500 focus:border-teal-500',
  },
  secondary: {
    gradient: 'from-cyan-500 to-teal-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    textDark: 'text-cyan-800',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
  },
  success: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    bgGradient: 'from-emerald-50 to-emerald-100',
    text: 'text-emerald-700',
    textDark: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    bgGradient: 'from-amber-50 to-amber-100',
    text: 'text-amber-700',
    textDark: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-50',
    bgGradient: 'from-rose-50 to-rose-100',
    text: 'text-rose-700',
    textDark: 'text-rose-800',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-800',
  },
  neutral: {
    bg: 'bg-gray-50',
    bgGradient: 'from-gray-50 to-gray-100',
    text: 'text-gray-700',
    textDark: 'text-gray-800',
    textLight: 'text-gray-500',
    border: 'border-gray-200',
    icon: 'text-gray-600',
  },
} as const;

// Configuración de secciones del módulo Configuración - Simplificado a 3 secciones esenciales
export interface ConfigSection {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'general' | 'alertas' | 'sistema';
}

export const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Informacion de la institucion',
    icon: Building2,
    category: 'general',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    description: 'Umbrales y notificaciones',
    icon: Bell,
    category: 'alertas',
  },
  {
    id: 'sistema',
    label: 'Sistema',
    description: 'Informacion del sistema',
    icon: Server,
    category: 'sistema',
  },
];

export const CATEGORY_LABELS = {
  general: 'General',
  alertas: 'Alertas',
  sistema: 'Sistema',
} as const;

// Estilos de componentes reutilizables
export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/30 to-blue-50/30',

  card: 'bg-white rounded-2xl border border-gray-100 shadow-sm',
  cardHover: 'hover:shadow-md transition-all duration-200',

  header: {
    container: 'bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20',
    title: 'text-xl sm:text-2xl font-bold text-gray-900',
    subtitle: 'text-sm text-gray-600 mt-0.5',
    iconWrapper: 'p-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg',
  },

  button: {
    primary: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
              bg-gradient-to-r from-teal-600 to-cyan-600 
              hover:from-teal-700 hover:to-cyan-700 
              shadow-md hover:shadow-lg 
              transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
                text-gray-700 bg-white border border-gray-200 
                hover:bg-gray-50 hover:border-gray-300
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed`,
    success: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
              bg-gradient-to-r from-emerald-600 to-emerald-700 
              hover:from-emerald-700 hover:to-emerald-800 
              shadow-md hover:shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed`,
    danger: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
             bg-gradient-to-r from-rose-600 to-rose-700 
             hover:from-rose-700 hover:to-rose-800 
             shadow-md hover:shadow-lg transition-all duration-200
             disabled:opacity-50 disabled:cursor-not-allowed`,
    icon: `p-2 rounded-lg transition-all duration-200 
           focus:outline-none focus:ring-2 focus:ring-offset-1`,
  },

  input: {
    base: `w-full px-4 py-2.5 rounded-xl border text-sm
           transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-0`,
    normal: 'border-gray-200 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-300',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30',
    label: 'block text-sm font-medium text-gray-700 mb-1.5',
    helpText: 'text-xs text-gray-500 mt-1',
    errorText: 'mt-1 text-xs text-rose-600',
  },

  select: {
    base: `w-full px-4 py-2.5 rounded-xl border text-sm font-medium
           bg-white transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-0
           disabled:bg-gray-50 disabled:cursor-not-allowed`,
    normal: 'border-gray-200 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-300',
  },

  toggle: {
    container: 'flex items-center justify-between py-3',
    wrapper: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
    active: 'bg-teal-600',
    inactive: 'bg-gray-200',
    dot: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
    dotActive: 'translate-x-6',
    dotInactive: 'translate-x-1',
    label: 'text-sm font-medium text-gray-700',
    description: 'text-xs text-gray-500',
  },

  modal: {
    overlay: 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    container: 'bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl',
    header: 'px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100',
    body: 'px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)]',
    footer: 'px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50',
  },

  section: {
    container: 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden',
    header: 'px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100',
    headerTitle: 'text-lg font-bold text-gray-900',
    headerSubtitle: 'text-sm text-gray-600',
    body: 'p-6',
    footer: 'px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3',
  },

  sidebar: {
    container: 'w-64 flex-shrink-0 bg-white border-r border-gray-100',
    containerMobile: 'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 shadow-xl transform transition-transform duration-300',
    item: `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl
           transition-all duration-200 cursor-pointer`,
    itemActive: 'bg-teal-50 text-teal-700 border border-teal-200',
    itemInactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
    category: 'px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider',
  },

  alert: {
    info: 'bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-xl p-4',
    warning: 'bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4',
    error: 'bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4',
    success: 'bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4',
  },
} as const;

// Claves de configuración en la base de datos
export const CONFIG_KEYS = {
  // General
  SISTEMA_NOMBRE: 'sistema_nombre',
  INSTITUCION_NOMBRE: 'institucion_nombre',
  INSTITUCION_DIRECCION: 'institucion_direccion',
  INSTITUCION_TELEFONO: 'institucion_telefono',
  INSTITUCION_EMAIL: 'institucion_email',
  TIMEZONE: 'timezone',
  FORMATO_FECHA: 'formato_fecha',
  
  // Alertas
  ALERTAS_DIAS_ANTICIPACION: 'alertas_dias_anticipacion',
  ALERTAS_STOCK_MINIMO: 'alertas_stock_minimo',
  ALERTAS_DIAS_RETENCION: 'alertas_dias_retencion',
  
  // Sistema
  SISTEMA_VERSION: 'sistema_version',
  TIEMPO_SESION: 'tiempo_sesion',
} as const;

// Valores por defecto de configuración
export const DEFAULT_CONFIG = {
  general: {
    sistemaNombre: 'SIVAC - Sistema de Gestion de Vacunas',
    institucionNombre: 'DISA Apurimac II',
    institucionDireccion: 'Jr. Lima 123, Andahuaylas, Apurimac',
    institucionTelefono: '+51 983 456 789',
    institucionEmail: 'contacto@saludapurimac.gob.pe',
    timezone: 'America/Lima',
    formatoFecha: 'DD/MM/YYYY',
  },
  alertas: {
    diasAnticipacion: 30,
    stockMinimo: 100,
    diasRetencion: 30,
  },
  sistema: {
    version: '2.1.0',
    tiempoSesion: 480,
  },
} as const;

export type ConfiguracionState = typeof DEFAULT_CONFIG;
export type SectionId = typeof CONFIG_SECTIONS[number]['id'];
export type ColorScheme = keyof typeof COLORS;
