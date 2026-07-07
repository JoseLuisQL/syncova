import {
  ChartLineUp,
  WarningOctagon,
  Warning,
  ChartBar,
  Bell,
  CheckCircle,
  Clock,
  Folders,
  Info,
  GearSix,
  ShieldWarning,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    surface: 'bg-teal-50',
    surfaceSoft: 'bg-teal-50/70',
    border: DESIGN_COLOR_SCALES.primary.border,
    text: 'text-teal-800',
    textStrong: 'text-teal-950',
    icon: DESIGN_COLOR_SCALES.primary.icon,
    shadow: 'shadow-zinc-500/10',
  },
  secondary: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    surface: DESIGN_COLOR_SCALES.secondary.surface,
    surfaceSoft: DESIGN_COLOR_SCALES.secondary.surfaceSoft,
    border: DESIGN_COLOR_SCALES.secondary.border,
    text: 'text-zinc-700',
    textStrong: DESIGN_COLOR_SCALES.secondary.textStrong,
    icon: 'text-zinc-600',
    shadow: 'shadow-zinc-500/10',
  },
  success: {
    gradient: DESIGN_COLOR_SCALES.success.gradient,
    surface: DESIGN_COLOR_SCALES.success.surface,
    surfaceSoft: DESIGN_COLOR_SCALES.success.surfaceSoft,
    border: DESIGN_COLOR_SCALES.success.border,
    text: 'text-emerald-800',
    textStrong: DESIGN_COLOR_SCALES.success.textStrong,
    icon: 'text-emerald-700',
    shadow: 'shadow-emerald-500/10',
  },
  warning: {
    gradient: DESIGN_COLOR_SCALES.warning.gradient,
    surface: DESIGN_COLOR_SCALES.warning.surface,
    surfaceSoft: DESIGN_COLOR_SCALES.warning.surfaceSoft,
    border: DESIGN_COLOR_SCALES.warning.border,
    text: 'text-amber-800',
    textStrong: DESIGN_COLOR_SCALES.warning.textStrong,
    icon: 'text-amber-700',
    shadow: 'shadow-amber-500/10',
  },
  danger: {
    gradient: DESIGN_COLOR_SCALES.danger.gradient,
    surface: DESIGN_COLOR_SCALES.danger.surface,
    surfaceSoft: DESIGN_COLOR_SCALES.danger.surfaceSoft,
    border: DESIGN_COLOR_SCALES.danger.border,
    text: 'text-rose-800',
    textStrong: DESIGN_COLOR_SCALES.danger.textStrong,
    icon: 'text-rose-700',
    shadow: 'shadow-rose-500/10',
  },
  neutral: {
    gradient: DESIGN_COLOR_SCALES.neutral.gradient,
    surface: DESIGN_COLOR_SCALES.neutral.surface,
    surfaceSoft: 'bg-zinc-50/85',
    border: DESIGN_COLOR_SCALES.neutral.border,
    text: DESIGN_COLOR_SCALES.neutral.text,
    textStrong: DESIGN_COLOR_SCALES.neutral.textStrong,
    icon: DESIGN_COLOR_SCALES.neutral.icon,
    shadow: 'shadow-zinc-500/10',
  },
  info: {
    gradient: DESIGN_COLOR_SCALES.info.gradient,
    surface: DESIGN_COLOR_SCALES.info.surface,
    surfaceSoft: DESIGN_COLOR_SCALES.info.surfaceSoft,
    border: DESIGN_COLOR_SCALES.info.border,
    text: 'text-blue-800',
    textStrong: DESIGN_COLOR_SCALES.info.textStrong,
    icon: 'text-blue-700',
    shadow: 'shadow-blue-500/10',
  },
} as const;

export const ALERTS_SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    contextLabel: 'Monitoreo general',
    description: 'Resumen del estado y alertas recientes',
    icon: ChartLineUp,
    path: '/alertas/dashboard',
    category: 'monitoreo' as const,
    routeSegment: 'dashboard',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    contextLabel: 'Gestión de alertas',
    description: 'Listado operativo, filtros y acciones masivas',
    icon: Bell,
    path: '/alertas/alertas',
    category: 'gestion' as const,
    routeSegment: 'alertas',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    contextLabel: 'Análisis de alertas',
    description: 'Distribución, período y exportación',
    icon: ChartBar,
    path: '/alertas/reportes',
    category: 'gestion' as const,
    routeSegment: 'reportes',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    contextLabel: 'Configuración de alertas',
    description: 'Umbrales, generación y limpieza',
    icon: GearSix,
    path: '/alertas/configuracion',
    category: 'configuracion' as const,
    routeSegment: 'configuracion',
  },
] as const;

export const SECTION_GROUPS = [
  {
    key: 'monitoreo',
    label: 'Monitoreo',
    icon: ChartLineUp,
    description: 'Vista ejecutiva del estado de alertas',
  },
  {
    key: 'gestion',
    label: 'Gestión',
    icon: Folders,
    description: 'Operación diaria y análisis del módulo',
  },
  {
    key: 'configuracion',
    label: 'Configuración',
    icon: GearSix,
    description: 'Parámetros y acciones del sistema',
  },
] as const;

export const TIPOS_ALERTA = [
  { id: 'vencimiento', label: 'Vencimientos', icon: Clock, color: 'text-amber-700', bgColor: 'bg-amber-100', tone: 'warning' as const },
  { id: 'stock_bajo', label: 'Stock Bajo', icon: ShieldWarning, color: 'text-rose-700', bgColor: 'bg-rose-100', tone: 'danger' as const },
  { id: 'discrepancia', label: 'Discrepancias', icon: Warning, color: 'text-amber-700', bgColor: 'bg-amber-100', tone: 'warning' as const },
  { id: 'sistema', label: 'Sistema', icon: Info, color: 'text-blue-700', bgColor: 'bg-blue-100', tone: 'info' as const },
] as const;

export const NIVELES_ALERTA = [
  { id: 'error', label: 'Críticas', icon: WarningOctagon, color: 'text-rose-700', bgColor: 'bg-rose-100/50', tone: 'danger' as const },
  { id: 'warning', label: 'Advertencias', icon: Warning, color: 'text-amber-700', bgColor: 'bg-amber-100/50', tone: 'warning' as const },
  { id: 'info', label: 'Informativas', icon: Info, color: 'text-blue-700', bgColor: 'bg-blue-100/50', tone: 'info' as const },
  { id: 'success', label: 'Exitosas', icon: CheckCircle, color: 'text-emerald-700', bgColor: 'bg-emerald-100/50', tone: 'success' as const },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-white',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-white shadow-none transition-colors hover:bg-surface-soft',
  mutedPanel: 'rounded-[12px] border border-line bg-surface-soft',
  card: 'rounded-xl border border-line bg-white shadow-none',

  header: {
    title: 'text-[1.45rem] font-bold tracking-tight text-zinc-900 sm:text-[1.55rem]',
    subtitle: 'text-[0.85rem] font-medium text-zinc-500 mt-0.5',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3 py-1.5 text-sm font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-zinc-500 hover:bg-zinc-100',
    iconEdit: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    iconView: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-base text-ink shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 focus:ring-line-focus/70',
    normal: 'border-line hover:border-line-strong focus:border-line-focus-strong',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 placeholder:text-rose-400',
    label: 'mb-1.5 block text-sm font-medium text-[#424750]',
    errorText: 'mt-1.5 text-xs font-bold text-rose-600',
    helpText: 'mt-1.5 text-xs font-semibold text-zinc-500',
  },

  filter: {
    container: 'bg-transparent p-0',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2',
    searchInput:
      'h-9 w-full rounded-[9px] border border-line bg-white py-1.5 pl-9 pr-3 text-sm text-ink shadow-sm transition placeholder:text-muted hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-transparent',
    headerCell: 'bg-surface-soft px-4 py-3 text-left text-sm font-medium tracking-[-0.01em] text-muted',
    row: 'transition-colors hover:bg-surface-soft',
    cell: 'border-b border-line-soft px-4 py-3.5 align-middle text-sm text-ink',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  nav: {
    shell: 'rounded-[28px] border border-zinc-200/90 bg-white shadow-sm',
    tab:
      'inline-flex items-center gap-2 rounded-xl px-3.5 py-3 text-base font-bold transition focus:outline-none',
    tabActive: 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60',
    tabInactive: 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-ink-soft/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full overflow-hidden rounded-t-[10px] border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-lg',
    header: 'border-b border-line-soft px-4 py-3.5 sm:px-5',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5 custom-scrollbar',
    footer: 'border-t border-line-soft bg-surface-soft px-4 py-3 sm:px-5',
  },

  stats: {
    card:
      'min-h-[84px] rounded-3xl border border-zinc-200/60 bg-white px-4 py-3.5 transition hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden',
    value: 'mt-1 text-2xl font-extrabold leading-none tracking-tight text-zinc-900 tabular-nums',
    label: 'text-xs font-bold uppercase tracking-widest text-zinc-500',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-[12px] bg-zinc-50 border border-zinc-200/60 text-zinc-600',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-zinc-400',
    count: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    neutral: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
  },

  pagination: {
    container: 'border-t border-line-soft bg-white px-4 py-5 sm:px-5',
    info: 'text-sm font-medium text-muted-3',
    button:
      'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100 disabled:shadow-none',
    buttonActive: 'border-teal-600 bg-teal-600 text-white shadow-sm hover:bg-teal-700',
    buttonInactive: 'text-zinc-700 border-zinc-200',
  },

  alert: {
    info: 'rounded-2xl border border-blue-200/60 bg-blue-50/50 p-4 text-blue-900',
    error: 'rounded-2xl border border-rose-200/60 bg-rose-50/50 p-4 text-rose-900',
    warning: 'rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 text-amber-900',
  },
} as const;

export const ITEMS_PER_PAGE = 10;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof ALERTS_SECTIONS[number]['id'];
export type TipoAlertaId = typeof TIPOS_ALERTA[number]['id'];
export type NivelAlertaId = typeof NIVELES_ALERTA[number]['id'];
export type AlertSectionConfig = typeof ALERTS_SECTIONS[number];
 