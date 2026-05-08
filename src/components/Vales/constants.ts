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
    iconWrapper: 'flex h-12 w-12 items-center justify-center rounded-[18px] bg-teal-600 text-white shadow-sm',
  },

  button: {
    primary: `inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    secondary: `inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#e7e7ef] bg-white px-4 py-2 text-sm font-semibold text-[#15171d] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    success: `inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    warning: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    danger: `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,
    icon: `inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50`,
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base: `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-600/10`,
    normal: 'border-zinc-200 focus:border-teal-600 hover:border-zinc-300',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30',
    label: 'block text-[0.84rem] font-medium text-zinc-700 mb-1.5',
    errorText: 'mt-1 text-xs text-rose-600',
  },

  select: {
    base: `w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-600/10 disabled:bg-zinc-50 disabled:cursor-not-allowed`,
    teal: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600',
    cyan: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600',
    emerald: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600',
  },

  table: {
    container: 'bg-white rounded-[18px] border border-[#e7e7ef] shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)] overflow-hidden',
    header: 'bg-[#fbfafd]',
    headerCell: 'px-4 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]',
    row: 'transition-colors duration-150 border-b border-[#eeeef3] hover:bg-[#fbfafd] last:border-0',
    cell: 'px-4 py-3.5 align-middle text-sm text-[#15171d]',
    emptyIcon: 'h-12 w-12 mx-auto text-zinc-300 mb-4',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    warning: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
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
    container: 'rounded-[18px] border border-[#e7e7ef] bg-white p-3 shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)] sm:p-4',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606571]',
    searchInput: 'w-full rounded-[10px] border border-[#e7e7ef] bg-white py-2 pl-10 pr-4 text-sm text-[#15171d] shadow-sm transition placeholder:text-[#8b8f9b] hover:border-[#d7d8e2] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
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
