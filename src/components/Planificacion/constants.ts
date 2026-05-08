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
  // Page background and surfaces using pure Zinc mode for data-dense tables
  pageBackground: 'min-h-screen bg-[#f0eff4]',
  shell: 'rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
  surface: 'rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
  panel: 'rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
  mutedPanel: 'rounded-[14px] border border-[#e7e7ef] bg-[#fbfafd]',
  card: 'rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
  cardHover: 'transition hover:border-zinc-300 hover:shadow-sm',

  header: {
    container: 'sticky top-0 z-20 backdrop-blur-md bg-white/80',
    title: 'text-[1.42rem] font-semibold tracking-tight text-zinc-900 sm:text-[1.54rem]',
    subtitle: 'text-[0.92rem] text-zinc-500',
    iconWrapper:
      'flex h-12 w-12 items-center justify-center rounded-[18px] bg-teal-600 text-white shadow-sm',
  },

  button: {
    primary:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#e7e7ef] bg-white px-4 py-2 text-sm font-semibold text-[#15171d] shadow-sm transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    success:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    warning:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-16px_rgba(124,58,237,0.75)] transition hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/25 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    danger:
      'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    ghost:
      'inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border border-[#e7e7ef] bg-white px-3 py-2 text-sm font-semibold text-[#606571] transition hover:border-[#d7d8e2] hover:bg-[#fbfafd] hover:text-[#15171d] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    icon:
      'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
    iconEdit: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconDelete: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
    iconNavigate: 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-900',
  },

  input: {
    base:
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-600/10',
    normal: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600',
    error: 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20',
    pending: 'border-zinc-300 bg-zinc-50 focus:border-zinc-400 focus:ring-zinc-500/20',
    label: 'mb-1 block text-[0.84rem] font-medium text-zinc-700',
    errorText: 'mt-1 text-xs text-rose-600',
    helpText: 'mt-1 text-xs text-zinc-500',
  },

  select: {
    base:
      'w-full appearance-none rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:outline-none focus:ring-2',
    teal: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600 focus:ring-teal-600/10',
    cyan: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600 focus:ring-teal-600/10',
    emerald: 'border-zinc-200 hover:border-zinc-300 focus:border-teal-600 focus:ring-teal-600/10',
  },

  table: {
    container: 'overflow-hidden rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
    header: 'bg-[#fbfafd] border-y border-[#e7e7ef]',
    headerCell: 'px-3 py-3 text-left text-[0.78rem] font-medium tracking-[-0.01em] text-[#8b8f9b]',
    row: 'transition-colors duration-150 border-b border-[#eeeef3] hover:bg-[#fbfafd]',
    cell: 'px-3 py-3 align-middle text-sm text-[#15171d]',
    emptyIcon: 'mx-auto mb-4 h-11 w-11 text-zinc-300',
  },

  badge: {
    active: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    inactive: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    count: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    warning: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    danger: 'inline-flex items-center gap-1.5 rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    info: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    neutral: 'inline-flex items-center rounded-[8px] border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
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
    container: 'rounded-[18px] border border-[#e7e7ef] bg-white p-3 shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)] sm:p-4',
    header: 'border-b border-zinc-100 px-5 py-4 sm:px-6',
    body: 'px-5 py-4 sm:px-6',
    searchIcon: 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400',
    searchInput:
      'w-full rounded-[10px] border border-[#e7e7ef] bg-white py-2 pl-10 pr-4 text-sm text-[#15171d] shadow-sm transition placeholder:text-[#8b8f9b] hover:border-[#d7d8e2] focus:border-[#babdca] focus:outline-none focus:ring-2 focus:ring-[#dedfea]/70',
  },

  pagination: {
    container: 'border-t border-[#eeeef3] bg-white px-4 py-4 sm:px-5',
    info: 'text-sm font-medium text-[#747986]',
    button:
      'min-h-9 min-w-9 rounded-[10px] border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40',
    buttonActive: 'border-[#e7e7ef] bg-white text-[#15171d] shadow-sm',
    buttonInactive: 'border-transparent bg-transparent text-[#606571] hover:bg-[#fbfafd] hover:text-[#15171d]',
  },

  section: {
    container: 'rounded-[18px] border border-[#e7e7ef] bg-white shadow-[0_18px_50px_-42px_rgba(12,15,24,0.45)]',
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
