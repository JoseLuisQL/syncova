import {
  CalendarBlank,
  Clock,
  FolderDashed,
  Package,
  Gear,
  Target,
  TrendUp,
} from '@phosphor-icons/react';

export const COLORS = {
  primary: {
    gradient: 'from-zinc-600 to-zinc-600',
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-600',
    shadow: 'shadow-sm',
  },
  secondary: {
    gradient: 'from-zinc-600 to-zinc-600',
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-600',
    shadow: 'shadow-sm',
  },
  success: {
    gradient: 'from-emerald-500 to-zinc-500',
    surface: 'bg-emerald-50',
    surfaceSoft: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-900',
    icon: 'text-emerald-600',
    shadow: 'shadow-sm',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    surface: 'bg-amber-50',
    surfaceSoft: 'bg-amber-50/80',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textStrong: 'text-amber-900',
    icon: 'text-amber-600',
    shadow: 'shadow-sm',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    surface: 'bg-rose-50',
    surfaceSoft: 'bg-rose-50/80',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textStrong: 'text-rose-900',
    icon: 'text-rose-600',
    shadow: 'shadow-sm',
  },
  neutral: {
    gradient: 'from-zinc-500 to-zinc-600',
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-500',
    shadow: 'shadow-sm',
  },
  info: {
    gradient: 'from-zinc-500 to-blue-500',
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-600',
    shadow: 'shadow-sm',
  },
} as const;

export const REPORTS_SECTIONS = [
  {
    id: 'inventario',
    label: 'Inventario',
    contextLabel: 'Reportes de inventario',
    description: 'Stock, vencimientos y kardex operativo',
    icon: Package,
    path: '/reportes/inventario',
    category: 'operacion' as const,
    routeSegment: 'inventario',
  },
  {
    id: 'movimientos',
    label: 'Movimientos',
    contextLabel: 'Reportes de movimientos',
    description: 'Distribución, entregas y trazabilidad mensual',
    icon: TrendUp,
    path: '/reportes/movimientos',
    category: 'operacion' as const,
    routeSegment: 'movimientos',
  },
  {
    id: 'planificacion',
    label: 'Planificación',
    contextLabel: 'Reportes de planificación',
    description: 'Programación anual y seguimiento operativo',
    icon: Target,
    path: '/reportes/planificacion',
    category: 'operacion' as const,
    routeSegment: 'planificacion',
  },
  {
    id: 'cenares',
    label: 'CENARES',
    contextLabel: 'Seguimiento CENARES',
    description: 'Programación y seguimiento anual de entregas',
    icon: CalendarBlank,
    path: '/reportes/programacion-seguimiento-anual',
    category: 'seguimiento' as const,
    routeSegment: 'programacion-seguimiento-anual',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    contextLabel: 'Configuración del módulo',
    description: 'Reportes programados y preferencias de salida',
    icon: Gear,
    path: '/reportes/configuracion',
    category: 'automatizacion' as const,
    routeSegment: 'configuracion',
  },
] as const;

export const SECTION_GROUPS = [
  {
    key: 'operacion',
    label: 'Operación',
    icon: FolderDashed,
    description: 'Reportes de trabajo diario y análisis inmediato',
  },
  {
    key: 'seguimiento',
    label: 'Seguimiento',
    icon: CalendarBlank,
    description: 'Control anual y revisión de compromisos',
  },
  {
    key: 'automatizacion',
    label: 'Automatización',
    icon: Clock,
    description: 'Programación y preferencias del módulo',
  },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-zinc-50',
  surface: 'rounded-xl border border-zinc-200/90 bg-white shadow-sm',
  panel: 'rounded-xl border border-zinc-200/90 bg-white shadow-sm',
  mutedPanel: 'rounded-xl border border-zinc-200 bg-zinc-50',
  card: 'rounded-xl border border-zinc-200/90 bg-white shadow-sm',

  header: {
    title: 'text-[1.45rem] font-semibold tracking-tight text-zinc-950 sm:text-[1.58rem]',
    subtitle: 'text-[0.92rem] text-zinc-600',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-md shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-emerald-600 hover:to-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/18',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-500',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-zinc-500/18',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-500',
  },

  table: {
    container: 'overflow-hidden rounded-none border border-zinc-200/90 bg-white shadow-sm',
    header: 'bg-zinc-50/95',
    headerCell: 'px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-zinc-500',
    row: 'transition hover:bg-zinc-50/45',
    cell: 'px-4 py-3.5 align-top',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
    inactive: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600',
    count: 'inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700',
    warning: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700',
    info: 'inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700',
    neutral: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-[1px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full rounded-t-xl bg-white shadow-2xl ring-1 ring-zinc-200/80 sm:max-h-[90vh] sm:rounded-xl',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-zinc-100 bg-white px-5 py-4 sm:px-6',
  },

  stats: {
    card:
      'min-h-[78px] rounded-xl border px-3.5 py-3 transition hover:border-zinc-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.4rem] font-semibold leading-none tracking-tight',
    label: 'text-[0.8rem] font-medium',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm',
  },

  filter: {
    container: 'rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm sm:p-4',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -tranzinc-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/18',
  },

  pagination: {
    container: 'border-t border-zinc-100 bg-zinc-50 px-4 py-3 sm:px-5',
    info: 'text-sm text-zinc-600',
    button:
      'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-zinc-200 bg-zinc-50 text-zinc-700',
    buttonInactive: 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
  },

  nav: {
    shell: 'rounded-xl border border-zinc-200/90 bg-white shadow-sm',
    tab:
      'inline-flex items-center gap-2 rounded-2xl px-3.5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-500/20',
    tabActive: 'bg-zinc-50 text-zinc-700 shadow-sm',
    tabInactive: 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
  },

  reportCard: {
    container:
      'flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-tranzinc-y-0.5 hover:border-zinc-300 hover:shadow-sm',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm',
    title: 'text-[0.98rem] font-semibold text-zinc-950',
    description: 'mt-1 text-sm leading-5 text-zinc-600',
    detail: 'text-xs text-zinc-500',
    actionRow: 'mt-4 flex flex-wrap gap-2',
  },

  results: {
    shell: 'rounded-xl border border-zinc-200/90 bg-white shadow-sm',
    header: 'border-b border-zinc-100 px-4 py-3.5 sm:px-5',
    body: 'px-4 py-4 sm:px-5',
  },

  segmented: {
    container: 'inline-flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5',
    item:
      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-500/20',
    itemActive: 'bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-100',
    itemInactive: 'text-zinc-600 hover:bg-white/80 hover:text-zinc-900',
  },

  alert: {
    info: 'rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-800',
    error: 'rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800',
    warning: 'rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-800',
  },
} as const;

export interface ReporteProgramado {
  id: string;
  nombre: string;
  tipo: string;
  frecuencia: string;
  proximaEjecucion: Date;
  estado: string;
  destinatarios: string[];
  formato: string;
}

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof REPORTS_SECTIONS[number]['id'];
export type ReportSectionConfig = typeof REPORTS_SECTIONS[number];
