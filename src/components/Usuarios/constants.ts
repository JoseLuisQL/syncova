import {
  Users,
  Shield,
  Key,
  CheckCircle,
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

// Configuración de secciones del módulo Usuarios
export const USER_SECTIONS = [
  {
    id: 'usuarios',
    label: 'Usuarios',
    description: 'Cuentas, trazabilidad y alcance operativo',
    icon: Users,
    path: '/usuarios/usuarios',
  },
  {
    id: 'roles',
    label: 'Roles',
    description: 'Roles del sistema y perfiles personalizados',
    icon: Shield,
    path: '/usuarios/roles',
  },
  {
    id: 'permisos',
    label: 'Permisos',
    description: 'Catálogo auditable de permisos del sistema',
    icon: Key,
    path: '/usuarios/permisos',
  },
] as const;

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
    ghost: `inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent
            text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`,
    success: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
              bg-gradient-to-r from-emerald-600 to-emerald-700 
              hover:from-emerald-700 hover:to-emerald-800 
              shadow-md hover:shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed`,
    warning: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
              bg-gradient-to-r from-amber-500 to-amber-600 
              hover:from-amber-600 hover:to-amber-700 
              shadow-md hover:shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed`,
    danger: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white 
             bg-gradient-to-r from-rose-600 to-rose-700 
             hover:from-rose-700 hover:to-rose-800 
             shadow-md hover:shadow-lg transition-all duration-200
             disabled:opacity-50 disabled:cursor-not-allowed`,
    icon: `p-2 rounded-lg transition-all duration-200 
           focus:outline-none focus:ring-2 focus:ring-offset-1`,
    iconEdit: 'text-teal-600 bg-teal-50 hover:bg-teal-100 focus:ring-teal-500',
    iconDelete: 'text-rose-600 bg-rose-50 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 focus:ring-cyan-500',
    iconKey: 'text-amber-600 bg-amber-50 hover:bg-amber-100 focus:ring-amber-500',
    iconShield: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 focus:ring-emerald-500',
  },

  input: {
    base: `w-full px-4 py-2.5 rounded-xl border text-sm
           transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-0`,
    normal: 'border-gray-200 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-300',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30',
    label: 'block text-sm font-medium text-gray-700 mb-1.5',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-slate-500',
  },

  select: {
    base: `w-full px-4 py-2.5 rounded-xl border text-sm font-medium
           bg-white transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-0
           disabled:bg-gray-50 disabled:cursor-not-allowed`,
    normal: 'border-gray-200 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-300',
  },

  table: {
    container: 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden',
    header: 'bg-gradient-to-r from-gray-50 to-gray-100',
    headerCell: 'px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
    row: 'hover:bg-teal-50/30 transition-colors duration-150 border-b border-gray-100',
    rowSelected: 'bg-teal-50/50',
    cell: 'px-4 py-4',
    emptyIcon: 'h-12 w-12 mx-auto text-gray-300 mb-4',
  },

  badge: {
    active: 'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700',
    inactive: 'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600',
    count: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-700',
    warning: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700',
    danger: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-rose-100 text-rose-700',
    info: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700',
    role: 'inline-flex px-2.5 py-1 text-xs font-semibold rounded-full',
  },

  modal: {
    overlay: 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto',
    containerShell: 'mx-auto w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl',
    container: 'bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl',
    containerMedium: 'bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl',
    containerLarge: 'bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl',
    header: 'px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100',
    headerTitle: 'text-lg font-bold text-gray-900',
    body: 'px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)]',
    footer: 'px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50',
  },

  stats: {
    card: 'rounded-2xl p-4 border transition-all duration-200',
    cardGradient: 'rounded-2xl p-4 text-white',
    value: 'text-2xl font-bold',
    label: 'text-sm font-medium opacity-90',
    iconWrapper: 'p-2.5 rounded-xl',
  },

  filter: {
    container: 'bg-white rounded-2xl border border-gray-100 shadow-sm p-4',
    searchIcon: 'absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400',
    searchInput: `w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 
                  transition-all duration-200 hover:border-gray-300`,
  },

  nav: {
    container: 'bg-white border-b border-gray-100 sticky top-[73px] z-10',
    tab: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 cursor-pointer`,
    tabActive: 'bg-teal-50 text-teal-700 border border-teal-200',
    tabInactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  },

  pagination: {
    container: 'bg-gray-50/50 px-5 py-4 border-t border-gray-100',
    info: 'text-sm text-gray-600',
    button: 'px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonActive: 'bg-teal-50 border-teal-500 text-teal-700',
    buttonInactive: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
  },

  bulkActions: {
    container: 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-3',
    text: 'text-teal-800 font-medium text-sm',
  },
} as const;

// Configuración de estadísticas
export const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Usuarios',
    icon: Users,
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    key: 'activos',
    label: 'Activos',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: Shield,
    gradient: 'from-cyan-500 to-cyan-600',
  },
] as const;

// Columnas de la tabla de usuarios
export const TABLA_COLUMNAS = [
  { key: 'checkbox', label: '', align: 'center' as const, width: 'w-12' },
  { key: 'usuario', label: 'Usuario', align: 'left' as const, width: 'flex-1' },
  { key: 'rol', label: 'Rol', align: 'left' as const, width: 'w-40' },
  { key: 'estado', label: 'Estado', align: 'center' as const, width: 'w-28' },
  { key: 'acciones', label: 'Acciones', align: 'center' as const, width: 'w-36' },
] as const;

// Colores de roles por defecto
export const ROLE_COLORS: Record<string, string> = {
  administrador: 'bg-rose-100 text-rose-800',
  coordinador: 'bg-teal-100 text-teal-800',
  responsable_acopio: 'bg-cyan-100 text-cyan-800',
  operador: 'bg-amber-100 text-amber-800',
  default: 'bg-gray-100 text-gray-800',
};

export const DEFAULT_ROLE_ASSIGNABLE_PERMISSION_CODES: Record<string, string[] | null> = {
  administrador: null,
  coordinador: [
    'dashboard:read',
    'redes:read',
    'microredes:read',
    'centros_acopio:read',
    'establecimientos:read',
    'vacunas:read',
    'jeringas:read',
    'movimientos:read',
    'planificacion:read',
    'planificacion:write',
    'planificacion:aprobar',
    'reportes_inventario:read',
    'reportes_inventario:export',
    'reportes_movimientos:read',
    'reportes_movimientos:export',
    'reportes_planificacion:read',
    'reportes_planificacion:export',
    'roles:read',
    'permisos:read',
    'usuarios:read',
  ],
  responsable_acopio: [
    'dashboard:read',
    'establecimientos:read',
    'vacunas:read',
    'movimientos:read',
    'planificacion:read',
  ],
  operador: [
    'dashboard:read',
    'establecimientos:read',
    'vacunas:read',
    'movimientos:read',
    'planificacion:read',
  ],
};

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof USER_SECTIONS[number]['id'];
