import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Package,
  Activity,
  Settings,
  BarChart3,
} from 'lucide-react';

export const COLORS = {
  primary: {
    gradient: 'from-teal-600 to-cyan-600',
    gradientHover: 'from-teal-700 to-cyan-700',
    bg: 'bg-teal-50',
    bgHover: 'hover:bg-teal-100',
    text: 'text-teal-700',
    textDark: 'text-teal-800',
    border: 'border-teal-200',
    icon: 'text-teal-600',
    ring: 'ring-teal-500',
    focus: 'focus:ring-teal-500 focus:border-teal-500',
  },
  secondary: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    textDark: 'text-cyan-800',
    border: 'border-cyan-200',
    icon: 'text-cyan-600',
  },
  success: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    bgGradient: 'from-emerald-50 to-emerald-100',
    text: 'text-emerald-700',
    textDark: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    bgGradient: 'from-amber-50 to-amber-100',
    text: 'text-amber-700',
    textDark: 'text-amber-800',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-50',
    bgGradient: 'from-rose-50 to-rose-100',
    text: 'text-rose-700',
    textDark: 'text-rose-800',
    border: 'border-rose-200',
    icon: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-800',
  },
  neutral: {
    bg: 'bg-gray-50',
    bgGradient: 'from-gray-50 to-gray-100',
    text: 'text-gray-700',
    textDark: 'text-gray-800',
    textLight: 'text-gray-500',
    border: 'border-gray-200',
    icon: 'text-gray-600',
  },
} as const;

export const ALERTS_SECTIONS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Activity,
    path: '/alertas/dashboard',
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: Bell,
    path: '/alertas/alertas',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    path: '/alertas/reportes',
  },
  {
    id: 'configuracion',
    label: 'Configuracion',
    icon: Settings,
    path: '/alertas/configuracion',
  },
] as const;

export const TIPOS_ALERTA = [
  { id: 'vencimiento', label: 'Vencimientos', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'stock_bajo', label: 'Stock Bajo', icon: Package, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'discrepancia', label: 'Discrepancias', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'sistema', label: 'Sistema', icon: Info, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
] as const;

export const NIVELES_ALERTA = [
  { id: 'error', label: 'Criticas', icon: AlertOctagon, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'warning', label: 'Advertencias', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'info', label: 'Informativas', icon: Info, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'success', label: 'Exitosas', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
] as const;

export const COMPONENT_STYLES = {
  pageBackground: 'min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/30 to-blue-50/30',

  card: 'bg-white rounded-2xl border border-gray-100 shadow-sm',
  cardHover: 'hover:shadow-md transition-all duration-200',

  header: {
    container: 'bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-20',
    title: 'text-xl sm:text-2xl font-bold text-gray-900',
    subtitle: 'text-sm text-gray-600 hidden sm:block',
    iconWrapper: 'p-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg',
  },

  button: {
    primary: `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white 
              bg-gradient-to-r from-teal-600 to-cyan-600 
              hover:from-teal-700 hover:to-cyan-700 
              shadow-md hover:shadow-lg 
              transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                text-gray-700 bg-white border border-gray-200 
                hover:bg-gray-50 hover:border-gray-300
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`,
    icon: `p-2 rounded-lg transition-all duration-200 
           focus:outline-none focus:ring-2 focus:ring-offset-1`,
    iconEdit: 'text-teal-600 bg-teal-50 hover:bg-teal-100 focus:ring-teal-500',
    iconDelete: 'text-rose-600 bg-rose-50 hover:bg-rose-100 focus:ring-rose-500',
    iconView: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 focus:ring-cyan-500',
  },

  input: {
    base: `w-full px-4 py-2.5 rounded-xl border text-sm
           transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-0`,
    normal: 'border-gray-200 focus:ring-teal-500 focus:border-teal-500 hover:border-gray-300',
    error: 'border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30',
    label: 'block text-sm font-medium text-gray-700 mb-1.5',
    errorText: 'mt-1 text-xs text-rose-600',
  },

  nav: {
    tab: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 cursor-pointer`,
    tabActive: 'bg-teal-50 text-teal-700 border border-teal-200',
    tabInactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  },

  modal: {
    overlay: 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4',
    container: 'bg-white rounded-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl',
    header: 'px-6 py-5 border-b border-gray-100',
    body: 'px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)]',
    footer: 'px-6 py-4 border-t border-gray-100 flex justify-end gap-3',
  },

  stats: {
    card: 'rounded-2xl p-5 border transition-all duration-200 hover:shadow-md',
    value: 'text-2xl font-bold',
    label: 'text-sm font-medium',
    iconWrapper: 'p-2.5 rounded-xl',
  },

  badge: {
    active: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700',
    inactive: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600',
    count: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-700',
    warning: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700',
    danger: 'inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-rose-100 text-rose-700',
  },

  pagination: {
    container: 'bg-gray-50/50 px-5 py-4 border-t border-gray-100',
    info: 'text-sm text-gray-600',
    button: 'px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    buttonActive: 'bg-teal-50 border-teal-500 text-teal-700',
    buttonInactive: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
  },
} as const;

export const ITEMS_PER_PAGE = 10;

export type ColorScheme = keyof typeof COLORS;
export type SectionId = typeof ALERTS_SECTIONS[number]['id'];
export type TipoAlertaId = typeof TIPOS_ALERTA[number]['id'];
export type NivelAlertaId = typeof NIVELES_ALERTA[number]['id'];
