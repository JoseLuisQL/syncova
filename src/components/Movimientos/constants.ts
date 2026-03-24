import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Package,
  Truck,
} from 'lucide-react';

export const COLORS = {
  primary: {
    gradient: 'from-teal-600 to-cyan-600',
    gradientHover: 'from-teal-700 to-cyan-700',
    bg: 'bg-teal-50',
    bgSoft: 'bg-teal-50/75',
    border: 'border-teal-200',
    text: 'text-teal-700',
    textDark: 'text-teal-900',
    icon: 'text-teal-600',
    badge: 'bg-teal-100 text-teal-800',
    focus: 'focus:ring-teal-500/20 focus:border-teal-500',
  },
  secondary: {
    gradient: 'from-cyan-600 to-sky-600',
    gradientHover: 'from-cyan-700 to-sky-700',
    bg: 'bg-cyan-50',
    bgSoft: 'bg-cyan-50/75',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    textDark: 'text-cyan-900',
    icon: 'text-cyan-600',
    badge: 'bg-cyan-100 text-cyan-800',
    focus: 'focus:ring-cyan-500/20 focus:border-cyan-500',
  },
  success: {
    gradient: 'from-emerald-600 to-teal-600',
    gradientHover: 'from-emerald-700 to-teal-700',
    bg: 'bg-emerald-50',
    bgSoft: 'bg-emerald-50/75',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textDark: 'text-emerald-900',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
    focus: 'focus:ring-emerald-500/20 focus:border-emerald-500',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    gradientHover: 'from-amber-600 to-orange-600',
    bg: 'bg-amber-50',
    bgSoft: 'bg-amber-50/75',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textDark: 'text-amber-900',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
    focus: 'focus:ring-amber-500/20 focus:border-amber-500',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    gradientHover: 'from-rose-600 to-red-600',
    bg: 'bg-rose-50',
    bgSoft: 'bg-rose-50/75',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textDark: 'text-rose-900',
    icon: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-800',
    focus: 'focus:ring-rose-500/20 focus:border-rose-500',
  },
  neutral: {
    gradient: 'from-slate-500 to-slate-600',
    gradientHover: 'from-slate-600 to-slate-700',
    bg: 'bg-slate-50',
    bgSoft: 'bg-slate-50/80',
    border: 'border-slate-200',
    text: 'text-slate-600',
    textDark: 'text-slate-900',
    icon: 'text-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    focus: 'focus:ring-slate-400/20 focus:border-slate-400',
  },
} as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-[linear-gradient(180deg,#f8fcfc_0%,#f3fbfb_48%,#eff7f7_100%)]',
  shell: 'rounded-[28px] border border-slate-200/90 bg-white shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)]',
  surface: 'rounded-[26px] border border-slate-200/90 bg-white shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)]',
  panel: 'rounded-[22px] border border-slate-200/90 bg-white shadow-[0_8px_20px_-18px_rgba(15,23,42,0.18)]',
  mutedPanel: 'rounded-[20px] border border-slate-200 bg-slate-50/80',

  header: {
    container: 'sticky top-0 z-20 backdrop-blur-sm',
    title: 'text-[1.42rem] font-semibold tracking-tight text-slate-950 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-slate-600',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/10',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    warning:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    danger:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-rose-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-500',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 focus:ring-cyan-500',
    iconNavigate: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 focus:ring-amber-500',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/18',
    normal: 'border-slate-200 hover:border-slate-300 focus:border-teal-500',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    pending: 'border-amber-300 bg-amber-50 focus:border-amber-400 focus:ring-amber-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-slate-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-slate-500',
  },

  select: {
    base:
      'w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2',
    teal: 'border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-teal-500/18',
    cyan: 'border-slate-200 hover:border-slate-300 focus:border-cyan-500 focus:ring-cyan-500/18',
    emerald: 'border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/18',
  },

  table: {
    container: 'overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-sm',
    header: 'bg-slate-50/95',
    headerCell: 'px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500',
    row: 'transition-colors duration-150',
    cell: 'px-4 py-3.5 align-top',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-slate-300',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
    inactive: 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600',
    count: 'inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700',
    warning: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700',
    info: 'inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700',
    neutral: 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerFullscreen: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2 sm:items-center sm:p-4',
    panel:
      'w-full rounded-t-[30px] bg-white shadow-2xl ring-1 ring-slate-200/80 sm:max-h-[90vh] sm:rounded-[28px]',
    header: 'border-b border-slate-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-slate-100 bg-white px-5 py-4 sm:px-6',
  },

  stats: {
    card:
      'min-h-[88px] rounded-[18px] border px-4 py-3 transition hover:border-slate-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.36rem] font-semibold leading-none tracking-tight',
    label: 'text-[0.78rem] font-medium uppercase tracking-[0.08em]',
    sublabel: 'mt-1 text-[0.72rem]',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm',
  },

  filter: {
    container: 'rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.14)] sm:p-3.5',
    header: 'border-b border-slate-100 px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
    searchInput:
      'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/18',
  },

  pagination: {
    container: 'border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5',
    info: 'text-sm text-slate-600',
    button:
      'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-teal-200 bg-teal-50 text-teal-700',
    buttonInactive: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
  },

  section: {
    container: 'rounded-[24px] border border-slate-200/90 bg-white shadow-sm',
    header: 'border-b border-slate-100 px-5 py-4 sm:px-6',
    headerTitle: 'text-base font-semibold text-slate-900',
    headerSubtitle: 'mt-1 text-sm text-slate-500',
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
  { key: 'establecimiento', label: 'Establecimiento', align: 'left' as const, width: 'min-w-[270px]' },
  { key: 'saldoAnterior', label: 'Saldo Ant.', align: 'center' as const, width: 'min-w-[96px]' },
  { key: 'transIngreso', label: 'Trans. Ing.', align: 'center' as const, width: 'min-w-[120px]', editable: true },
  { key: 'totalSaldo', label: 'Total', align: 'center' as const, width: 'min-w-[96px]' },
  { key: 'salida', label: 'Salida', align: 'center' as const, width: 'min-w-[120px]', editable: true },
  { key: 'transSalida', label: 'Trans. Sal.', align: 'center' as const, width: 'min-w-[120px]', editable: true },
  { key: 'saldo', label: 'Saldo', align: 'center' as const, width: 'min-w-[96px]' },
  { key: 'entrega', label: 'Entrega', align: 'center' as const, width: 'min-w-[220px]', editable: true },
  { key: 'stock', label: 'Stock', align: 'center' as const, width: 'min-w-[96px]' },
  { key: 'promedioConsumo', label: 'Promedio', align: 'center' as const, width: 'min-w-[96px]' },
  { key: 'disponibilidad', label: 'Disponib.', align: 'center' as const, width: 'min-w-[110px]' },
] as const;

export const INPUT_FIELD_STYLES = {
  transIngreso: {
    normal: 'border-teal-300 bg-white text-slate-800 hover:border-teal-400',
    focus: 'focus:ring-teal-500/20 focus:border-teal-500',
    pending: 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/10',
  },
  salida: {
    normal: 'border-cyan-300 bg-white text-slate-800 hover:border-cyan-400',
    focus: 'focus:ring-cyan-500/20 focus:border-cyan-500',
    pending: 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/10',
  },
  transSalida: {
    normal: 'border-sky-300 bg-white text-slate-800 hover:border-sky-400',
    focus: 'focus:ring-sky-500/20 focus:border-sky-500',
    pending: 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/10',
  },
  entrega: {
    normal: 'border-emerald-300 bg-white text-slate-800 hover:border-emerald-400',
    focus: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    pending: 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/10',
  },
  entregaAdicional: {
    normal: 'border-amber-300 bg-white text-slate-800 hover:border-amber-400',
    focus: 'focus:ring-amber-500/20 focus:border-amber-500',
    pending: 'border-amber-300 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/10',
  },
} as const;

export const STOCK_ESTADOS = {
  bueno: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    textLight: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    icon: CheckCircle,
  },
  medio: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    textLight: 'text-amber-600',
    iconBg: 'bg-amber-100',
    icon: AlertCircle,
  },
  critico: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    textLight: 'text-rose-600',
    iconBg: 'bg-rose-100',
    icon: AlertTriangle,
  },
  deficit: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    textLight: 'text-rose-600',
    iconBg: 'bg-rose-100',
    icon: AlertTriangle,
  },
} as const;

export const STOCK_CARDS_CONFIG = [
  {
    key: 'stockInicial',
    label: 'Stock Inicial',
    sublabel: 'Histórico',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    textLight: 'text-teal-600',
    iconBg: 'bg-teal-100',
    icon: Package,
  },
  {
    key: 'totalEntregas',
    label: 'Entregas',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-800',
    textLight: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    icon: Truck,
  },
  {
    key: 'stockDisponible',
    label: 'Disponible',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    textLight: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    icon: CheckCircle,
    dynamic: true,
  },
  {
    key: 'stockActual',
    label: 'Stock Actual',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-800',
    textLight: 'text-slate-600',
    iconBg: 'bg-slate-100',
    icon: Package,
  },
] as const;

export const VALE_INDICATOR_STYLES = {
  container:
    'inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 p-0.5 transition-colors hover:bg-emerald-100',
  icon: 'h-3.5 w-3.5 text-emerald-600',
  tooltip: 'text-xs text-emerald-700',
} as const;

export type ColorScheme = keyof typeof COLORS;
export type StockEstado = keyof typeof STOCK_ESTADOS;
