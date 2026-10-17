import {
  FileText,
  CheckCircle,
  Clock,
  Package,
  Plus,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_GRADIENTS, DESIGN_TOKENS } from '../../styles/designTokens';

// Paleta de colores unificada con Inventario y Movimientos (teal/cyan)
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
    ring: 'ring-teal-600/10',
    focus: 'focus:ring-teal-600 focus:border-teal-600',
  },
  secondary: {
    gradient: DESIGN_GRADIENTS.secondary,
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-600',
  },
  success: {
    gradient: DESIGN_GRADIENTS.success,
    bg: 'bg-emerald-50/50',
    bgGradient: 'from-emerald-50 to-emerald-50',
    text: 'text-emerald-700',
    textDark: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
  },
  warning: {
    gradient: DESIGN_GRADIENTS.warning,
    bg: 'bg-amber-50/50',
    bgGradient: 'from-amber-50 to-amber-50',
    text: 'text-amber-700',
    textDark: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200/60',
  },
  danger: {
    gradient: DESIGN_GRADIENTS.danger,
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
    iconWrapper: 'flex h-12 w-12 items-center justify-center rounded-3xl bg-teal-600 text-white shadow-sm',
  },

  button: {
    primary: `inline-flex min-h-9.5 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-2 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55`,
    secondary: `inline-flex min-h-9.5 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.005em] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-3 focus:ring-line-focus/80 disabled:cursor-not-allowed disabled:opacity-55`,
    success: `inline-flex min-h-9.5 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-2 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55`,
    warning: `inline-flex min-h-9.5 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-[0.8125rem] font-semibold text-white shadow-xs transition hover:bg-amber-600 focus:outline-none focus:ring-3 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-55`,
    danger: `inline-flex min-h-9.5 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-[0.8125rem] font-semibold text-white shadow-xs transition hover:bg-rose-700 focus:outline-none focus:ring-3 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-55`,
    icon: `inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50`,
    iconEdit: 'border-line bg-surface-soft text-muted-2 hover:bg-surface hover:text-ink',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-line bg-surface-soft text-muted-2 hover:bg-surface hover:text-ink',
  },

  input: {
    base: `min-h-9.5 w-full rounded-xl border bg-surface px-3.5 py-2 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 placeholder:text-muted/80 focus:outline-none focus:ring-3 focus:ring-brand/12`,
    normal: 'border-line hover:border-line-strong focus:border-brand',
    error: 'border-rose-300 focus:ring-rose-500/15 focus:border-rose-500 bg-rose-50/25',
    label: 'mb-1.5 block text-[0.78rem] font-medium tracking-[-0.005em] text-ink',
    errorText: 'mt-1.5 text-[0.73rem] font-medium text-rose-600',
  },

  select: {
    base: `min-h-9.5 w-full appearance-none rounded-xl border bg-surface px-3.5 py-2 pr-9 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-brand/12 disabled:bg-surface-soft disabled:cursor-not-allowed`,
    teal: 'border-line hover:border-line-strong focus:border-brand',
    cyan: 'border-line hover:border-line-strong focus:border-brand',
    emerald: 'border-line hover:border-line-strong focus:border-brand',
  },

  table: {
    container: 'bg-surface rounded-2xl border border-line shadow-2xs overflow-hidden',
    header: 'bg-surface-soft',
    headerCell: 'px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-muted',
    row: 'transition-colors duration-150 border-b border-line-soft hover:bg-surface-soft last:border-0',
    cell: 'px-4 py-3.5 align-middle text-sm text-ink',
    emptyIcon: 'h-12 w-12 mx-auto text-zinc-300 mb-4',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-full bg-cyan-50 border border-cyan-200/60 px-2.5 py-1 text-xs font-medium text-cyan-800',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-[3px] dark:bg-black/70',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6 max-w-2xl',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6 max-w-4xl',
    containerXL: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6 max-w-5xl',
    header: 'shrink-0 border-b border-line-soft px-5 py-4 sm:px-6',
    body: 'flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6',
    footer: 'shrink-0 border-t border-line-soft bg-surface-soft/75 px-5 py-3.5 sm:px-6',
  },

  stats: {
    card: 'min-h-[88px] rounded-2xl border border-zinc-200 px-4 py-4 transition hover:border-zinc-300 hover:shadow-sm bg-white',
    value: 'mt-2 text-[1.5rem] font-bold leading-none tracking-tight text-zinc-900',
    label: 'text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-zinc-500',
    sublabel: 'mt-1.5 text-[0.72rem] text-zinc-400',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 shadow-sm',
  },

  filter: {
    container: 'rounded-2xl border border-line bg-surface p-3.5 shadow-2xs sm:p-4',
    header: 'border-b border-line-soft px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2',
    searchInput: 'h-9.5 w-full rounded-xl border border-line bg-surface py-2 pl-10 pr-4 text-[0.84rem] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 placeholder:text-muted/80 hover:border-line-strong focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/12',
  },

  section: {
    container: 'bg-white rounded-2xl border border-zinc-200/90 shadow-sm overflow-hidden',
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
    bg: DESIGN_TOKENS.semantic.info.surface,
    text: 'text-blue-800',
    border: 'border-blue-200/60',
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
