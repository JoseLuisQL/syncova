import {
  Archive,
  CheckCircle,
  Package,
  SlidersHorizontal,
  Warning,
  Syringe,
  TrendUp
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_TOKENS } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    surface: DESIGN_COLOR_SCALES.primary.surface,
    surfaceSoft: DESIGN_COLOR_SCALES.primary.surfaceSoft,
    border: DESIGN_COLOR_SCALES.primary.border,
    text: DESIGN_COLOR_SCALES.primary.text,
    textStrong: DESIGN_COLOR_SCALES.primary.textStrong,
    icon: DESIGN_COLOR_SCALES.primary.icon,
  },
  secondary: {
    gradient: DESIGN_COLOR_SCALES.secondary.gradient,
    surface: 'bg-zinc-50/80',
    surfaceSoft: 'bg-white',
    border: 'border-zinc-200/60',
    text: 'text-zinc-600',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-500',
  },
  success: {
    gradient: DESIGN_COLOR_SCALES.success.gradient,
    surface: 'bg-emerald-50/50',
    surfaceSoft: 'bg-emerald-50/30',
    border: 'border-emerald-200/60',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-900',
    icon: 'text-emerald-600',
  },
  warning: {
    gradient: DESIGN_COLOR_SCALES.warning.gradient,
    surface: 'bg-amber-50/50',
    surfaceSoft: 'bg-amber-50/30',
    border: 'border-amber-200/60',
    text: 'text-amber-700',
    textStrong: 'text-amber-900',
    icon: 'text-amber-600',
  },
  danger: {
    gradient: DESIGN_COLOR_SCALES.danger.gradient,
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
  pageBackground: 'min-h-screen bg-white',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-[14px] border border-[#e7e7ef] bg-white shadow-none',
  mutedPanel: 'rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd]',

  header: {
    title: 'text-[1.35rem] font-bold tracking-tight text-zinc-900 sm:text-[1.45rem]',
    subtitle: 'text-[0.88rem] text-zinc-500 mt-0.5',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[14px] bg-teal-600 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-[#7c3aed] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3 py-1.5 text-sm font-semibold text-[#606571] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm',
    icon:
      'inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-500',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 focus:ring-rose-500',
    iconView: `border ${DESIGN_TOKENS.semantic.info.border} ${DESIGN_TOKENS.semantic.info.surface} text-blue-700 hover:bg-blue-100 hover:text-blue-900 focus:ring-blue-500`,
  },

  input: {
    base:
      'w-full rounded-[10px] border bg-white px-4 py-2.5 text-sm text-[#15171d] shadow-sm transition placeholder:text-[#8b8f9b] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
    normal: 'border-[#e7e7ef] hover:border-[#d7d8e2] focus:border-[#babdca]',
    error: 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1.5 block text-[0.82rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs font-medium text-rose-600',
    helpText: 'mt-1.5 text-xs text-zinc-500',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-transparent',
    headerCell: 'bg-[#fbfafd] px-4 py-3 text-left text-[12px] font-medium tracking-[-0.01em] text-[#8b8f9b]',
    row: 'transition-colors hover:bg-[#fbfafd]',
    cell: 'border-b border-[#eeeef3] px-4 py-3.5 align-middle text-sm text-[#15171d]',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    warning: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
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
    container: 'bg-transparent p-0',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#606571]',
    searchInput:
      'h-9 w-full rounded-[9px] border border-[#e7e7ef] bg-white py-1.5 pl-9 pr-3 text-sm text-[#15171d] shadow-sm transition placeholder:text-[#8b8f9b] hover:border-[#d7d8e2] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
  },

  pagination: {
    container: 'border-t border-[#eeeef3] bg-white px-4 py-5 sm:px-5',
    info: 'text-sm font-medium text-[#747986]',
    button:
      'min-h-9 min-w-9 rounded-[10px] border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'border-[#e7e7ef] bg-white text-[#15171d] shadow-sm',
    buttonInactive: 'border-transparent bg-transparent text-[#606571] hover:bg-[#fbfafd] hover:text-[#15171d]',
  },

  nav: {
    shell: 'rounded-[28px] border border-zinc-200/90 bg-white shadow-sm',
    tab:
      'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/20',
    tabActive: 'bg-teal-50 text-teal-700 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.28)]',
    tabInactive: 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
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
