import {
  CheckCircle,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';

export const COLORS = {
  primary: {
    gradient: 'from-zinc-800 to-zinc-900',
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    text: 'text-zinc-800',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-700',
    badge: 'bg-zinc-100 text-zinc-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  secondary: {
    gradient: 'from-zinc-700 to-zinc-800',
    gradientHover: 'from-zinc-800 to-zinc-900',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-600',
    badge: 'bg-zinc-100 text-zinc-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  success: {
    gradient: 'from-zinc-800 to-zinc-900',
    gradientHover: 'from-zinc-900 to-black',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    text: 'text-zinc-800',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-700',
    badge: 'bg-zinc-100 text-zinc-800',
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  warning: {
    gradient: 'from-zinc-700 to-zinc-800',
    gradientHover: 'from-zinc-800 to-zinc-900',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-600',
    badge: 'bg-amber-50 text-amber-800', // Warning badge still uses amber for immediate recognition
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  danger: {
    gradient: 'from-rose-500 to-rose-600',
    gradientHover: 'from-rose-600 to-rose-700',
    bg: 'bg-rose-50',
    bgSoft: 'bg-rose-50/75',
    text: 'text-rose-700',
    textDark: 'text-rose-900',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-800',
    focus: 'focus:ring-rose-500/20 focus:border-rose-500',
  },
  neutral: {
    gradient: 'from-slate-500 to-slate-600',
    gradientHover: 'from-slate-600 to-slate-700',
    bg: 'bg-slate-50',
    bgSoft: 'bg-slate-50/80',
    text: 'text-slate-600',
    textDark: 'text-slate-900',
    border: 'border-slate-200',
    icon: 'text-slate-500',
    badge: 'bg-slate-100 text-slate-700',
    focus: 'focus:ring-slate-400/20 focus:border-slate-400',
  },
} as const;

export const COMPONENT_STYLES = {
  // Page background and surfaces using pure Zinc mode for data-dense tables
  pageBackground: 'min-h-screen bg-zinc-50/30',
  shell: 'rounded-[16px] border border-zinc-200/80 bg-white shadow-sm',
  surface: 'rounded-[16px] border border-zinc-200/80 bg-white shadow-sm',
  panel: 'rounded-[16px] border border-zinc-200/80 bg-white shadow-sm',
  mutedPanel: 'rounded-[16px] border border-zinc-200 bg-zinc-50',
  card: 'rounded-[16px] border border-zinc-200/90 bg-white shadow-sm',
  cardHover: 'transition hover:border-zinc-300 hover:shadow-sm',

  header: {
    container: 'sticky top-0 z-20 backdrop-blur-md bg-white/80',
    title: 'text-[1.42rem] font-semibold tracking-tight text-zinc-900 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-zinc-500',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-zinc-900 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    warning:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    danger:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconNavigate: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    pending: 'border-zinc-300 bg-zinc-50 focus:border-zinc-400 focus:ring-zinc-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2',
    teal: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
    cyan: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
    emerald: 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10',
  },

  table: {
    container: 'overflow-hidden rounded-none border border-zinc-200/90 bg-white shadow-sm',
    header: 'bg-zinc-50',
    headerCell: 'px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zinc-500 border-b border-zinc-200',
    row: 'transition-colors duration-150 border-b border-zinc-100 hover:bg-zinc-50/50',
    cell: 'px-4 py-3.5 align-top text-sm text-zinc-700',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white',
    inactive: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600',
    count: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
    warning: 'inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700',
    danger: 'inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700',
    info: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
    neutral: 'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
  },

  modal: {
    overlay: 'fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerFullscreen: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2 sm:items-center sm:p-4',
    panel:
      'w-full rounded-[24px] bg-white shadow-2xl ring-1 ring-zinc-200/50 sm:max-h-[90vh]',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'max-h-[calc(100vh-170px)] overflow-y-auto px-5 py-5 sm:max-h-[calc(90vh-156px)] sm:px-6',
    footer: 'border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:px-6',
  },

  stats: {
    card:
      'min-h-[88px] rounded-[16px] border border-zinc-200 px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm bg-white',
    value: 'mt-1.5 text-[1.36rem] font-semibold leading-none tracking-tight text-zinc-900',
    label: 'text-[0.78rem] font-medium uppercase tracking-[0.08em] text-zinc-500',
    sublabel: 'mt-1 text-[0.72rem] text-zinc-400',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 shadow-sm',
  },

  filter: {
    container: 'rounded-[16px] border border-zinc-200 bg-white p-3 shadow-sm sm:p-3.5',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10',
  },

  pagination: {
    container: 'border-t border-zinc-100 bg-white px-4 py-3 sm:px-5',
    info: 'text-sm text-zinc-600',
    button:
      'rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
    buttonActive: 'border-zinc-900 bg-zinc-900 text-white shadow-sm',
    buttonInactive: 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
  },

  section: {
    container: 'rounded-[16px] border border-zinc-200/90 bg-white shadow-sm',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    headerTitle: 'text-base font-semibold text-zinc-900',
    headerSubtitle: 'mt-1 text-sm text-zinc-500',
    body: 'px-5 py-5 sm:px-6',
  },
} as const;

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'] as const;

const currentYear = new Date().getFullYear();
export const ANIOS_DISPONIBLES = [currentYear - 1, currentYear, currentYear + 1] as const;

export const INPUT_FIELD_STYLES = {
  programacion: {
    normal: 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 focus:border-zinc-900 focus:bg-white focus:ring-0',
    focus: 'focus:ring-0 focus:border-zinc-900',
    pending: 'border-zinc-300 bg-zinc-50 text-zinc-900 shadow-inner ring-1 ring-zinc-500/10',
  },
} as const;

export const ESTADOS_CONFIG = {
  programado: {
    bg: 'bg-zinc-100',
    text: 'text-zinc-800',
    border: 'border-zinc-200',
    icon: CheckCircle,
  },
  pendiente: {
    bg: 'bg-zinc-50',
    text: 'text-zinc-500',
    border: 'border-zinc-200',
    icon: WarningCircle,
  },
  error: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: Warning,
  },
} as const;

export type ColorScheme = keyof typeof COLORS;
