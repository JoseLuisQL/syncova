import {
  Archive,
  CheckCircle,
  Package,
  SlidersHorizontal,
  Warning,
  Syringe,
  TrendUp,
  Icon
} from '@phosphor-icons/react';

export const COLORS = {
  primary: {
    gradient: 'from-zinc-800 to-zinc-950',
    surface: 'bg-zinc-50/80',
    surfaceSoft: 'bg-white',
    border: 'border-zinc-200/60',
    text: 'text-zinc-900',
    textStrong: 'text-black',
    icon: 'text-zinc-700',
  },
  secondary: {
    gradient: 'from-slate-500 to-slate-600',
    surface: 'bg-slate-50/80',
    surfaceSoft: 'bg-white',
    border: 'border-slate-200/60',
    text: 'text-slate-600',
    textStrong: 'text-slate-900',
    icon: 'text-slate-500',
  },
  success: {
    gradient: 'from-emerald-500 to-emerald-600',
    surface: 'bg-emerald-50/50',
    surfaceSoft: 'bg-emerald-50/30',
    border: 'border-emerald-200/60',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-900',
    icon: 'text-emerald-600',
  },
  warning: {
    gradient: 'from-amber-400 to-amber-500',
    surface: 'bg-amber-50/50',
    surfaceSoft: 'bg-amber-50/30',
    border: 'border-amber-200/60',
    text: 'text-amber-700',
    textStrong: 'text-amber-900',
    icon: 'text-amber-600',
  },
  danger: {
    gradient: 'from-rose-500 to-rose-600',
    surface: 'bg-rose-50/50',
    surfaceSoft: 'bg-rose-50/30',
    border: 'border-rose-200/60',
    text: 'text-rose-700',
    textStrong: 'text-rose-900',
    icon: 'text-rose-600',
  },
  neutral: {
    gradient: 'from-zinc-100 to-zinc-200',
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-500',
  },
} as const;

export const INVENTORY_SECTIONS = [
  {
    id: 'vacunas',
    label: 'Vacunas',
    contextLabel: 'Catálogo de vacunas',
    description: 'Maestro de vacunas',
    icon: Package,
    path: '/inventario/vacunas',
    category: 'catalogos' as const,
  },
  {
    id: 'jeringas',
    label: 'Jeringas',
    contextLabel: 'Catálogo de jeringas',
    description: 'Maestro de jeringas',
    icon: Syringe,
    path: '/inventario/jeringas',
    category: 'catalogos' as const,
  },
  {
    id: 'lotes-vacunas',
    label: 'Vacunas',
    contextLabel: 'Lotes de vacunas',
    description: 'Stock y vencimientos por lote',
    icon: Archive,
    path: '/inventario/lotes-vacunas',
    category: 'lotes' as const,
  },
  {
    id: 'lotes-jeringas',
    label: 'Jeringas',
    contextLabel: 'Lotes de jeringas',
    description: 'Stock y trazabilidad por lote',
    icon: Archive,
    path: '/inventario/lotes-jeringas',
    category: 'lotes' as const,
  },
  {
    id: 'configuracion-jeringas',
    label: 'Asignación',
    contextLabel: 'Asignación de jeringas',
    description: 'Relación vacuna y jeringa',
    icon: SlidersHorizontal,
    path: '/inventario/configuracion-jeringas',
    category: 'configuracion' as const,
  },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-zinc-50/50',
  surface: 'rounded-[20px] border border-zinc-200/70 bg-white shadow-sm',
  panel: 'rounded-[16px] border border-zinc-200/60 bg-white shadow-sm',
  mutedPanel: 'rounded-[16px] border border-zinc-200 bg-zinc-50/80',

  header: {
    title: 'text-[1.35rem] font-bold tracking-tight text-zinc-900 sm:text-[1.45rem]',
    subtitle: 'text-[0.88rem] text-zinc-500 mt-0.5',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[14px] bg-zinc-900 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100/80 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm',
    icon:
      'inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-500',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 focus:ring-rose-500',
    iconView: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 focus:ring-blue-500',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-600/20',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-500',
    error: 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1.5 block text-[0.82rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs font-medium text-rose-600',
    helpText: 'mt-1.5 text-xs text-zinc-500',
  },

  table: {
    container: 'overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm',
    header: 'bg-zinc-50/90 border-b border-zinc-200/80',
    headerCell: 'px-4 py-3.5 text-left text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-zinc-500',
    row: 'transition hover:bg-zinc-50/60 border-b border-zinc-100/80 last:border-0',
    cell: 'px-4 py-4 align-top text-sm',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700',
    inactive: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600',
    count: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800',
    warning: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700',
  },

  modal: {
    overlay: 'fixed inset-0 z-[100] bg-zinc-950/40 backdrop-blur-sm',
    container:
      'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full rounded-[24px] bg-white shadow-2xl ring-1 ring-zinc-200/60 sm:max-h-[85vh]',
    header: 'border-b border-zinc-100 px-6 py-5',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-6 py-6 sm:max-h-[calc(85vh-156px)]',
    footer: 'border-t border-zinc-100 bg-zinc-50/50 px-6 py-5 rounded-b-[24px]',
  },

  stats: {
    card:
      'min-h-[84px] rounded-[16px] border px-4 py-3.5 transition hover:border-zinc-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.4rem] font-semibold leading-none tracking-tight text-zinc-900',
    label: 'text-[0.78rem] font-medium text-zinc-500',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm',
  },

  filter: {
    container: 'rounded-[16px] border border-zinc-200 bg-white p-3 shadow-sm sm:p-4',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600/20',
  },

  pagination: {
    container: 'border-t border-zinc-200/80 bg-zinc-50/50 px-4 py-3 sm:px-5',
    info: 'text-sm font-medium text-zinc-600',
    button:
      'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-zinc-300 bg-white text-zinc-900 shadow-sm',
    buttonInactive: 'border-transparent bg-transparent text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900',
  },

  nav: {
    shell: 'rounded-[20px] border border-zinc-200/80 bg-white shadow-sm',
    tab:
      'inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-500/20',
    tabActive: 'bg-zinc-100 text-zinc-900',
    tabInactive: 'text-zinc-500 hover:bg-zinc-100/60 hover:text-zinc-900',
  },
} as const;

export const STATS_CONFIG = {
  lotes: {
    vacunas: [
      { key: 'total', label: 'Total Lotes', icon: Archive, color: 'primary' as const },
      { key: 'disponibles', label: 'Disponibles', icon: CheckCircle, color: 'success' as const },
      { key: 'porVencer', label: 'Por Vencer', icon: Warning, color: 'warning' as const },
      { key: 'vencidos', label: 'Vencidos', icon: Warning, color: 'danger' as const },
    ],
    jeringas: [
      { key: 'total', label: 'Total Lotes', icon: Archive, color: 'primary' as const },
      { key: 'disponibles', label: 'Disponibles', icon: CheckCircle, color: 'success' as const },
      { key: 'agotados', label: 'Agotados', icon: Warning, color: 'neutral' as const },
      { key: 'stockTotal', label: 'Stock Total', icon: TrendUp, color: 'secondary' as const },
    ],
  },
  catalogos: {
    vacunas: [
      { key: 'total', label: 'Total Vacunas', icon: Package, color: 'primary' as const },
      { key: 'activas', label: 'Activas', icon: CheckCircle, color: 'success' as const },
      { key: 'conStock', label: 'Con Stock', icon: TrendUp, color: 'secondary' as const },
      { key: 'sinStock', label: 'Sin Stock', icon: Warning, color: 'warning' as const },
    ],
    jeringas: [
      { key: 'total', label: 'Total Jeringas', icon: Syringe, color: 'primary' as const },
      { key: 'activas', label: 'Activas', icon: CheckCircle, color: 'success' as const },
      { key: 'conStock', label: 'Con Stock', icon: TrendUp, color: 'secondary' as const },
      { key: 'sinStock', label: 'Sin Stock', icon: Warning, color: 'warning' as const },
    ],
  },
} as const;

export const FILTER_OPTIONS = {
  estado: [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ],
  estadoLote: [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'agotado', label: 'Agotado' },
    { value: 'vencido', label: 'Vencido' },
  ],
  vencimiento: [
    { value: 'todos', label: 'Todos' },
    { value: 'vigente', label: 'Vigente (>30 dias)' },
    { value: 'por_vencer', label: 'Por vencer (<=30 dias)' },
    { value: 'vencido', label: 'Vencido' },
  ],
  formaIngreso: [
    { value: '1° TRIMESTRE', label: '1er trimestre' },
    { value: '2° TRIMESTRE', label: '2do trimestre' },
    { value: '3° TRIMESTRE', label: '3er trimestre' },
    { value: '4° TRIMESTRE', label: '4to trimestre' },
  ],
  comprobanteClase: [
    { value: 'PECOSA', label: 'PECOSA' },
    { value: 'GUIA', label: 'Guia' },
    { value: 'TRASLADO', label: 'Traslado' },
    { value: 'OTROS', label: 'Otros' },
  ],
} as const;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof INVENTORY_SECTIONS[number]['id'];
