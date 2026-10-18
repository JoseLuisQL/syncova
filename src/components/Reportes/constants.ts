import {
  CalendarBlank,
  Clock,
  FolderDashed,
  Package,
  Gear,
  Target,
  ArrowsLeftRight,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    surface: 'bg-brand/10',
    surfaceSoft: 'bg-surface-soft',
    border: 'border-line',
    text: 'text-muted-2',
    textStrong: 'text-ink',
    icon: 'text-brand',
    shadow: 'shadow-none',
  },
  secondary: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    surface: 'bg-surface-soft',
    surfaceSoft: 'bg-surface-soft',
    border: 'border-line',
    text: 'text-muted-2',
    textStrong: 'text-ink',
    icon: 'text-muted-2',
    shadow: 'shadow-none',
  },
  success: {
    gradient: DESIGN_COLOR_SCALES.success.gradient,
    surface: 'bg-emerald-50 dark:bg-emerald-950/40',
    surfaceSoft: 'bg-emerald-50/60 dark:bg-emerald-950/25',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-400',
    textStrong: 'text-ink',
    icon: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'shadow-none',
  },
  warning: {
    gradient: DESIGN_COLOR_SCALES.warning.gradient,
    surface: 'bg-amber-50 dark:bg-amber-950/40',
    surfaceSoft: 'bg-amber-50/60 dark:bg-amber-950/25',
    border: 'border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-400',
    textStrong: 'text-ink',
    icon: 'text-amber-600 dark:text-amber-400',
    shadow: 'shadow-none',
  },
  danger: {
    gradient: DESIGN_COLOR_SCALES.danger.gradient,
    surface: 'bg-rose-50 dark:bg-rose-950/40',
    surfaceSoft: 'bg-rose-50/60 dark:bg-rose-950/25',
    border: 'border-rose-200 dark:border-rose-800/60',
    text: 'text-rose-700 dark:text-rose-400',
    textStrong: 'text-ink',
    icon: 'text-rose-600 dark:text-rose-400',
    shadow: 'shadow-none',
  },
  neutral: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    surface: 'bg-surface-soft',
    surfaceSoft: 'bg-surface-soft',
    border: 'border-line',
    text: 'text-muted-2',
    textStrong: 'text-ink',
    icon: 'text-muted-2',
    shadow: 'shadow-none',
  },
  info: {
    gradient: DESIGN_COLOR_SCALES.info.gradient,
    surface: 'bg-blue-50 dark:bg-blue-950/40',
    surfaceSoft: 'bg-blue-50/60 dark:bg-blue-950/25',
    border: 'border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-700 dark:text-blue-400',
    textStrong: 'text-ink',
    icon: 'text-blue-600 dark:text-blue-400',
    shadow: 'shadow-none',
  },
} as const;

export const REPORTS_SECTIONS = [
  {
    id: 'inventario',
    label: 'Inventario y Kardex',
    contextLabel: 'Reportes de inventario',
    description: 'Stock actual, niveles críticos, control FEFO de vencimientos y kardex detallado',
    icon: Package,
    path: '/reportes/inventario',
    category: 'operacion' as const,
    routeSegment: 'inventario',
  },
  {
    id: 'movimientos',
    label: 'Movimientos',
    contextLabel: 'Reportes de movimientos',
    description: 'Consolidado mensual de ingresos, entregas, salidas y distribución por EESS',
    icon: ArrowsLeftRight,
    path: '/reportes/movimientos',
    category: 'operacion' as const,
    routeSegment: 'movimientos',
  },
  {
    id: 'planificacion',
    label: 'Planificación Anual',
    contextLabel: 'Reportes de planificación',
    description: 'Metas anuales programadas por establecimiento de salud y biológico',
    icon: Target,
    path: '/reportes/planificacion',
    category: 'operacion' as const,
    routeSegment: 'planificacion',
  },
  {
    id: 'cenares',
    label: 'Seguimiento CENARES',
    contextLabel: 'Seguimiento CENARES',
    description: 'Matriz trimestral Q1–Q4 de programación, entregas, consumo y saldos',
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
  pageBackground: 'min-h-screen bg-app',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-surface',
  mutedPanel: 'rounded-xl border border-line bg-surface-soft',
  card: 'rounded-xl border border-line bg-surface',

  header: {
    title: 'text-lg font-semibold tracking-tight text-ink sm:text-xl',
    subtitle: 'text-xs sm:text-sm text-muted-2 mt-0.5',
    iconWrapper:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand',
  },

  button: {
    primary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-3.5 text-xs sm:text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:border-brand-600 hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    secondary:
      'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-xs sm:text-[0.8125rem] font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    ghost:
      'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-2 transition-colors duration-150 hover:bg-surface-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    success:
      'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-3.5 text-xs sm:text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    icon:
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-2 transition-colors duration-150 hover:border-line hover:bg-surface-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0',
    iconEdit: 'border border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
    iconDelete: 'text-rose-600 dark:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    iconView: 'border border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
  },

  input: {
    base:
      'h-9 w-full rounded-lg border bg-surface px-3 text-xs sm:text-sm text-ink transition-colors duration-150 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/15',
    normal: 'border-line hover:border-line-strong focus:border-brand',
    error: 'border-rose-300 bg-rose-50/25 focus:border-rose-500 focus:ring-rose-500/15',
    label: 'mb-1 block text-xs font-medium text-muted-2',
    errorText: 'mt-1 text-xs font-medium text-rose-600',
    helpText: 'mt-1 text-xs text-muted-2',
  },

  select: {
    base:
      'h-9 w-full appearance-none rounded-lg border bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/15',
    normal: 'border-line hover:border-line-strong focus:border-brand',
  },

  table: {
    container: 'overflow-hidden rounded-xl border border-line bg-surface',
    header: 'border-b border-line bg-surface-soft',
    headerCell: 'px-4 py-3 text-left text-xs font-semibold text-muted-2 whitespace-nowrap',
    row: 'transition-colors hover:bg-surface-soft/70',
    cell: 'border-b border-line-soft px-4 py-3 align-middle text-sm text-ink',
    emptyIcon: 'mx-auto mb-3 h-10 w-10 text-muted',
  },

  badge: {
    active: 'text-xs font-semibold text-emerald-700 dark:text-emerald-400',
    inactive: 'text-xs font-medium text-muted-2',
    count: 'font-mono text-xs font-semibold text-ink tabular-nums',
    warning: 'text-xs font-semibold text-amber-700 dark:text-amber-400',
    danger: 'text-xs font-semibold text-rose-600 dark:text-rose-400',
    info: 'text-xs font-medium text-blue-600 dark:text-blue-400',
    neutral: 'text-xs font-medium text-muted-2',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-[2px] dark:bg-black/70',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6',
    panel:
      'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-xl sm:max-h-[88vh] sm:rounded-2xl',
    header: 'shrink-0 border-b border-line-soft px-5 py-4 sm:px-6',
    body: 'flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6',
    footer: 'shrink-0 border-t border-line-soft bg-surface-soft px-5 py-3.5 sm:px-6',
  },

  stats: {
    card: 'rounded-xl border border-line bg-surface p-4 transition-colors',
    value: 'mt-1 font-mono text-xl sm:text-2xl font-semibold leading-none tracking-tight text-ink tabular-nums',
    label: 'text-xs font-medium text-muted-2',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-soft shrink-0',
  },

  filter: {
    container: 'rounded-xl border border-line bg-surface p-3 sm:p-3.5',
    searchIcon: 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted',
    searchInput:
      'h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-xs sm:text-sm text-ink transition-colors duration-150 placeholder:text-muted hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
  },

  pagination: {
    container: 'border-t border-line-soft bg-surface px-4 py-3.5 sm:px-5',
    info: 'text-xs font-mono tabular-nums text-muted-2',
    button:
      'h-8 min-w-8 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'border-brand bg-brand text-white hover:bg-brand-600',
    buttonInactive: 'border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
  },

  nav: {
    shell: 'border-b border-line-soft bg-surface',
    tab:
      'inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors focus:outline-none',
    tabActive: 'border-brand text-brand font-semibold',
    tabInactive: 'border-transparent text-muted-2 hover:text-ink',
  },

  reportCard: {
    container:
      'flex h-full flex-col justify-between rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong',
    iconWrapper: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
    title: 'text-sm font-semibold text-ink',
    description: 'mt-0.5 text-xs leading-relaxed text-muted-2',
    detail: 'text-xs text-muted',
    actionRow: 'mt-3.5 flex items-center justify-end gap-2 border-t border-line-soft pt-3',
  },

  results: {
    shell: 'rounded-xl border border-line bg-surface overflow-hidden',
    header: 'border-b border-line-soft bg-surface-soft/50 px-4 py-3 sm:px-5',
    body: 'p-0',
  },

  segmented: {
    container: 'inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface-soft p-1',
    item:
      'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors focus:outline-none',
    itemActive: 'bg-surface text-ink font-semibold shadow-2xs',
    itemInactive: 'text-muted-2 hover:text-ink',
  },

  alert: {
    info: 'rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 text-blue-900 dark:text-blue-200',
    error: 'rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/30 p-3.5 text-rose-900 dark:text-rose-200',
    warning: 'rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 text-amber-900 dark:text-amber-200',
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
