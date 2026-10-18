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
    surface: 'bg-surface-soft',
    surfaceSoft: 'bg-surface-soft',
    border: 'border-line',
    text: 'text-ink',
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
    surface: 'bg-emerald-50 dark:bg-emerald-950/30',
    surfaceSoft: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    textStrong: 'text-emerald-900 dark:text-emerald-200',
    icon: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'shadow-none',
  },
  warning: {
    gradient: DESIGN_COLOR_SCALES.warning.gradient,
    surface: 'bg-amber-50 dark:bg-amber-950/30',
    surfaceSoft: 'bg-amber-50/60 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-300',
    textStrong: 'text-amber-900 dark:text-amber-200',
    icon: 'text-amber-600 dark:text-amber-400',
    shadow: 'shadow-none',
  },
  danger: {
    gradient: DESIGN_COLOR_SCALES.danger.gradient,
    surface: 'bg-rose-50 dark:bg-rose-950/30',
    surfaceSoft: 'bg-rose-50/60 dark:bg-rose-950/20',
    border: 'border-rose-200 dark:border-rose-800/60',
    text: 'text-rose-700 dark:text-rose-300',
    textStrong: 'text-rose-900 dark:text-rose-200',
    icon: 'text-rose-600 dark:text-rose-400',
    shadow: 'shadow-none',
  },
  neutral: {
    gradient: DESIGN_COLOR_SCALES.neutral.gradient,
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
    surface: 'bg-blue-50 dark:bg-blue-950/30',
    surfaceSoft: 'bg-blue-50/60 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-700 dark:text-blue-300',
    textStrong: 'text-blue-900 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400',
    shadow: 'shadow-none',
  },
} as const;

export const ALERTS_SECTIONS = [
  {
    id: 'alertas',
    label: 'Bandeja de Alertas',
    contextLabel: 'Gestión y resolución de alertas',
    description: 'Triaje operativo, filtros rápidos y acciones sobre incidentes activos',
    icon: Bell,
    path: '/alertas/alertas',
    category: 'gestion' as const,
    routeSegment: 'alertas',
  },
  {
    id: 'reportes',
    label: 'Reportes y Análisis',
    contextLabel: 'Métricas históricas y exportación',
    description: 'Análisis por período, tasa de atención y exportación Excel',
    icon: ChartBar,
    path: '/alertas/reportes',
    category: 'gestion' as const,
    routeSegment: 'reportes',
  },
  {
    id: 'configuracion',
    label: 'Reglas y Umbrales',
    contextLabel: 'Automatización y mantenimiento',
    description: 'Parámetros de detección automática y depuración de historial',
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
  {
    id: 'vencimiento',
    label: 'Vencimiento',
    pluralLabel: 'Vencimientos',
    description: 'Lotes próximos a caducar o vencidos en almacén',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    barColor: 'bg-amber-500',
    tone: 'warning' as const,
  },
  {
    id: 'stock_bajo',
    label: 'Stock Bajo',
    pluralLabel: 'Stock Bajo',
    description: 'Biológicos o jeringas por debajo del umbral crítico',
    icon: ShieldWarning,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    barColor: 'bg-rose-500',
    tone: 'danger' as const,
  },
  {
    id: 'discrepancia',
    label: 'Discrepancia',
    pluralLabel: 'Discrepancias',
    description: 'Diferencias detectadas entre kardex, lotes o entregas',
    icon: Warning,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    barColor: 'bg-amber-500',
    tone: 'warning' as const,
  },
  {
    id: 'sistema',
    label: 'Sistema',
    pluralLabel: 'Sistema',
    description: 'Avisos operativos y notificaciones administrativas',
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    barColor: 'bg-blue-500',
    tone: 'info' as const,
  },
] as const;

export const NIVELES_ALERTA = [
  {
    id: 'error',
    label: 'Crítica',
    pluralLabel: 'Críticas',
    priority: 4,
    icon: WarningOctagon,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    barColor: 'bg-rose-500',
    tone: 'danger' as const,
  },
  {
    id: 'warning',
    label: 'Advertencia',
    pluralLabel: 'Advertencias',
    priority: 3,
    icon: Warning,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    barColor: 'bg-amber-500',
    tone: 'warning' as const,
  },
  {
    id: 'info',
    label: 'Informativa',
    pluralLabel: 'Informativas',
    priority: 2,
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    barColor: 'bg-blue-500',
    tone: 'info' as const,
  },
  {
    id: 'success',
    label: 'Resuelta / OK',
    pluralLabel: 'Exitosas',
    priority: 1,
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    barColor: 'bg-emerald-500',
    tone: 'success' as const,
  },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-app',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-surface transition-colors',
  mutedPanel: 'rounded-xl border border-line bg-surface-soft',
  card: 'rounded-xl border border-line bg-surface',

  header: {
    title: 'text-xl font-semibold tracking-tight text-ink sm:text-2xl',
    subtitle: 'text-sm text-muted-2 mt-0.5',
    iconWrapper:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 py-2 text-xs sm:text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:border-brand-600 hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs sm:text-[0.8125rem] font-medium text-ink transition-colors duration-150 hover:border-line-strong hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    danger:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2 text-xs sm:text-[0.8125rem] font-medium text-rose-700 dark:text-rose-300 transition-colors duration-150 hover:bg-rose-100 dark:hover:bg-rose-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    ghost:
      'inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-2 transition-colors duration-150 hover:bg-surface-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap shrink-0',
    icon:
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-2 transition-colors duration-150 hover:border-line hover:bg-surface-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50 shrink-0',
    iconEdit: 'border border-line bg-surface text-muted-2 hover:bg-surface-soft hover:text-ink',
    iconDelete: 'text-rose-600 dark:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30',
    iconView: 'text-brand hover:border-brand/30 hover:bg-brand/10',
  },

  input: {
    base:
      'h-9 w-full rounded-lg border bg-surface px-3.5 text-xs sm:text-sm text-ink transition-colors duration-150 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/15',
    normal: 'border-line hover:border-line-strong focus:border-brand',
    error: 'border-rose-300 bg-rose-50/25 focus:border-rose-500 focus:ring-rose-500/15 text-rose-900 placeholder:text-rose-400',
    label: 'mb-1.5 block text-xs font-medium text-muted-2',
    errorText: 'mt-1.5 text-xs font-medium text-rose-600',
    helpText: 'mt-1.5 text-xs text-muted',
  },

  filter: {
    container: 'bg-transparent p-0',
    searchIcon: 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted',
    searchInput:
      'h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-8 text-xs sm:text-sm text-ink transition-colors duration-150 placeholder:text-muted hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
  },

  table: {
    container: 'overflow-hidden rounded-xl border border-line bg-surface',
    header: 'border-b border-line bg-surface-soft',
    headerCell: 'px-4 py-3 text-left text-xs font-semibold text-muted-2 whitespace-nowrap',
    row: 'transition-colors duration-150 hover:bg-surface-soft/70',
    cell: 'border-b border-line-soft px-4 py-3 align-middle text-sm text-ink',
    emptyIcon: 'mx-auto mb-3 h-10 w-10 text-muted',
  },

  nav: {
    shell: 'border-b border-line bg-surface',
    tab: 'inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none',
    tabActive: 'border-brand text-brand',
    tabInactive: 'border-transparent text-muted-2 hover:text-ink',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-[2px] dark:bg-black/70',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6',
    panel:
      'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-xl sm:max-h-[88vh] sm:rounded-2xl',
    header: 'shrink-0 border-b border-line-soft px-5 py-4 sm:px-6',
    body: 'flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 custom-scrollbar',
    footer: 'shrink-0 border-t border-line-soft bg-surface-soft px-5 py-3.5 sm:px-6',
  },

  stats: {
    card: 'rounded-xl border border-line bg-surface p-4 sm:p-5 transition-colors',
    value: 'mt-1.5 font-mono text-2xl font-semibold leading-none tracking-tight text-ink tabular-nums',
    label: 'text-xs font-medium text-muted-2',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-soft text-muted-2 shrink-0',
  },

  badge: {
    active: 'text-xs font-medium text-emerald-700 dark:text-emerald-400',
    inactive: 'text-xs font-medium text-muted-2',
    count: 'font-mono text-xs font-medium text-ink tabular-nums',
    warning: 'text-xs font-medium text-amber-700 dark:text-amber-400',
    danger: 'text-xs font-medium text-rose-600 dark:text-rose-400',
    info: 'text-xs font-medium text-blue-600 dark:text-blue-400',
    neutral: 'text-xs font-medium text-muted-2',
  },

  pagination: {
    container: 'border-t border-line-soft bg-surface px-4 py-3.5 sm:px-5',
    info: 'text-xs text-muted-2 font-mono tabular-nums',
    button:
      'rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-brand bg-brand text-white hover:bg-brand-600',
    buttonInactive: 'text-ink border-line',
  },

  alert: {
    info: 'rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/30 p-4 text-blue-900 dark:text-blue-200',
    error: 'rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/30 p-4 text-rose-900 dark:text-rose-200',
    warning: 'rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 p-4 text-amber-900 dark:text-amber-200',
  },
} as const;

export const ITEMS_PER_PAGE = 12;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof ALERTS_SECTIONS[number]['id'];
export type TipoAlertaId = typeof TIPOS_ALERTA[number]['id'];
export type NivelAlertaId = typeof NIVELES_ALERTA[number]['id'];
export type AlertSectionConfig = typeof ALERTS_SECTIONS[number];

export const formatRelativeAlertDate = (fecha: Date | string): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (Number.isNaN(fechaObj.getTime())) return 'Fecha no disponible';

  const ahora = new Date();
  const diferencia = ahora.getTime() - fechaObj.getTime();
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 1) return 'Hace instantes';
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas} h`;
  if (dias < 7) return `Hace ${dias} d`;
  return fechaObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatExactAlertDate = (fecha: Date | string): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (Number.isNaN(fechaObj.getTime())) return '—';
  return fechaObj.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export interface ConfiguracionUmbralesAlerta {
  diasAnticipacion: number;
  stockMinimo: number;
  diasRetencion: number;
}

export const DEFAULT_ALERTAS_CONFIG: ConfiguracionUmbralesAlerta = {
  diasAnticipacion: 30,
  stockMinimo: 100,
  diasRetencion: 30,
};

export const loadAlertasConfig = (): ConfiguracionUmbralesAlerta => {
  try {
    const saved = localStorage.getItem('alertas_umbrales_v3');
    if (saved) return { ...DEFAULT_ALERTAS_CONFIG, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return DEFAULT_ALERTAS_CONFIG;
};

export const saveAlertasConfig = (config: ConfiguracionUmbralesAlerta): void => {
  localStorage.setItem('alertas_umbrales_v3', JSON.stringify(config));
};