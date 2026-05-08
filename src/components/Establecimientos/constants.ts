import { Pulse, Building, Buildings, GitBranch, MapPin, TreeStructure, Shield, ShareNetwork } from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_GRADIENTS, DESIGN_TOKENS } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    surface: 'bg-teal-50',
    surfaceSoft: 'bg-teal-50/70',
    border: DESIGN_COLOR_SCALES.primary.border,
    text: DESIGN_COLOR_SCALES.primary.text,
    textStrong: DESIGN_COLOR_SCALES.primary.textStrong,
    icon: DESIGN_COLOR_SCALES.primary.icon,
  },
  secondary: {
    gradient: DESIGN_GRADIENTS.secondary,
    surface: 'bg-cyan-50',
    surfaceSoft: 'bg-cyan-50/70',
    border: DESIGN_TOKENS.border.default,
    text: DESIGN_TOKENS.text.primary,
    textStrong: DESIGN_TOKENS.text.primary,
    icon: 'text-cyan-800',
  },
  success: {
    gradient: DESIGN_GRADIENTS.success,
    surface: DESIGN_TOKENS.semantic.success.surface,
    surfaceSoft: 'bg-emerald-50/70',
    border: DESIGN_TOKENS.semantic.success.border,
    text: DESIGN_TOKENS.semantic.success.text,
    textStrong: DESIGN_TOKENS.semantic.success.textStrong,
    icon: DESIGN_TOKENS.semantic.success.icon,
  },
  warning: {
    gradient: DESIGN_GRADIENTS.warning,
    surface: DESIGN_TOKENS.semantic.warning.surface,
    surfaceSoft: 'bg-amber-50/70',
    border: DESIGN_TOKENS.semantic.warning.border,
    text: DESIGN_TOKENS.semantic.warning.text,
    textStrong: DESIGN_TOKENS.semantic.warning.textStrong,
    icon: DESIGN_TOKENS.semantic.warning.icon,
  },
  danger: {
    gradient: DESIGN_GRADIENTS.danger,
    surface: DESIGN_TOKENS.semantic.danger.surface,
    surfaceSoft: 'bg-rose-50/70',
    border: DESIGN_TOKENS.semantic.danger.border,
    text: DESIGN_TOKENS.semantic.danger.text,
    textStrong: DESIGN_TOKENS.semantic.danger.textStrong,
    icon: DESIGN_TOKENS.semantic.danger.icon,
  },
  neutral: {
    gradient: DESIGN_GRADIENTS.secondary,
    surface: DESIGN_TOKENS.semantic.neutral.surface,
    surfaceSoft: 'bg-zinc-50/80',
    border: DESIGN_TOKENS.semantic.neutral.border,
    text: DESIGN_TOKENS.semantic.neutral.text,
    textStrong: DESIGN_TOKENS.semantic.neutral.textStrong,
    icon: DESIGN_TOKENS.semantic.neutral.icon,
  },
} as const;

export const SECTIONS_CONFIG = [
  {
    id: 'redes',
    label: 'Redes',
    contextLabel: 'Redes de salud',
    description: 'Nodos principales de la organización territorial',
    icon: TreeStructure,
    path: '/establecimientos/redes',
    category: 'estructura' as const,
  },
  {
    id: 'microredes',
    label: 'Microredes',
    contextLabel: 'Microredes de salud',
    description: 'Agrupaciones territoriales vinculadas a cada red',
    icon: GitBranch,
    path: '/establecimientos/microredes',
    category: 'estructura' as const,
  },
  {
    id: 'centros-acopio',
    label: 'Centros de Acopio',
    contextLabel: 'Centros de acopio',
    description: 'Puntos de distribución y coordinación operativa',
    icon: Buildings,
    path: '/establecimientos/centros-acopio',
    category: 'operacion' as const,
  },
  {
    id: 'establecimientos',
    label: 'Establecimientos',
    contextLabel: 'Establecimientos de salud',
    description: 'Centros y puestos de atención asociados',
    icon: Building,
    path: '/establecimientos/establecimientos',
    category: 'operacion' as const,
  },
] as const;

export const SECTION_GROUPS = [
  {
    key: 'estructura',
    label: 'Estructura',
    icon: TreeStructure,
    description: 'Base organizacional del sistema',
  },
  {
    key: 'operacion',
    label: 'Operación Territorial',
    icon: ShareNetwork,
    description: 'Puntos logísticos y de atención',
  },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-white',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-[14px] border border-[#e7e7ef] bg-white shadow-none',
  mutedPanel: 'rounded-[12px] border border-[#e7e7ef] bg-[#fbfafd]',

  header: {
    title: 'text-[1.45rem] font-semibold tracking-tight text-zinc-950 sm:text-[1.55rem]',
    subtitle: 'text-[0.92rem] text-zinc-600',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-teal-600 text-white shadow-md shadow-teal-500/20',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-[#7c3aed] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-[#e7e7ef] bg-white px-3 py-1.5 text-sm font-semibold text-[#606571] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-500',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 focus:ring-teal-500',
    iconNavigate: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 focus:ring-amber-500',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-[13px] text-[#15171d] shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
    normal: 'border-[#e7e7ef] hover:border-[#d7d8e2] focus:border-[#babdca]',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1.5 block text-[12px] font-medium text-[#424750]',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
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
    neutral: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-[#111318]/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full overflow-hidden rounded-t-[10px] border border-[#e7e7ef] bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-[10px]',
    header: 'border-b border-[#eeeef3] px-4 py-3.5 sm:px-5',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5',
    footer: 'border-t border-[#eeeef3] bg-[#fbfafd] px-4 py-3 sm:px-5',
  },

  stats: {
    card:
      'min-h-[84px] rounded-[18px] border px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.4rem] font-semibold leading-none tracking-tight',
    label: 'text-[0.8rem] font-medium',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm',
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
  redes: [
    { key: 'total', label: 'Total redes', icon: TreeStructure, color: 'primary' as const },
    { key: 'activas', label: 'Activas', icon: Pulse, color: 'success' as const },
    { key: 'conMicroredes', label: 'Con microredes', icon: GitBranch, color: 'warning' as const },
    { key: 'inactivas', label: 'Inactivas', icon: Shield, color: 'danger' as const },
  ],
  microredes: [
    { key: 'total', label: 'Total microredes', icon: GitBranch, color: 'primary' as const },
    { key: 'activas', label: 'Activas', icon: Pulse, color: 'success' as const },
    { key: 'conCentros', label: 'Con centros', icon: Buildings, color: 'warning' as const },
    { key: 'inactivas', label: 'Inactivas', icon: Shield, color: 'danger' as const },
  ],
  centrosAcopio: [
    { key: 'total', label: 'Total centros', icon: Buildings, color: 'primary' as const },
    { key: 'activos', label: 'Activos', icon: Pulse, color: 'success' as const },
    { key: 'conEstablecimientos', label: 'Con establecimientos', icon: Building, color: 'warning' as const },
    { key: 'inactivos', label: 'Inactivos', icon: Shield, color: 'danger' as const },
  ],
  establecimientos: [
    { key: 'centrosSalud', label: 'Centros de Salud', icon: Building, color: 'primary' as const },
    { key: 'puestosSalud', label: 'Puestos de Salud', icon: MapPin, color: 'secondary' as const },
    { key: 'hospitales', label: 'Hospitales', icon: Pulse, color: 'warning' as const },
    { key: 'activos', label: 'Activos', icon: Shield, color: 'success' as const },
  ],
} as const;

export const TIPO_ESTABLECIMIENTO_CONFIG = {
  centro_salud: {
    label: 'Centro de Salud',
    tone: 'primary' as const,
    iconWrapper: 'bg-teal-100 text-teal-700',
    badgeClassName: 'inline-flex items-center rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-700',
  },
  puesto_salud: {
    label: 'Puesto de Salud',
    tone: 'secondary' as const,
    iconWrapper: 'bg-cyan-100 text-cyan-800',
    badgeClassName: 'inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-800',
  },
  hospital: {
    label: 'Hospital',
    tone: 'warning' as const,
    iconWrapper: 'bg-amber-100 text-amber-800',
    badgeClassName: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700',
  },
} as const;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof SECTIONS_CONFIG[number]['id'];
export type SectionConfig = typeof SECTIONS_CONFIG[number];
 