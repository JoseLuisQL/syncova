import {
  Users,
  Shield,
  Key,
  CheckCircle,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_GRADIENTS, DESIGN_TOKENS } from '../../styles/designTokens';

// Paleta de colores unificada (Cockpit Mode - Zinc)
export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    gradientHover: 'from-teal-700 to-cyan-700',
    bg: DESIGN_COLOR_SCALES.primary.surface,
    bgHover: 'hover:bg-zinc-100',
    text: DESIGN_COLOR_SCALES.primary.text,
    textDark: DESIGN_COLOR_SCALES.primary.textStrong,
    border: DESIGN_COLOR_SCALES.primary.border,
    icon: DESIGN_COLOR_SCALES.primary.icon,
    ring: 'ring-teal-600',
    focus: 'focus:ring-teal-600 focus:border-teal-600',
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
  pageBackground: 'min-h-screen bg-white',

  card: 'rounded-xl border border-line bg-white shadow-none',
  cardHover: 'hover:bg-surface-soft transition-colors duration-200',

  header: {
    container: 'bg-white border-b border-zinc-200 sticky top-0 z-20',
    title: 'text-xl font-semibold text-zinc-900 tracking-tight',
    subtitle: 'text-sm text-zinc-500 mt-1',
    iconWrapper: 'p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 shadow-sm',
  },

  button: {
    primary: `inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white
              shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600
              focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-60`,
    secondary: `inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3.5 py-1.5 text-sm font-semibold
                text-ink shadow-sm transition hover:border-line-strong hover:bg-surface-soft
                focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60`,
    ghost: `inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3 py-1.5
            text-sm font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface-soft hover:text-ink
            focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
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
    icon: `inline-flex h-9 w-9 items-center justify-center rounded-xl transition
           focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50`,
    iconEdit: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    iconView: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
    iconKey: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
    iconShield: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },

  input: {
    base: `min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-base text-ink shadow-none
           transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 focus:ring-line-focus/70`,
    normal: 'border-line hover:border-line-strong focus:border-line-focus-strong',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 text-rose-900',
    label: 'mb-1.5 block text-sm font-medium text-[#424750]',
    errorText: 'mt-1 text-xs text-rose-600 font-medium',
    helpText: 'mt-1 text-[0.7rem] text-zinc-500 leading-snug',
  },

  select: {
    base: `w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm
           transition focus:outline-none focus:ring-2 focus:ring-line-focus/70
           disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500`,
    normal: 'border-line hover:border-line-strong focus:border-line-focus-strong',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-transparent',
    headerCell: 'bg-surface-soft px-4 py-3 text-left text-sm font-medium tracking-[-0.01em] text-muted',
    row: 'transition-colors duration-150 hover:bg-surface-soft',
    rowSelected: 'bg-surface-soft',
    cell: 'border-b border-line-soft px-4 py-3.5 text-sm text-ink tabular-nums align-middle',
    emptyIcon: 'mx-auto mb-3 h-10 w-10 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center justify-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20',
    role: 'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  },

  modal: {
    overlay: 'fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-ink-soft/20 p-4 backdrop-blur-[2px] sm:p-6',
    containerShell: 'mx-auto w-full overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]',
    container: 'max-h-[88vh] w-full max-w-lg overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]',
    containerMedium: 'max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]',
    containerLarge: 'max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-lg border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]',
    header: 'flex items-center justify-between border-b border-line-soft bg-white px-4 py-3.5 sm:px-5',
    headerTitle: 'text-md font-semibold leading-5 text-ink',
    body: 'max-h-[calc(88vh-130px)] overflow-y-auto px-4 py-4 sm:px-5',
    footer: 'flex justify-end gap-2 border-t border-line-soft bg-surface-soft px-4 py-3 sm:px-5',
  },

  stats: {
    card: 'rounded-xl p-4 border border-zinc-200 bg-white hover:border-zinc-300 transition-colors duration-200 shadow-sm',
    cardGradient: 'rounded-xl p-4 bg-teal-600 text-white shadow-md',
    value: 'text-2xl font-bold tracking-tight tabular-nums',
    label: 'text-[0.8rem] font-medium text-zinc-500 uppercase tracking-widest',
    iconWrapper: 'p-2 rounded-lg bg-zinc-100 text-zinc-600',
  },

  filter: {
    container: 'bg-transparent p-0',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2',
    searchInput: `h-9 w-full rounded-[9px] border border-line bg-white py-1.5 pl-9 pr-3 text-sm text-ink shadow-sm
                  transition placeholder:text-muted hover:border-line-strong focus:border-line-focus-strong
                  focus:outline-none focus:ring-2 focus:ring-line-focus/70`,
  },

  nav: {
    container: 'bg-surface-soft border-b border-line-soft sticky top-0 z-10 px-4 pt-2 flex gap-1 overflow-x-auto scrollbar-hide',
    tab: `flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2
          transition-all duration-200 cursor-pointer whitespace-nowrap`,
    tabActive: 'text-teal-700 border-teal-600',
    tabInactive: 'text-zinc-500 border-transparent hover:text-zinc-700 hover:border-zinc-300',
  },

  pagination: {
    container: 'border-t border-line-soft bg-white px-4 py-5 sm:px-5',
    info: 'text-sm font-medium text-muted-3',
    button: 'min-h-9 min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'bg-white border-line text-ink shadow-sm',
    buttonInactive: 'bg-transparent border-transparent text-muted-2 hover:bg-surface-soft',
  },

  bulkActions: {
    container: 'mb-4 flex items-center justify-between rounded-[12px] border border-brand bg-brand p-2.5 text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] animate-in fade-in slide-in-from-bottom-2',
    text: 'text-sm font-medium ml-2',
  },
} as const;

// Configuración de estadísticas
export const STATS_CONFIG = [
  {
    key: 'total',
    label: 'Total Usuarios',
    icon: Users,
    gradient: 'from-teal-50 to-teal-100 text-teal-900',
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
    gradient: 'from-teal-50 to-teal-100 text-teal-900',
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
   