import {
  WarningCircle,
  Warning,
  CheckCircle,
  Package,
  Truck,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_TOKENS } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: 'from-brand to-brand-600',
    gradientHover: 'from-brand-600 to-[#5b21b6]',
    bg: 'bg-[#f3f0ff]',
    bgSoft: 'bg-surface-soft',
    border: 'border-line-focus',
    text: 'text-brand',
    textDark: 'text-[#5b21b6]',
    icon: 'text-brand',
    badge: 'bg-[#f3f0ff] text-brand',
    focus: 'focus:ring-brand/20 focus:border-brand',
  },
  secondary: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    gradientHover: 'from-zinc-800 to-zinc-900',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    icon: 'text-zinc-600',
    badge: 'bg-zinc-100 text-zinc-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  success: {
    gradient: DESIGN_COLOR_SCALES.success.gradient,
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textDark: 'text-zinc-900',
    icon: 'text-zinc-700',
    badge: DESIGN_TOKENS.semantic.success.badge,
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  warning: {
    gradient: DESIGN_COLOR_SCALES.warning.gradient,
    gradientHover: 'from-zinc-800 to-zinc-900',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    icon: 'text-zinc-600',
    badge: 'bg-amber-50 text-amber-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  danger: {
    gradient: DESIGN_COLOR_SCALES.danger.gradient,
    gradientHover: 'from-rose-600 to-rose-700',
    bg: 'bg-rose-50',
    bgSoft: 'bg-rose-50/75',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textDark: 'text-rose-900',
    icon: 'text-rose-600',
    badge: DESIGN_TOKENS.semantic.danger.badge,
    focus: 'focus:ring-rose-500/20 focus:border-rose-500',
  },
  neutral: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    gradientHover: 'from-zinc-600 to-zinc-700',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/80',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textDark: 'text-zinc-900',
    icon: 'text-zinc-500',
    badge: 'bg-zinc-100 text-zinc-700',
    focus: 'focus:ring-zinc-400/20 focus:border-zinc-400',
  },
} as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-white',
  shell: 'rounded-none border-0 bg-transparent shadow-none',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-white shadow-none',
  mutedPanel: 'rounded-xl border border-line bg-surface-soft',
  card: 'rounded-xl border border-line bg-white shadow-none',
  header: {
    container: 'sticky top-0 z-20 backdrop-blur-md bg-white/80',
    title: 'text-[1.42rem] font-semibold tracking-tight text-zinc-900 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-zinc-500',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface-soft text-muted-2',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    warning:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    danger:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3 py-1.5 text-sm font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconNavigate: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-base text-ink shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 focus:ring-line-focus/70',
    normal: 'border-line hover:border-line-strong focus:border-line-focus-strong',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    pending: 'border-zinc-300 bg-zinc-50 focus:border-zinc-400 focus:ring-zinc-500/20',
    label: 'mb-1.5 block text-sm font-medium text-[#424750]',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'min-h-9 w-full appearance-none rounded-[7px] border bg-white px-3 py-2 text-base text-ink shadow-none transition focus:outline-none focus:ring-2 focus:ring-line-focus/70',
    teal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
    cyan: 'border-line hover:border-line-strong focus:border-line-focus-strong',
    emerald: 'border-line hover:border-line-strong focus:border-line-focus-strong',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-surface-soft',
    headerCell: 'px-3 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-muted',
    row: 'transition-colors duration-150 border-b border-line-soft hover:bg-surface-soft',
    cell: 'px-3 py-3 align-middle text-sm text-ink',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    neutral: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-ink-soft/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerFullscreen: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2 sm:items-center sm:p-4',
    panel:
      'w-full overflow-hidden rounded-t-[10px] border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-lg',
    header: 'border-b border-line-soft px-4 py-3.5 sm:px-5',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5',
    footer: 'border-t border-line-soft bg-surface-soft px-4 py-3 sm:px-5',
  },

  stats: {
    card:
      'min-h-[88px] rounded-xl border border-line bg-white px-4 py-4 transition hover:bg-surface-soft',
    value: 'mt-2 text-[1.5rem] font-bold leading-none tracking-tight text-zinc-900',
    label: 'text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-zinc-500',
    sublabel: 'mt-1.5 text-[0.72rem] text-zinc-400',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 shadow-sm',
  },

  filter: {
    container: 'bg-transparent p-0',
    header: 'border-b border-line-soft px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-lg border border-line bg-white py-2 pl-10 pr-4 text-sm text-ink shadow-sm transition placeholder:text-muted hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70',
  },

  pagination: {
    container: 'border-t border-line-soft bg-white px-4 py-4 sm:px-5',
    info: 'text-sm font-medium text-muted-3',
    button:
      'min-h-9 min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'border-line bg-white text-ink shadow-sm',
    buttonInactive: 'border-transparent bg-transparent text-muted-2 hover:bg-surface-soft hover:text-ink',
  },

  section: {
    container: 'rounded-xl border border-line bg-white shadow-none',
    header: 'border-b border-line-soft px-5 py-4 sm:px-6',
    headerTitle: 'text-base font-semibold text-zinc-900',
    headerSubtitle: 'mt-1 text-sm text-zinc-500',
    body: 'px-5 py-5 sm:px-6',
  },
} as const;

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export const ANIOS_DISPONIBLES = [2024, 2025, 2026] as const;

export const TABLA_COLUMNAS = [
  { key: 'establecimiento', label: 'Establecimiento', align: 'left' as const, width: 'w-[270px] min-w-[270px]' },
  { key: 'saldoAnterior', label: 'Saldo Ant.', align: 'center' as const, width: 'w-[96px] min-w-[96px]' },
  { key: 'transIngreso', label: 'Trans. Ing.', align: 'center' as const, width: 'w-[120px] min-w-[120px]', editable: true },
  { key: 'totalSaldo', label: 'Total', align: 'center' as const, width: 'w-[96px] min-w-[96px]' },
  { key: 'salida', label: 'Salida', align: 'center' as const, width: 'w-[120px] min-w-[120px]', editable: true },
  { key: 'transSalida', label: 'Trans. Sal.', align: 'center' as const, width: 'w-[120px] min-w-[120px]', editable: true },
  { key: 'saldo', label: 'Saldo', align: 'center' as const, width: 'w-[96px] min-w-[96px]' },
  { key: 'ici', label: 'ICI', align: 'center' as const, width: 'w-[110px] min-w-[110px]' },
  { key: 'entrega', label: 'Entrega', align: 'center' as const, width: 'w-[220px] min-w-[220px]', editable: true },
  { key: 'stock', label: 'Stock', align: 'center' as const, width: 'w-[96px] min-w-[96px]' },
  { key: 'promedioConsumo', label: 'Promedio', align: 'center' as const, width: 'w-[96px] min-w-[96px]' },
  { key: 'disponibilidad', label: 'Disponib.', align: 'center' as const, width: 'w-[110px] min-w-[110px]' },
] as const;

export const COLUMNAS_CONFIGURABLES = TABLA_COLUMNAS.filter(
  (column) => column.key !== 'establecimiento',
);

export type ColumnaConfigurableKey = typeof COLUMNAS_CONFIGURABLES[number]['key'];

export type VisibleColumnsState = Record<ColumnaConfigurableKey, boolean>;

export const DEFAULT_VISIBLE_COLUMNS: VisibleColumnsState = COLUMNAS_CONFIGURABLES.reduce(
  (acc, column) => {
    acc[column.key] = column.key === 'ici' ? false : true;
    return acc;
  },
  {} as VisibleColumnsState,
);

export const INPUT_FIELD_STYLES = {
  transIngreso: {
    normal: 'ring-1 ring-inset ring-black/5 bg-white/60 text-zinc-900 hover:bg-white hover:ring-black/10',
    focus: 'focus:ring-[1.5px] focus:ring-inset focus:ring-zinc-900 focus:bg-white focus:shadow-sm',
    pending: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-500/50',
  },
  salida: {
    normal: 'ring-1 ring-inset ring-black/5 bg-white/60 text-zinc-900 hover:bg-white hover:ring-black/10',
    focus: 'focus:ring-[1.5px] focus:ring-inset focus:ring-zinc-900 focus:bg-white focus:shadow-sm',
    pending: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-500/50',
  },
  transSalida: {
    normal: 'ring-1 ring-inset ring-black/5 bg-white/60 text-zinc-900 hover:bg-white hover:ring-black/10',
    focus: 'focus:ring-[1.5px] focus:ring-inset focus:ring-zinc-900 focus:bg-white focus:shadow-sm',
    pending: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-500/50',
  },
  entrega: {
    normal: 'ring-1 ring-inset ring-black/5 bg-white/60 text-zinc-900 hover:bg-white hover:ring-black/10',
    focus: 'focus:ring-[1.5px] focus:ring-inset focus:ring-zinc-900 focus:bg-white focus:shadow-sm',
    pending: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-500/50',
  },
  entregaAdicional: {
    normal: 'ring-1 ring-inset ring-black/5 bg-white/60 text-zinc-900 hover:bg-white hover:ring-black/10',
    focus: 'focus:ring-[1.5px] focus:ring-inset focus:ring-zinc-900 focus:bg-white focus:shadow-sm',
    pending: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-500/50',
  },
} as const;

export const STOCK_ESTADOS = {
  bueno: {
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textLight: 'text-zinc-500',
    iconBg: 'bg-white',
    icon: CheckCircle,
  },
  medio: {
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textLight: 'text-zinc-500',
    iconBg: 'bg-white',
    icon: WarningCircle,
  },
  critico: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    textLight: 'text-rose-600',
    iconBg: 'bg-white',
    icon: Warning,
  },
  deficit: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    textLight: 'text-rose-600',
    iconBg: 'bg-white',
    icon: Warning,
  },
} as const;

export const STOCK_CARDS_CONFIG = [
  {
    key: 'stockInicial',
    label: 'Stock Inicial',
    sublabel: 'Histórico',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textLight: 'text-zinc-500',
    iconBg: 'bg-white border-zinc-200 shadow-sm',
    icon: Package,
  },
  {
    key: 'totalEntregas',
    label: 'Entregas',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textLight: 'text-zinc-500',
    iconBg: 'bg-white border-zinc-200 shadow-sm',
    icon: Truck,
  },
  {
    key: 'stockDisponible',
    label: 'Disponible',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textLight: 'text-zinc-500',
    iconBg: 'bg-white border-zinc-200 shadow-sm',
    icon: CheckCircle,
    dynamic: true,
  },
  {
    key: 'stockActual',
    label: 'Stock Actual',
    bg: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textLight: 'text-zinc-500',
    iconBg: 'bg-white border-zinc-200 shadow-sm',
    icon: Package,
  },
] as const;

export const VALE_INDICATOR_STYLES = {
  container:
    'inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 p-0.5 transition-colors hover:bg-zinc-100',
  icon: 'h-3.5 w-3.5 text-zinc-600',
  tooltip: 'text-xs text-zinc-700',
} as const;

export type ColorScheme = keyof typeof COLORS;
export type StockEstado = keyof typeof STOCK_ESTADOS;
