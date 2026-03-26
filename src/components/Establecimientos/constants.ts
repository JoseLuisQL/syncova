import { Pulse, Building, Buildings, GitBranch, MapPin, TreeStructure, Shield, ShareNetwork } from '@phosphor-icons/react';

export const COLORS = {
  primary: {
    gradient: 'from-zinc-900 to-zinc-900',
    surface: 'bg-zinc-100',
    surfaceSoft: 'bg-zinc-100/60',
    border: 'border-zinc-200',
    text: 'text-zinc-900',
    textStrong: 'text-teal-900',
    icon: 'text-zinc-900',
  },
  secondary: {
    gradient: 'from-zinc-900 to-sky-600',
    surface: 'bg-zinc-100',
    surfaceSoft: 'bg-zinc-100/70',
    border: 'border-cyan-200',
    text: 'text-zinc-900',
    textStrong: 'text-cyan-900',
    icon: 'text-zinc-900',
  },
  success: {
    gradient: 'from-emerald-500 to-zinc-800',
    surface: 'bg-emerald-50',
    surfaceSoft: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-900',
    icon: 'text-emerald-600',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    surface: 'bg-amber-50',
    surfaceSoft: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textStrong: 'text-amber-900',
    icon: 'text-amber-600',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    surface: 'bg-rose-50',
    surfaceSoft: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-700',
    textStrong: 'text-rose-900',
    icon: 'text-rose-600',
  },
  neutral: {
    gradient: 'from-zinc-500 to-zinc-600',
    surface: 'bg-zinc-50',
    surfaceSoft: 'bg-zinc-50/80',
    border: 'border-zinc-200',
    text: 'text-zinc-700',
    textStrong: 'text-zinc-900',
    icon: 'text-zinc-500',
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
  pageBackground: 'min-h-screen bg-[linear-gradient(180deg,#f8fcfc_0%,#f3fbfb_48%,#eff7f7_100%)]',
  surface: 'rounded-[26px] border border-zinc-200/90 bg-white shadow-[0_14px_34px_-28px_rgba(15,23,42,0.24)]',
  panel: 'rounded-[22px] border border-zinc-200/90 bg-white shadow-[0_8px_20px_-18px_rgba(15,23,42,0.2)]',
  mutedPanel: 'rounded-[20px] border border-zinc-200 bg-zinc-50/80',

  header: {
    title: 'text-[1.45rem] font-semibold tracking-tight text-zinc-950 sm:text-[1.55rem]',
    subtitle: 'text-[0.92rem] text-zinc-600',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-zinc-900 to-zinc-900 text-white shadow-md shadow-zinc-800/10',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-zinc-900 hover:to-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-100 focus:ring-zinc-800',
    iconDelete: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border border-cyan-200 bg-zinc-100 text-zinc-900 hover:bg-cyan-100 focus:ring-zinc-800',
    iconNavigate: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 focus:ring-amber-500',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800/18',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-800',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  table: {
    container: 'overflow-hidden rounded-none border border-zinc-200/90 bg-white shadow-sm',
    header: 'bg-zinc-50/95',
    headerCell: 'px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-zinc-500',
    row: 'transition hover:bg-zinc-100/50',
    cell: 'px-4 py-3.5 align-top',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
    inactive: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600',
    count: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900',
    warning: 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700',
    neutral: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-[1px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    panel:
      'w-full rounded-t-[30px] bg-white shadow-2xl ring-1 ring-zinc-200/80 sm:max-h-[90vh] sm:rounded-[28px]',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-zinc-100 bg-white px-5 py-4 sm:px-6',
  },

  stats: {
    card:
      'min-h-[84px] rounded-[18px] border px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm',
    value: 'mt-1.5 text-[1.4rem] font-semibold leading-none tracking-tight',
    label: 'text-[0.8rem] font-medium',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm',
  },

  filter: {
    container: 'rounded-[20px] border border-zinc-200 bg-white p-3 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.14)] sm:p-3.5',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800/18',
  },

  pagination: {
    container: 'border-t border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-5',
    info: 'text-sm text-zinc-600',
    button:
      'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-zinc-200 bg-zinc-100 text-zinc-900',
    buttonInactive: 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
  },

  nav: {
    shell: 'rounded-[28px] border border-zinc-200/90 bg-white shadow-sm',
    tab:
      'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-800/20',
    tabActive: 'bg-zinc-100 text-zinc-900 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.45)]',
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
    iconWrapper: 'bg-zinc-100 text-zinc-900',
    badgeClassName: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900',
  },
  puesto_salud: {
    label: 'Puesto de Salud',
    tone: 'secondary' as const,
    iconWrapper: 'bg-cyan-100 text-cyan-800',
    badgeClassName: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900',
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
 