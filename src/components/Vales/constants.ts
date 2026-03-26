import {
  FileText,
  CheckCircle,
  Clock,
  Package,
  Plus,
} from '@phosphor-icons/react';

// Paleta de colores unificada con Inventario y Movimientos (teal/cyan)
export const COLORS = {
  primary: {
    gradient: 'from-zinc-800 to-zinc-900',
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgHover: 'hover:bg-zinc-100',
    text: 'text-zinc-800',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-700',
    ring: 'ring-zinc-900/10',
    focus: 'focus:ring-zinc-900 focus:border-zinc-900',
  },
  secondary: {
    gradient: 'from-zinc-700 to-zinc-800',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-600',
  },
  success: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50/50',
    bgGradient: 'from-emerald-50 to-emerald-50',
    text: 'text-emerald-700',
    textDark: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
  },
  warning: {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50/50',
    bgGradient: 'from-amber-50 to-amber-50',
    text: 'text-amber-700',
    textDark: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200/60',
  },
  danger: {
    gradient: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50/50',
    bgGradient: 'from-rose-50 to-rose-50',
    text: 'text-rose-700',
    textDark: 'text-rose-800',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-800 border border-rose-200/60',
  },
  neutral: {
    bg: 'bg-zinc-50',
    bgGradient: 'from-zinc-50 to-zinc-50',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    textLight: 'text-zinc-500',
    border: 'border-zinc-200',
    icon: 'text-zinc-600',
    badge: 'bg-zinc-100 text-zinc-700 border border-zinc-200/60',
  },
} as const;

// Estilos de componentes reutilizables
export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-zinc-50/30',

  card: 'bg-white rounded-2xl border border-zinc-200/80 shadow-sm',
  cardHover: 'hover:shadow-md transition-all duration-200 hover:border-zinc-300',

  header: {
    container: 'bg-white/80 backdrop-blur-sm border-b border-zinc-200/80 sticky top-0 z-20',
    title: 'text-[1.42rem] font-semibold tracking-tight text-zinc-900 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-zinc-500 mt-0.5',
    iconWrapper: 'flex h-12 w-12 items-center justify-center rounded-[18px] bg-zinc-900 text-white shadow-sm',
  },

  button: {
    primary: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    secondary: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    success: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    warning: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    danger: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    icon: `inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50`,
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base: `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10`,
    normal: 'border-zinc-200 focus:border-zinc-900 hover:border-zinc-300',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30',
    label: 'block text-[0.84rem] font-medium text-zinc-700 mb-1.5',
    errorText: 'mt-1 text-xs text-rose-600',
  },

  select: {
    base: `w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50 disabled:cursor-not-allowed`,
    teal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900',
    cyan: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900',
    emerald: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900',
  },

  table: {
    container: 'bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden',
    header: 'bg-white',
    headerCell: 'px-4 py-3 border-b-[3px] border-zinc-900 text-left text-[0.65rem] font-black uppercase tracking-[0.15em] text-zinc-500',
    row: 'transition-colors duration-150 border-b border-zinc-100 hover:bg-zinc-50/50',
    cell: 'px-4 py-4',
    emptyIcon: 'h-12 w-12 mx-auto text-zinc-300 mb-4',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-medium text-emerald-800',
    inactive: 'inline-flex items-center rounded-full bg-zinc-100 border border-zinc-200/60 px-2.5 py-1 text-xs font-medium text-zinc-600',
    count: 'inline-flex items-center rounded-full bg-zinc-900 border border-zinc-900 px-2.5 py-1 text-xs font-medium text-white',
    warning: 'inline-flex items-center rounded-full bg-amber-50 border border-amber-200/60 px-2.5 py-1 text-xs font-medium text-amber-800',
    danger: 'inline-flex items-center rounded-full bg-rose-50 border border-rose-200/60 px-2.5 py-1 text-xs font-medium text-rose-800',
    info: 'inline-flex items-center rounded-full bg-cyan-50 border border-cyan-200/60 px-2.5 py-1 text-xs font-medium text-cyan-800',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6 max-w-2xl',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6 max-w-4xl',
    containerXL: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6 max-w-5xl',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-6',
  },

  stats: {
    card: 'min-h-[88px] rounded-2xl border border-zinc-200 px-4 py-4 transition hover:border-zinc-300 hover:shadow-sm bg-white',
    value: 'mt-2 text-[1.5rem] font-bold leading-none tracking-tight text-zinc-900',
    label: 'text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-zinc-500',
    sublabel: 'mt-1.5 text-[0.72rem] text-zinc-400',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 shadow-sm',
  },

  filter: {
    container: 'rounded-[16px] border border-zinc-200 bg-white p-3 shadow-sm sm:p-4',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput: 'w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
  },

  section: {
    container: 'bg-white rounded-[16px] border border-zinc-200/90 shadow-sm overflow-hidden',
    header: 'px-6 py-4 border-b border-zinc-100',
    headerTitle: 'text-base font-semibold text-zinc-900',
    headerSubtitle: 'text-sm text-zinc-500 mt-1',
    body: 'px-6 py-6',
  },
} as const;

// Configuracion de meses
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

// Configuracion de anos disponibles
export const ANIOS_DISPONIBLES = [2024, 2025, 2026] as const;

// Estados de vale con configuracion visual
export const ESTADOS_VALE = {
  generado: {
    label: 'Generado',
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200/60',
    icon: Clock,
  },
  impreso: {
    label: 'Impreso',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200/60',
    icon: FileText,
  },
  entregado: {
    label: 'Entregado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200/60',
    icon: CheckCircle,
  },
} as const;

// Tipos de vale con configuracion visual
export const TIPOS_VALE = {
  solo_base: {
    label: 'Base',
    shortLabel: 'B',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200/60',
    icon: CheckCircle,
    description: 'Entregas programadas en planificacion',
  },
  solo_adicionales: {
    label: 'Adicional',
    shortLabel: 'A',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200/60',
    icon: Plus,
    description: 'Entregas adicionales no programadas',
  },
  completo: {
    label: 'Completo',
    shortLabel: 'C',
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-200/60',
    icon: Package,
    description: 'Base + Adicionales',
  },
} as const;

// Columnas de la tabla de vales (simplificadas)
export const TABLA_COLUMNAS = [
  { key: 'numero', label: 'Numero', align: 'left' as const, width: 'w-32' },
  { key: 'centroAcopio', label: 'Centro de Acopio', align: 'left' as const, width: 'w-48' },
  { key: 'tipo', label: 'Tipo', align: 'center' as const, width: 'w-28' },
  { key: 'totales', label: 'Totales', align: 'center' as const, width: 'w-40' },
  { key: 'estado', label: 'Estado', align: 'center' as const, width: 'w-28' },
  { key: 'fecha', label: 'Fecha', align: 'center' as const, width: 'w-28' },
  { key: 'acciones', label: 'Acciones', align: 'center' as const, width: 'w-32' },
] as const;

// Opciones de filtros
export const FILTER_OPTIONS = {
  estado: [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'generado', label: 'Generado' },
    { value: 'impreso', label: 'Impreso' },
    { value: 'entregado', label: 'Entregado' },
  ],
} as const;

export type ColorScheme = keyof typeof COLORS;
export type EstadoVale = keyof typeof ESTADOS_VALE;
export type TipoVale = keyof typeof TIPOS_VALE;
