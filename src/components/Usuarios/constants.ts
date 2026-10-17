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
    primary: `inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-1.5 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white
              shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600
              focus:outline-none focus:ring-3 focus:ring-brand/20 active:translate-y-[0.5px]
              disabled:cursor-not-allowed disabled:opacity-55`,
    secondary: `inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.005em]
                text-ink shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-line-strong hover:bg-surface-soft
                focus:outline-none focus:ring-3 focus:ring-line-focus/80
                disabled:cursor-not-allowed disabled:opacity-55`,
    ghost: `inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3 py-1.5
            text-[0.8125rem] font-medium tracking-[-0.005em] text-muted-2 transition-colors duration-150 hover:bg-surface-soft hover:text-ink
            focus:outline-none focus:ring-2 focus:ring-line-focus/70 disabled:cursor-not-allowed disabled:opacity-55`,
    success: `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[0.8125rem] font-medium text-emerald-800 
              bg-emerald-50 border border-emerald-200
              hover:bg-emerald-100 hover:border-emerald-300
              shadow-2xs transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed`,
    warning: `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[0.8125rem] font-medium text-amber-800 
              bg-amber-50 border border-amber-200
              hover:bg-amber-100 hover:border-amber-300
              shadow-2xs transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed`,
    danger: `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[0.8125rem] font-medium text-rose-800 
             bg-rose-50 border border-rose-200
             hover:bg-rose-100 hover:border-rose-300
             shadow-2xs transition-all duration-150
             disabled:opacity-50 disabled:cursor-not-allowed`,
    icon: `inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg transition
           focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50`,
    iconEdit: 'border border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    iconView: 'border border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
    iconKey: 'border border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
    iconShield: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },

  input: {
    base: `min-h-9.5 w-full rounded-xl border bg-surface px-3.5 py-2 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)]
           transition-all duration-150 placeholder:text-muted/80 focus:outline-none focus:ring-3 focus:ring-brand/12`,
    normal: 'border-line hover:border-line-strong focus:border-brand',
    error: 'border-rose-300 focus:ring-rose-500/15 focus:border-rose-500 bg-rose-50/25 text-rose-900',
    label: 'mb-1.5 block text-[0.78rem] font-medium tracking-[-0.005em] text-ink',
    errorText: 'mt-1.5 text-[0.73rem] text-rose-600 font-medium',
    helpText: 'mt-1.5 text-[0.73rem] text-muted-2 leading-snug',
  },

  select: {
    base: `min-h-9.5 w-full rounded-xl border bg-surface px-3.5 py-2 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)]
           transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-brand/12
           disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted`,
    normal: 'border-line hover:border-line-strong focus:border-brand',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-transparent',
    headerCell: 'bg-surface-soft px-4 py-3 text-left text-sm font-medium tracking-[-0.01em] text-muted',
    row: 'transition-colors duration-150 hover:bg-surface-soft',
    rowSelected: 'bg-surface-soft',
    cell: 'border-b border-line-soft px-4 py-3.5 text-sm text-ink tabular-nums align-middle',
    emptyIcon: 'mx-auto mb-3 h-10 w-10 text-muted',
  },

  badge: {
    active: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center justify-center rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center justify-center rounded-md bg-status-info-bg px-2 py-0.5 text-xs font-medium text-status-info-text border border-status-info-border',
    role: 'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
  },

  modal: {
    overlay: 'fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[3px] sm:p-6 dark:bg-black/70',
    containerShell: 'mx-auto w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)]',
    container: 'flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)]',
    containerMedium: 'flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)]',
    containerLarge: 'flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)]',
    header: 'flex shrink-0 items-center justify-between border-b border-line-soft bg-surface px-5 py-4 sm:px-6',
    headerTitle: 'text-[0.95rem] font-semibold leading-5 tracking-[-0.015em] text-ink',
    body: 'flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6',
    footer: 'flex shrink-0 justify-end gap-2.5 border-t border-line-soft bg-surface-soft/75 px-5 py-3.5 sm:px-6',
  },

  stats: {
    card: 'rounded-xl p-4 border border-line bg-surface hover:border-line-strong transition-colors duration-200 shadow-sm',
    cardGradient: 'rounded-xl p-4 bg-brand text-white shadow-md',
    value: 'text-2xl font-bold tracking-tight tabular-nums text-ink',
    label: 'text-[0.8rem] font-medium text-muted-2 uppercase tracking-widest',
    iconWrapper: 'p-2 rounded-lg bg-surface-soft text-muted-2 border border-line',
  },

  filter: {
    container: 'bg-transparent p-0',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2',
    searchInput: `h-9.5 w-full rounded-xl border border-line bg-surface py-1.5 pl-9 pr-3.5 text-[0.84rem] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)]
                  transition-all duration-150 placeholder:text-muted/80 hover:border-line-strong focus:border-brand
                  focus:outline-none focus:ring-3 focus:ring-brand/12`,
  },

  nav: {
    container: 'bg-surface-soft border-b border-line-soft sticky top-0 z-10 px-4 pt-2 flex gap-1 overflow-x-auto scrollbar-hide',
    tab: `flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2
          transition-all duration-200 cursor-pointer whitespace-nowrap`,
    tabActive: 'text-brand border-brand font-semibold',
    tabInactive: 'text-muted-2 border-transparent hover:text-ink hover:border-line',
  },

  pagination: {
    container: 'border-t border-line-soft bg-surface px-4 py-5 sm:px-5',
    info: 'text-sm font-medium text-muted-3',
    button: 'min-h-9 min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'bg-surface-soft border-line text-ink shadow-sm',
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
   