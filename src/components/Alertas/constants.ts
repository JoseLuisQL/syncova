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
    surface: 'bg-zinc-100',
    surfaceSoft: 'bg-zinc-50/70',
    border: DESIGN_COLOR_SCALES.primary.border,
    text: 'text-zinc-900',
    textStrong: 'text-zinc-950',
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
  pageBackground: 'min-h-screen bg-zinc-50',
  surface: 'rounded-[26px] border border-zinc-200/60 bg-white shadow-sm',
  panel: 'rounded-[20px] border border-zinc-200/60 bg-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow',
  mutedPanel: 'rounded-[20px] border border-zinc-200/70 bg-zinc-50/50',
  card: 'rounded-[20px] border border-zinc-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]',

  header: {
    title: 'text-[1.45rem] font-bold tracking-tight text-zinc-900 sm:text-[1.55rem]',
    subtitle: 'text-[0.85rem] font-medium text-zinc-500 mt-0.5',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[16px] bg-zinc-900 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] bg-zinc-900 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-zinc-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] border border-zinc-200 bg-white px-4 py-2 text-[13px] font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-zinc-500 hover:bg-zinc-100',
    iconEdit: 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    iconView: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  },

  input: {
    base:
      'w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300',
    normal: 'hover:border-zinc-300',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 placeholder:text-rose-400',
    label: 'mb-1.5 block text-[12px] font-bold text-zinc-700 tracking-wide',
    errorText: 'mt-1.5 text-[11px] font-bold text-rose-600',
    helpText: 'mt-1.5 text-[11px] font-semibold text-zinc-500',
  },

  filter: {
    container: 'rounded-[20px] border border-zinc-200/60 bg-white p-4 shadow-sm sm:p-5',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
  },

  table: {
    container: 'overflow-hidden rounded-[16px] border border-zinc-200/60 bg-white shadow-sm',
    header: 'bg-zinc-50/80 border-b border-zinc-200/60',
    headerCell: 'px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500',
    row: 'transition hover:bg-zinc-50/50 border-b border-zinc-100 last:border-none',
    cell: 'px-4 py-3.5 align-middle text-[13px] font-medium text-zinc-900',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  nav: {
    shell: 'rounded-[24px] border border-zinc-200/60 bg-zinc-50/30 shadow-sm p-4 overflow-hidden',
    tab:
      'inline-flex items-center gap-2 rounded-[14px] px-3.5 py-3 text-[13px] font-bold transition focus:outline-none',
    tabActive: 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60',
    tabInactive: 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-4 sm:items-center sm:p-6',
    panel:
      'w-full rounded-[24px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200/60 sm:max-h-[85vh] overflow-hidden',
    header: 'border-b border-zinc-100 px-6 py-5',
    body: 'max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 sm:max-h-[calc(85vh-160px)] custom-scrollbar',
    footer: 'border-t border-zinc-100 bg-zinc-50/50 px-6 py-5',
  },

  stats: {
    card:
      'min-h-[84px] rounded-[18px] border border-zinc-200/60 bg-white px-4 py-3.5 transition hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden',
    value: 'mt-1 text-[22px] font-extrabold leading-none tracking-tight text-zinc-900 tabular-nums',
    label: 'text-[11px] font-bold uppercase tracking-widest text-zinc-500',
    iconWrapper: 'flex h-10 w-10 items-center justify-center rounded-[12px] bg-zinc-50 border border-zinc-200/60 text-zinc-600',
  },

  badge: {
    active: 'inline-flex items-center rounded-md bg-emerald-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border border-emerald-200/50',
    inactive: 'inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600 border border-zinc-200',
    count: 'inline-flex items-center rounded-md bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm',
    warning: 'inline-flex items-center rounded-md bg-amber-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800 border border-amber-200/50',
    danger: 'inline-flex items-center rounded-md bg-rose-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-800 border border-rose-200/50',
    info: 'inline-flex items-center rounded-md bg-blue-100/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-800 border border-blue-200/50',
    neutral: 'inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-700 border border-zinc-200/60',
  },

  pagination: {
    container: 'border-t border-zinc-100 bg-zinc-50/40 px-5 py-3.5',
    info: 'text-[12px] font-bold text-zinc-500',
    button:
      'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[12px] font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100 disabled:shadow-none',
    buttonActive: 'border-zinc-900 bg-zinc-900 text-white shadow-sm hover:bg-zinc-800',
    buttonInactive: 'text-zinc-700 border-zinc-200',
  },

  alert: {
    info: 'rounded-[16px] border border-blue-200/60 bg-blue-50/50 p-4 text-blue-900',
    error: 'rounded-[16px] border border-rose-200/60 bg-rose-50/50 p-4 text-rose-900',
    warning: 'rounded-[16px] border border-amber-200/60 bg-amber-50/50 p-4 text-amber-900',
  },
} as const;

export const ITEMS_PER_PAGE = 10;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof ALERTS_SECTIONS[number]['id'];
export type TipoAlertaId = typeof TIPOS_ALERTA[number]['id'];
export type NivelAlertaId = typeof NIVELES_ALERTA[number]['id'];
export type AlertSectionConfig = typeof ALERTS_SECTIONS[number];
 