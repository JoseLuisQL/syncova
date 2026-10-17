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
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-1.5 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 active:translate-y-[0.5px] disabled:cursor-not-allowed disabled:opacity-55',
    secondary:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.005em] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-150 hover:border-line-strong hover:bg-surface-soft focus:outline-none focus:ring-3 focus:ring-line-focus/80 disabled:cursor-not-allowed disabled:opacity-55',
    success:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-1.5 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55',
    warning:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-4 py-1.5 text-[0.8125rem] font-semibold tracking-[-0.005em] text-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all duration-150 hover:border-brand-600 hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-55',
    danger:
      'inline-flex min-h-9.5 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-[0.8125rem] font-semibold text-white shadow-xs transition hover:bg-rose-700 focus:outline-none focus:ring-3 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:opacity-55',
    ghost:
      'inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3 py-1.5 text-[0.8125rem] font-medium tracking-[-0.005em] text-muted-2 transition-colors duration-150 hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-line-focus/70 disabled:cursor-not-allowed disabled:opacity-55',
    icon:
      'inline-flex h-8.5 w-8.5 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-line bg-surface-soft text-muted-2 hover:bg-surface hover:text-ink',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-line bg-surface-soft text-muted-2 hover:bg-surface hover:text-ink',
    iconNavigate: 'border-line bg-surface-soft text-muted-2 hover:bg-surface hover:text-ink',
  },

  input: {
    base:
      'min-h-9.5 w-full rounded-xl border bg-surface px-3.5 py-2 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 placeholder:text-muted/80 focus:outline-none focus:ring-3 focus:ring-brand/12',
    normal: 'border-line hover:border-line-strong focus:border-brand',
    error: 'border-rose-300 bg-rose-50/25 focus:border-rose-500 focus:ring-rose-500/15',
    pending: 'border-line-strong bg-surface-soft focus:border-brand focus:ring-brand/20',
    label: 'mb-1.5 block text-[0.78rem] font-medium tracking-[-0.005em] text-ink',
    errorText: 'mt-1.5 text-[0.73rem] font-medium text-rose-600',
    helpText: 'mt-1.5 text-[0.73rem] text-muted-2',
  },

  select: {
    base:
      'min-h-9.5 w-full appearance-none rounded-xl border border-line bg-surface px-3.5 py-2 pr-9 text-[0.84rem] leading-5 text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 hover:border-line-strong focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/12 disabled:cursor-not-allowed disabled:opacity-60',
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
    active: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink',
    warning: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink',
    neutral: 'inline-flex items-center rounded-md border border-line bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink',
  },

  modal: {
    overlay: 'fixed inset-0 z-[300] bg-slate-950/45 backdrop-blur-[3px] dark:bg-black/70',
    container: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6',
    containerLarge: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2.5 sm:items-center sm:p-6',
    containerFullscreen: 'pointer-events-auto mx-auto flex h-full w-full items-end justify-center p-2 sm:items-center sm:p-4',
    panel:
      'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-[0_24px_64px_-16px_rgba(15,23,42,0.22)] sm:max-h-[88vh] sm:rounded-2xl',
    header: 'shrink-0 border-b border-line-soft px-5 py-4 sm:px-6',
    body: 'flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6',
    footer: 'shrink-0 border-t border-line-soft bg-surface-soft/75 px-5 py-3.5 sm:px-6',
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
      'h-9.5 w-full rounded-xl border border-line bg-surface py-2 pl-10 pr-4 text-[0.84rem] text-ink shadow-[0_1px_2px_rgba(16,24,40,0.02)] transition-all duration-150 placeholder:text-muted/80 hover:border-line-strong focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/12',
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
