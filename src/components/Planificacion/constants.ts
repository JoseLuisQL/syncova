import {
  CheckCircle,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';
import { DESIGN_COLOR_SCALES, DESIGN_GRADIENTS, DESIGN_TOKENS } from '../../styles/designTokens';

export const COLORS = {
  primary: {
    gradient: DESIGN_COLOR_SCALES.primary.gradient,
    gradientHover: 'from-teal-700 to-cyan-700',
    bg: DESIGN_COLOR_SCALES.primary.surface,
    bgSoft: DESIGN_COLOR_SCALES.primary.surfaceSoft,
    text: DESIGN_COLOR_SCALES.primary.text,
    textDark: DESIGN_COLOR_SCALES.primary.textStrong,
    border: DESIGN_COLOR_SCALES.primary.border,
    icon: DESIGN_COLOR_SCALES.primary.icon,
    badge: 'bg-teal-100 text-teal-800',
    focus: 'focus:ring-teal-500/20 focus:border-teal-500',
  },
  secondary: {
    gradient: DESIGN_GRADIENTS.secondary,
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
    gradient: DESIGN_GRADIENTS.success,
    gradientHover: 'from-teal-700 to-cyan-700',
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
    gradient: DESIGN_GRADIENTS.warning,
    gradientHover: 'from-zinc-800 to-zinc-900',
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/75',
    text: 'text-zinc-700',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-600',
    badge: DESIGN_TOKENS.semantic.warning.badge,
    focus: 'focus:ring-zinc-500/20 focus:border-zinc-500',
  },
  danger: {
    gradient: DESIGN_GRADIENTS.danger,
    gradientHover: 'from-rose-600 to-rose-700',
    bg: 'bg-rose-50',
    bgSoft: 'bg-rose-50/75',
    text: 'text-rose-700',
    textDark: 'text-rose-900',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    badge: DESIGN_TOKENS.semantic.danger.badge,
    focus: 'focus:ring-rose-500/20 focus:border-rose-500',
  },
  neutral: {
    gradient: DESIGN_GRADIENTS.secondary,
    bg: 'bg-zinc-50',
    bgSoft: 'bg-zinc-50/80',
    text: 'text-zinc-600',
    textDark: 'text-zinc-900',
    border: 'border-zinc-200',
    icon: 'text-zinc-500',
    badge: 'bg-zinc-100 text-zinc-700',
    focus: 'focus:ring-zinc-400/20 focus:border-zinc-400',
  },
} as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-white',
  shell: 'rounded-xl border border-line bg-white shadow-none',
  surface: 'rounded-none border-0 bg-transparent shadow-none',
  panel: 'rounded-xl border border-line bg-white shadow-none',
  mutedPanel: 'rounded-[12px] border border-line bg-surface-soft',
  card: 'rounded-xl border border-line bg-white shadow-none',
  cardHover: 'transition hover:border-zinc-300 hover:shadow-sm',

  header: {
    container: 'sticky top-0 z-20 backdrop-blur-md bg-white/80',
    title: 'text-[1.42rem] font-semibold tracking-tight text-zinc-900 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-zinc-500',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-3xl bg-teal-600 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-ink shadow-sm transition hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    warning:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    danger:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-[9px] border border-line bg-white px-3 py-1.5 text-sm font-semibold text-muted-2 transition hover:border-line-strong hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconNavigate: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base:
      'min-h-9 w-full rounded-[7px] border bg-white px-3 py-2 text-base text-ink shadow-none transition placeholder:text-[#a0a4ae] focus:outline-none focus:ring-2 focus:ring-line-focus/70',
    normal: 'border-line hover:border-line-strong focus:border-line-focus-strong',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    pending: 'border-zinc-300 bg-zinc-50 focus:border-zinc-400 focus:ring-zinc-500/20',
    label: 'mb-1.5 block text-sm font-medium text-[#424750]',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'min-h-9 w-full appearance-none rounded-[7px] border border-line bg-white px-3 py-2 pr-8 text-base font-medium text-ink shadow-none transition hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70 disabled:cursor-not-allowed disabled:opacity-60',
    teal: '',
    cyan: '',
    emerald: '',
  },

  table: {
    container: 'overflow-visible rounded-none border-0 bg-transparent shadow-none',
    header: 'bg-transparent',
    headerCell: 'bg-surface-soft px-4 py-3 text-left text-sm font-medium tracking-[-0.01em] text-muted',
    row: 'transition-colors hover:bg-surface-soft',
    cell: 'border-b border-line-soft px-4 py-3.5 align-middle text-sm text-ink',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
    neutral: 'inline-flex items-center rounded-md border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-ink-soft/20 backdrop-blur-[2px]',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-3 sm:items-center sm:p-6',
    containerFullscreen: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2 sm:items-center sm:p-4',
    panel:
      'w-full overflow-hidden rounded-t-[10px] border border-line bg-white shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)] sm:max-h-[88vh] sm:rounded-lg',
    header: 'border-b border-line-soft px-4 py-3.5 sm:px-5',
    body: 'max-h-[calc(100vh-150px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(88vh-136px)] sm:px-5',
    footer: 'border-t border-line-soft bg-surface-soft px-4 py-3 sm:px-5',
  },

  stats: {
    card:
      'min-h-[88px] rounded-2xl border border-zinc-200 px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm bg-white',
    value: 'mt-1.5 text-[1.36rem] font-semibold leading-none tracking-tight text-zinc-900',
    label: 'text-[0.78rem] font-medium uppercase tracking-[0.08em] text-zinc-500',
    sublabel: 'mt-1 text-[0.72rem] text-zinc-400',
    iconWrapper: 'flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 shadow-sm',
  },

  filter: {
    container: 'bg-transparent p-0',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-lg border border-line bg-white py-2 pl-10 pr-4 text-sm text-ink shadow-sm transition placeholder:text-muted hover:border-line-strong focus:border-line-focus-strong focus:outline-none focus:ring-2 focus:ring-line-focus/70',
  },

  pagination: {
    container: 'border-t border-line-soft bg-white px-4 py-4 sm:px-5',
    info: 'text-sm font-medium text-muted-3',
    button:
      'min-h-9 min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'border-line bg-white text-ink shadow-sm',
    buttonInactive: 'border-transparent bg-transparent text-muted-2 hover:bg-surface-soft hover:text-ink',
  },

  section: {
    container: 'rounded-3xl border border-line bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
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
    normal: 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 focus:border-teal-600 focus:bg-white focus:ring-0',
    focus: 'focus:ring-0 focus:border-teal-600',
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
