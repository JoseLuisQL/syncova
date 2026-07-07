import {
  CalendarBlank,
  Clock,
  FolderDashed,
  Package,
  Gear,
  Target,
  TrendUp,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_TOKENS } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-600',
    shadow: 'shadow-sm',
  },
  secondary: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-600',
    shadow: 'shadow-sm',
  },
  success: {
    gradient: DESIGN_COLOR_SCALES.success.gradient,
    surface: 'bg-emerald-50',
    surfaceSoft: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-900',
    icon: 'text-emerald-600',
    shadow: 'shadow-sm',
  },
  warning: {
    gradient: DESIGN_COLOR_SCALES.warning.gradient,
    surface: 'bg-amber-50',
    surfaceSoft: 'bg-amber-50/80',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textStrong: 'text-amber-900',
    icon: 'text-amber-600',
    shadow: 'shadow-sm',
  },
  danger: {
    gradient: DESIGN_COLOR_SCALES.danger.gradient,
    surface: 'bg-rose-50',
    surfaceSoft: 'bg-rose-50/80',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textStrong: 'text-rose-900',
    icon: 'text-rose-600',
    shadow: 'shadow-sm',
  },
  neutral: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-500',
    shadow: 'shadow-sm',
  },
  info: {
    gradient: DESIGN_COLOR_SCALES.info.gradient,
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
  pageBackground: 'min-h-screen bg-white',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-[#e7e7ef] bg-white shadow-none',
  mutedPanel: 'rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd]',
  card: 'rounded-xl border border-[#e7e7ef] bg-white shadow-none',

  header: {
    title: 'text-[1.45rem] font-semibold tracking-tight text-zinc-950 sm:text-[1.58rem]',
    subtitle: 'text-[0.92rem] text-zinc-600',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 border border-teal-600 text-white shadow-md shadow-teal-500/20',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-[#7c3aed] border border-[#7c3aed] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#15171d] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3 py-1.5 text-sm font-semibold text-[#606571] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-[#7c3aed] border border-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-base text-[#15171d] shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
    normal: 'border-[#e7e7ef] hover:border-[#d7d8e2] focus:border-[#babdca]',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1.5 block text-sm font-medium text-[#424750]',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-base text-[#15171d] shadow-none transition focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
    normal: 'border-[#e7e7ef] hover:border-[#d7d8e2] focus:border-[#babdca]',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-transparent',
    headerCell: 'bg-[#fbfafd] px-4 py-3 text-left text-sm font-medium tracking-[-0.01em] text-[#8b8f9b]',
    row: 'transition-colors hover:bg-[#fbfafd]',
    cell: 'border-b border-[#eeeef3] px-4 py-3.5 align-middle text-sm text-[#15171d]',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    warning: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    neutral: 'inline-flex items-center rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-[#111318]/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full overflow-hidden rounded-t-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-lg',
    header: 'border-b border-[#eeeef3] px-4 py-3.5 sm:px-5',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5',
    footer: 'border-t border-[#eeeef3] bg-[#fbfafd] px-4 py-3 sm:px-5',
  },

  stats: {
    card:
      'min-h-[78px] rounded-xl border px-3.5 py-3 transition hover:border-zinc-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.4rem] font-semibold leading-none tracking-tight',
    label: 'text-[0.8rem] font-medium',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm',
  },

  filter: {
    container: 'bg-transparent p-0',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606571]',
    searchInput:
      'h-9 w-full rounded-[9px] border border-[#e7e7ef] bg-white py-1.5 pl-9 pr-3 text-sm text-[#15171d] shadow-sm transition placeholder:text-[#8b8f9b] hover:border-[#d7d8e2] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
  },

  pagination: {
    container: 'border-t border-[#eeeef3] bg-white px-4 py-5 sm:px-5',
    info: 'text-sm font-medium text-[#747986]',
    button:
      'min-h-9 min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'border-[#e7e7ef] bg-white text-[#15171d] shadow-sm',
    buttonInactive: 'border-transparent bg-transparent text-[#606571] hover:bg-[#fbfafd] hover:text-[#15171d]',
  },

  nav: {
    shell: 'rounded-3xl border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
    tab:
      'inline-flex items-center gap-2 rounded-2xl px-3.5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/20',
    tabActive: 'bg-teal-50 text-teal-700 shadow-sm',
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
    shell: 'rounded-none border-0 bg-transparent shadow-none',
    header: 'border-b border-[#eeeef3] px-0 pb-3',
    body: 'py-4',
  },

  segmented: {
    container: 'inline-flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5',
    item:
      'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/20',
    itemActive: 'bg-white text-teal-700 shadow-sm ring-1 ring-teal-100',
    itemInactive: 'text-zinc-600 hover:bg-white/80 hover:text-zinc-900',
  },

  alert: {
    info: `rounded-xl border ${DESIGN_TOKENS.semantic.info.border}/60 ${DESIGN_TOKENS.semantic.info.surface}/50 p-4 ${DESIGN_TOKENS.semantic.info.textStrong}`,
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
