import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  FolderKanban,
  Info,
  Settings,
  ShieldAlert,
} from 'lucide-react';

export const COLORS = {
  primary: {
    gradient: 'from-teal-600 to-cyan-600',
    surface: 'bg-teal-50',
    surfaceSoft: 'bg-teal-50/70',
    border: 'border-teal-200',
    text: 'text-teal-700',
    textStrong: 'text-teal-900',
    icon: 'text-teal-600',
    shadow: 'shadow-teal-500/10',
  },
  secondary: {
    gradient: 'from-cyan-600 to-sky-600',
    surface: 'bg-cyan-50',
    surfaceSoft: 'bg-cyan-50/80',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    textStrong: 'text-cyan-900',
    icon: 'text-cyan-600',
    shadow: 'shadow-cyan-500/10',
  },
  success: {
    gradient: 'from-emerald-500 to-teal-500',
    surface: 'bg-emerald-50',
    surfaceSoft: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-900',
    icon: 'text-emerald-600',
    shadow: 'shadow-emerald-500/10',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    surface: 'bg-amber-50',
    surfaceSoft: 'bg-amber-50/80',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textStrong: 'text-amber-900',
    icon: 'text-amber-600',
    shadow: 'shadow-amber-500/10',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    surface: 'bg-rose-50',
    surfaceSoft: 'bg-rose-50/80',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textStrong: 'text-rose-900',
    icon: 'text-rose-600',
    shadow: 'shadow-rose-500/10',
  },
  neutral: {
    gradient: 'from-slate-500 to-slate-600',
    surface: 'bg-slate-50',
    surfaceSoft: 'bg-slate-50/85',
    border: 'border-slate-200',
    text: 'text-slate-700',
    textStrong: 'text-slate-900',
    icon: 'text-slate-500',
    shadow: 'shadow-slate-500/10',
  },
  info: {
    gradient: 'from-sky-500 to-blue-500',
    surface: 'bg-sky-50',
    surfaceSoft: 'bg-sky-50/80',
    border: 'border-sky-200',
    text: 'text-sky-700',
    textStrong: 'text-sky-900',
    icon: 'text-sky-600',
    shadow: 'shadow-sky-500/10',
  },
} as const;

export const ALERTS_SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    contextLabel: 'Monitoreo general',
    description: 'Resumen del estado y alertas recientes',
    icon: Activity,
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
    icon: BarChart3,
    path: '/alertas/reportes',
    category: 'gestion' as const,
    routeSegment: 'reportes',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    contextLabel: 'Configuración de alertas',
    description: 'Umbrales, generación y limpieza',
    icon: Settings,
    path: '/alertas/configuracion',
    category: 'configuracion' as const,
    routeSegment: 'configuracion',
  },
] as const;

export const SECTION_GROUPS = [
  {
    key: 'monitoreo',
    label: 'Monitoreo',
    icon: Activity,
    description: 'Vista ejecutiva del estado de alertas',
  },
  {
    key: 'gestion',
    label: 'Gestión',
    icon: FolderKanban,
    description: 'Operación diaria y análisis del módulo',
  },
  {
    key: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    description: 'Parámetros y acciones del sistema',
  },
] as const;

export const TIPOS_ALERTA = [
  { id: 'vencimiento', label: 'Vencimientos', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', tone: 'warning' as const },
  { id: 'stock_bajo', label: 'Stock Bajo', icon: ShieldAlert, color: 'text-rose-600', bgColor: 'bg-rose-100', tone: 'danger' as const },
  { id: 'discrepancia', label: 'Discrepancias', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100', tone: 'warning' as const },
  { id: 'sistema', label: 'Sistema', icon: Info, color: 'text-cyan-600', bgColor: 'bg-cyan-100', tone: 'info' as const },
] as const;

export const NIVELES_ALERTA = [
  { id: 'error', label: 'Críticas', icon: AlertOctagon, color: 'text-rose-600', bgColor: 'bg-rose-100', tone: 'danger' as const },
  { id: 'warning', label: 'Advertencias', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100', tone: 'warning' as const },
  { id: 'info', label: 'Informativas', icon: Info, color: 'text-cyan-600', bgColor: 'bg-cyan-100', tone: 'info' as const },
  { id: 'success', label: 'Exitosas', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100', tone: 'success' as const },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-[linear-gradient(180deg,#f8fcfc_0%,#f3fbfb_48%,#eef7f7_100%)]',
  surface: 'rounded-[26px] border border-slate-200/90 bg-white shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)]',
  panel: 'rounded-[22px] border border-slate-200/90 bg-white shadow-[0_8px_20px_-18px_rgba(15,23,42,0.18)]',
  mutedPanel: 'rounded-[20px] border border-slate-200 bg-slate-50/80',
  card: 'rounded-[24px] border border-slate-200/90 bg-white shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]',

  header: {
    title: 'text-[1.45rem] font-semibold tracking-tight text-slate-950 sm:text-[1.55rem]',
    subtitle: 'text-[0.92rem] text-slate-600',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/10',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-500',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 focus:ring-cyan-500',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/18',
    normal: 'border-slate-200 hover:border-slate-300 focus:border-teal-500',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-slate-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-slate-500',
  },

  filter: {
    container: 'rounded-[20px] border border-slate-200 bg-white p-3.5 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.14)] sm:p-4',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
    searchInput:
      'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/18',
  },

  table: {
    container: 'overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-sm',
    header: 'bg-slate-50/95',
    headerCell: 'px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-slate-500',
    row: 'transition hover:bg-teal-50/45',
    cell: 'px-4 py-3.5 align-top',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-slate-300',
  },

  nav: {
    shell: 'rounded-[28px] border border-slate-200/90 bg-white shadow-sm',
    tab:
      'inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/20',
    tabActive: 'bg-teal-50 text-teal-700 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.45)]',
    tabInactive: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[1px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full rounded-t-[30px] bg-white shadow-2xl ring-1 ring-slate-200/80 sm:max-h-[90vh] sm:rounded-[28px]',
    header: 'border-b border-slate-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-slate-100 bg-white px-5 py-4 sm:px-6',
  },

  stats: {
    card:
      'min-h-[78px] rounded-[16px] border px-3.5 py-3 transition hover:border-slate-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.38rem] font-semibold leading-none tracking-tight',
    label: 'text-[0.8rem] font-medium',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
    inactive: 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600',
    count: 'inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700',
    warning: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700',
    info: 'inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700',
    neutral: 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700',
  },

  pagination: {
    container: 'border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5',
    info: 'text-sm text-slate-600',
    button:
      'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-teal-200 bg-teal-50 text-teal-700',
    buttonInactive: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
  },

  alert: {
    info: 'rounded-[18px] border border-sky-200 bg-sky-50/80 p-4 text-sky-800',
    error: 'rounded-[18px] border border-rose-200 bg-rose-50/80 p-4 text-rose-800',
    warning: 'rounded-[18px] border border-amber-200 bg-amber-50/80 p-4 text-amber-800',
  },
} as const;

export const ITEMS_PER_PAGE = 10;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof ALERTS_SECTIONS[number]['id'];
export type TipoAlertaId = typeof TIPOS_ALERTA[number]['id'];
export type NivelAlertaId = typeof NIVELES_ALERTA[number]['id'];
export type AlertSectionConfig = typeof ALERTS_SECTIONS[number];
