import {
  Users,
  Shield,
  Key,
  CheckCircle,
} from '@phosphor-icons/react';
import { DESIGN_GRADIENTS, DESIGN_TOKENS } from '../../styles/designTokens';

// Paleta de colores unificada (Cockpit Mode - Zinc)
export const COLORS = {
  primary: {
    gradient: DESIGN_GRADIENTS.primary,
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgHover: 'hover:bg-zinc-100',
    text: 'text-zinc-900',
    textDark: 'text-black',
    border: 'border-zinc-200',
    icon: 'text-zinc-700',
    ring: 'ring-zinc-900',
    focus: 'focus:ring-zinc-900 focus:border-zinc-900',
  },
  secondary: {
    gradient: DESIGN_GRADIENTS.secondary,
    bg: 'bg-white',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-500',
  },
  success: {
    gradient: DESIGN_GRADIENTS.success,
    bg: 'bg-emerald-50',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    text: 'text-emerald-700',
    textDark: 'text-emerald-900',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  warning: {
    gradient: DESIGN_GRADIENTS.warning,
    bg: 'bg-amber-50',
    bgGradient: 'from-amber-50 to-amber-100/50',
    text: 'text-amber-700',
    textDark: 'text-amber-900',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  danger: {
    gradient: DESIGN_GRADIENTS.danger,
    bg: 'bg-rose-50',
    bgGradient: 'from-rose-50 to-rose-100/50',
    text: 'text-rose-700',
    textDark: 'text-rose-900',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
  neutral: {
    bg: 'bg-zinc-50',
    bgGradient: 'from-zinc-50 to-zinc-100/50',
    text: 'text-zinc-600',
    textDark: 'text-zinc-900',
    textLight: 'text-zinc-400',
    border: 'border-zinc-200',
    icon: 'text-zinc-500',
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

// Estilos de componentes reutilizables (Cockpit)
export const COMPONENT_STYLES = {
  pageBackground: 'min-h-[calc(100vh-4rem)] bg-zinc-50',

  card: 'bg-white rounded-xl border border-zinc-200 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]',
  cardHover: 'hover:shadow-md hover:border-zinc-300 transition-all duration-200',

  header: {
    container: 'bg-white border-b border-zinc-200 sticky top-0 z-20',
    title: 'text-xl font-semibold text-zinc-900 tracking-tight',
    subtitle: 'text-sm text-zinc-500 mt-1',
    iconWrapper: 'p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 shadow-sm',
  },

  button: {
    primary: `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white 
              bg-zinc-900 hover:bg-zinc-800 border border-transparent
              shadow-sm transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium 
                text-zinc-700 bg-white border border-zinc-200 
                hover:bg-zinc-50 hover:text-zinc-900
                shadow-sm transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed`,
    ghost: `inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent
            text-zinc-500 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900
            focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:ring-offset-1`,
    success: `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-emerald-800 
              bg-emerald-50 border border-emerald-200
              hover:bg-emerald-100 hover:border-emerald-300
              shadow-sm transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed`,
    warning: `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-amber-800 
              bg-amber-50 border border-amber-200
              hover:bg-amber-100 hover:border-amber-300
              shadow-sm transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed`,
    danger: `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-rose-800 
             bg-rose-50 border border-rose-200
             hover:bg-rose-100 hover:border-rose-300
             shadow-sm transition-all duration-200
             disabled:opacity-50 disabled:cursor-not-allowed`,
    icon: `p-1.5 rounded-md transition-all duration-200 
           focus:outline-none focus:ring-2 focus:ring-offset-1`,
    iconEdit: 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
    iconDelete: 'text-rose-600 hover:text-rose-700 hover:bg-rose-50',
    iconView: 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
    iconKey: 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
    iconShield: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50',
  },

  input: {
    base: `w-full px-3 py-2 rounded-md border text-sm
           transition-all duration-200 bg-white
           focus:outline-none focus:ring-2 focus:ring-offset-0`,
    normal: 'border-zinc-300 focus:ring-zinc-900 focus:border-zinc-900 hover:border-zinc-400 placeholder:text-zinc-400',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 text-rose-900',
    label: 'block text-[0.8rem] font-medium text-zinc-700 mb-1.5',
    errorText: 'mt-1 text-xs text-rose-600 font-medium',
    helpText: 'mt-1 text-[0.7rem] text-zinc-500 leading-snug',
  },

  select: {
    base: `w-full px-3 py-2 rounded-md border text-sm font-medium
           bg-white transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-0
           disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed`,
    normal: 'border-zinc-300 focus:ring-zinc-900 focus:border-zinc-900 hover:border-zinc-400',
  },

  table: {
    container: 'bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden',
    header: 'bg-zinc-50 border-b border-zinc-200',
    headerCell: 'px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-widest',
    row: 'hover:bg-zinc-50/50 transition-colors duration-150 border-b border-zinc-100 last:border-0',
    rowSelected: 'bg-zinc-50/80',
    cell: 'px-4 py-3.5 text-sm text-zinc-700 tabular-nums',
    emptyIcon: 'h-10 w-10 mx-auto text-zinc-300 mb-3',
  },

  badge: {
    active: 'inline-flex items-center justify-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    inactive: 'inline-flex items-center justify-center rounded-md bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/20',
    count: 'inline-flex items-center justify-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-500/20',
    warning: 'inline-flex items-center justify-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20',
    danger: 'inline-flex items-center justify-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20',
    info: 'inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20',
    role: 'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  },

  modal: {
    overlay: 'fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-6 overflow-y-auto',
    containerShell: 'mx-auto w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl',
    container: 'bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl ring-1 ring-zinc-200',
    containerMedium: 'bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl ring-1 ring-zinc-200',
    containerLarge: 'bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl ring-1 ring-zinc-200',
    header: 'px-5 py-4 border-b border-zinc-200 bg-white flex items-center justify-between',
    headerTitle: 'text-base font-semibold text-zinc-900',
    body: 'px-5 py-5 overflow-y-auto max-h-[calc(90vh-130px)]',
    footer: 'px-5 py-4 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-50',
  },

  stats: {
    card: 'rounded-xl p-4 border border-zinc-200 bg-white hover:border-zinc-300 transition-colors duration-200 shadow-sm',
    cardGradient: 'rounded-xl p-4 bg-zinc-900 text-white shadow-md',
    value: 'text-2xl font-bold tracking-tight tabular-nums',
    label: 'text-[0.8rem] font-medium text-zinc-500 uppercase tracking-widest',
    iconWrapper: 'p-2 rounded-lg bg-zinc-100 text-zinc-600',
  },

  filter: {
    container: 'bg-white rounded-xl border border-zinc-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center',
    searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400',
    searchInput: `w-full pl-9 pr-3 py-2 rounded-md border border-zinc-200 text-sm 
                  focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 
                  transition-all duration-200 hover:border-zinc-300 placeholder:text-zinc-400`,
  },

  nav: {
    container: 'bg-zinc-50 border-b border-zinc-200 sticky top-0 z-10 px-4 pt-2 flex gap-1 overflow-X-auto scrollbar-hide',
    tab: `flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2
          transition-all duration-200 cursor-pointer whitespace-nowrap`,
    tabActive: 'text-zinc-900 border-zinc-900',
    tabInactive: 'text-zinc-500 border-transparent hover:text-zinc-700 hover:border-zinc-300',
  },

  pagination: {
    container: 'bg-white px-5 py-3 border-t border-zinc-200 flex items-center justify-between',
    info: 'text-[0.8rem] text-zinc-500',
    button: 'px-2.5 py-1.5 text-sm font-medium rounded border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonActive: 'bg-zinc-900 border-zinc-900 text-white',
    buttonInactive: 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50',
  },

  bulkActions: {
    container: 'bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between shadow-lg text-white mb-4 animate-in fade-in slide-in-from-bottom-2',
    text: 'text-sm font-medium ml-2',
  },
} as const;

// Configuración de estadísticas
export const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Usuarios',
    icon: Users,
    gradient: 'from-zinc-100 to-zinc-200 text-zinc-900',
  },
  {
    key: 'activos',
    label: 'Activos',
    icon: CheckCircle,
    gradient: `${DESIGN_TOKENS.semantic.success.surface} ${DESIGN_TOKENS.semantic.success.textStrong} border ${DESIGN_TOKENS.semantic.success.border}`,
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: Shield,
    gradient: 'from-zinc-100 to-zinc-200 text-zinc-900',
  },
] as const;

// Columnas de la tabla de usuarios
export const TABLA_COLUMNAS = [
  { key: 'checkbox', label: '', align: 'center' as const, width: 'w-10' },
  { key: 'usuario', label: 'Usuario', align: 'left' as const, width: 'flex-1' },
  { key: 'rol', label: 'Rol', align: 'left' as const, width: 'w-48' },
  { key: 'estado', label: 'Estado', align: 'center' as const, width: 'w-24' },
  { key: 'acciones', label: '', align: 'right' as const, width: 'w-28' },
] as const;

// Colores de roles en Cockpit Mode (Zinc-muted)
export const ROLE_COLORS: Record<string, string> = {
  administrador: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  coordinador: 'bg-zinc-100 text-zinc-800 ring-zinc-500/20',
  responsable_acopio: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  operador: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  default: 'bg-zinc-50 text-zinc-600 ring-zinc-500/20',
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
    'ici_demid:read',
    'ici_demid:write',
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
   