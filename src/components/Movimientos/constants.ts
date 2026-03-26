import {
  WarningCircle,
  Warning,
  CheckCircle,
  Package,
  Truck,
} from '@phosphor-icons/react';

export const COLORS = {
  primary: {
    gradient: 'from-zinc-800 to-zinc-900',
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textDark: 'text-zinc-900',
    icon: 'text-zinc-700',
    badge: 'bg-zinc-100 text-zinc-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  secondary: {
    gradient: 'from-zinc-700 to-zinc-800',
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
    gradient: 'from-zinc-800 to-zinc-900',
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    textDark: 'text-zinc-900',
    icon: 'text-zinc-700',
    badge: 'bg-zinc-100 text-zinc-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  warning: {
    gradient: 'from-zinc-700 to-zinc-800',
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
    gradient: 'from-rose-500 to-rose-600',
    gradientHover: 'from-rose-600 to-rose-700',
    bg: 'bg-rose-50',
    bgSoft: 'bg-rose-50/75',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textDark: 'text-rose-900',
    icon: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-800',
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
  pageBackground: 'min-h-screen bg-zinc-50/30',
  shell: 'rounded-[16px] border border-zinc-200/80 bg-white shadow-sm',
  surface: 'rounded-[16px] border border-zinc-200/80 bg-white shadow-sm',
  panel: 'rounded-[16px] border border-zinc-200/80 bg-white shadow-sm',
  mutedPanel: 'rounded-[16px] border border-zinc-200 bg-zinc-50',

  header: {
    container: 'sticky top-0 z-20 backdrop-blur-md bg-white/80',
    title: 'text-[1.42rem] font-semibold tracking-tight text-zinc-900 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-zinc-500',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-zinc-900 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    warning:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    danger:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconNavigate: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    pending: 'border-zinc-300 bg-zinc-50 focus:border-zinc-400 focus:ring-zinc-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2',
    teal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
    cyan: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
    emerald: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
  },

  table: {
    container: 'overflow-hidden rounded-none border border-zinc-200 bg-white shadow-sm',
    header: 'bg-white',
    headerCell: 'px-2 py-2.5 text-left text-[0.65rem] font-black uppercase tracking-[0.15em] text-zinc-500',
    row: 'transition-colors duration-150 border-b border-zinc-100',
    cell: 'px-2 py-2 align-middle text-sm text-zinc-700',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white',
    inactive: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600',
    count: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
    warning: 'inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700',
    info: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
    neutral: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerFullscreen: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2 sm:items-center sm:p-4',
    panel:
      'w-full rounded-[24px] bg-white shadow-2xl ring-1 ring-zinc-200/50 sm:max-h-[90vh]',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-6',
  },

  stats: {
    card:
      'min-h-[88px] rounded-2xl border border-zinc-200 px-4 py-4 transition hover:border-zinc-300 hover:shadow-sm bg-white',
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
    searchInput:
      'w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
  },

  pagination: {
    container: 'border-t border-zinc-100 bg-white px-4 py-3 sm:px-5',
    info: 'text-sm text-zinc-600',
    button:
      'rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-zinc-900 bg-zinc-900 text-white shadow-sm',
    buttonInactive: 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
  },

  section: {
    container: 'rounded-[16px] border border-zinc-200/90 bg-white shadow-sm',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
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
