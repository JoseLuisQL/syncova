import {
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Settings,
  Activity,
} from 'lucide-react';

// Paleta de colores moderna y profesional (teal/cyan)
export const COLORS = {
  primary: {
    gradient: 'from-teal-600 to-cyan-600',
    gradientLight: 'from-teal-50 to-cyan-50',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    ring: 'ring-teal-500/20',
  },
  success: {
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  info: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
} as const;

// Estilos de componentes - ISO 25010 optimizados
export const COMPONENT_STYLES = {
  // Fondo de página con gradiente suave
  pageBackground: 'min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/30',

  // Contenedores principales
  card: {
    base: 'bg-white rounded-2xl border border-gray-100/80 shadow-sm',
    elevated: 'bg-white rounded-2xl border border-gray-100/80 shadow-lg shadow-gray-200/50',
    interactive: 'bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-teal-200/50 transition-all duration-300',
  },

  // Header principal
  header: {
    wrapper: 'bg-white/90 backdrop-blur-md border-b border-gray-100/80 sticky top-0 z-30',
    container: 'w-full px-4 sm:px-6 lg:px-8 py-4',
    iconBadge: 'p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30',
    title: 'text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent',
    subtitle: 'text-sm text-gray-500 font-medium',
  },

  // Botones - Sistema de diseño consistente
  button: {
    primary: `inline-flex items-center justify-center gap-2 px-5 py-2.5 
              rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-teal-500 to-cyan-500 
              hover:from-teal-600 hover:to-cyan-600 
              shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40
              transform hover:-translate-y-0.5
              transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`,
    secondary: `inline-flex items-center justify-center gap-2 px-5 py-2.5 
                rounded-xl text-sm font-semibold text-gray-700
                bg-white border-2 border-gray-200 
                hover:bg-gray-50 hover:border-gray-300
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed`,
    ghost: `inline-flex items-center justify-center gap-2 px-4 py-2 
            rounded-xl text-sm font-medium text-gray-600
            hover:bg-gray-100 hover:text-gray-900
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-500/20`,
    icon: `p-2.5 rounded-xl transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-2`,
    iconPrimary: 'text-teal-600 bg-teal-50 hover:bg-teal-100 focus:ring-teal-500/30',
    iconSecondary: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:ring-gray-500/20',
  },

  // Inputs y selects - Diseño limpio y accesible
  input: {
    wrapper: 'relative',
    base: `w-full px-4 py-3 rounded-xl text-sm font-medium
           border-2 border-gray-200 bg-white
           transition-all duration-200 ease-out
           placeholder:text-gray-400
           hover:border-gray-300
           focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10`,
    withIcon: 'pl-11',
    iconLeft: 'absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none',
    iconRight: 'absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none',
    label: 'block text-sm font-semibold text-gray-700 mb-2',
    labelWithIcon: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2',
  },

  // Select personalizado
  select: {
    base: `w-full px-4 py-3 rounded-xl text-sm font-medium
           border-2 border-gray-200 bg-white
           transition-all duration-200 ease-out
           cursor-pointer appearance-none
           hover:border-gray-300
           focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10
           disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400`,
  },

  // Tabla moderna
  table: {
    wrapper: 'overflow-hidden',
    container: 'overflow-x-auto',
    base: 'min-w-full',
    header: 'bg-gradient-to-r from-gray-50 to-slate-50',
    headerCell: 'px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider',
    headerCellCenter: 'px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider',
    body: 'divide-y divide-gray-100',
    row: 'hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/30 transition-all duration-200',
    cell: 'px-5 py-4 whitespace-nowrap',
    cellWrap: 'px-5 py-4',
  },

  // Paginación
  pagination: {
    wrapper: 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 px-6 py-4 border-t border-gray-100',
    info: 'text-sm text-gray-600 font-medium',
    button: `px-3 py-2 rounded-lg text-sm font-medium 
             border-2 transition-all duration-200
             disabled:opacity-40 disabled:cursor-not-allowed`,
    buttonActive: 'bg-teal-50 border-teal-400 text-teal-700',
    buttonInactive: 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
    select: 'px-3 py-2 rounded-lg text-sm font-medium border-2 border-gray-200 bg-white cursor-pointer hover:border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10',
  },

  // Badges y etiquetas
  badge: {
    base: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
    ingreso: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    salida: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    transferencia: 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200',
    ajuste: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    neutral: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  },

  // Estadísticas cards
  stats: {
    card: 'rounded-2xl p-5 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
    iconWrapper: 'p-3 rounded-xl shadow-lg',
    value: 'text-2xl sm:text-3xl font-bold tracking-tight',
    label: 'text-sm font-semibold mt-1',
  },

  // Modal
  modal: {
    backdrop: 'fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50',
    wrapper: 'fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto',
    container: 'relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden',
    header: 'px-6 py-5 border-b border-gray-100',
    headerGradient: 'bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5',
    body: 'p-6 overflow-y-auto max-h-[calc(90vh-160px)]',
    footer: 'px-6 py-4 bg-gray-50/80 border-t border-gray-100',
    closeButton: 'p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200',
    closeButtonWhite: 'p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200',
  },

  // Estados vacíos
  empty: {
    wrapper: 'py-16 px-6 text-center',
    icon: 'mx-auto h-16 w-16 text-gray-300',
    title: 'mt-4 text-lg font-semibold text-gray-600',
    description: 'mt-2 text-sm text-gray-400',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin text-teal-600',
    skeleton: 'animate-pulse bg-gray-200 rounded',
    overlay: 'absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10',
  },

  // Filtros
  filter: {
    wrapper: 'bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden',
    header: 'bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100',
    body: 'p-6',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5',
    actions: 'flex items-center justify-center gap-3 pt-6 border-t border-gray-100 mt-6',
  },

  // Secciones del modal
  section: {
    wrapper: 'bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-100',
    header: 'flex items-center gap-3 mb-4',
    iconWrapper: 'p-2.5 rounded-xl',
    title: 'text-base font-bold text-gray-900',
    grid: 'grid grid-cols-2 gap-4',
    row: 'flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100',
    label: 'text-sm text-gray-500 font-medium',
    value: 'text-sm font-semibold text-gray-900',
  },
} as const;

// Configuración de tipos de movimiento
export const TIPOS_MOVIMIENTO = {
  ingreso: {
    label: 'Ingreso',
    icon: ArrowUpCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    bgGradient: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    badge: COMPONENT_STYLES.badge.ingreso,
  },
  salida: {
    label: 'Salida',
    icon: ArrowDownCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    bgGradient: 'from-rose-50 to-rose-100',
    border: 'border-rose-200',
    badge: COMPONENT_STYLES.badge.salida,
  },
  transferencia: {
    label: 'Transferencia',
    icon: ArrowRightLeft,
    color: 'text-cyan-600',
    bg: 'bg-cyan-100',
    bgGradient: 'from-cyan-50 to-cyan-100',
    border: 'border-cyan-200',
    badge: COMPONENT_STYLES.badge.transferencia,
  },
  ajuste: {
    label: 'Ajuste',
    icon: Settings,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    bgGradient: 'from-amber-50 to-amber-100',
    border: 'border-amber-200',
    badge: COMPONENT_STYLES.badge.ajuste,
  },
  default: {
    label: 'Movimiento',
    icon: Activity,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    bgGradient: 'from-gray-50 to-gray-100',
    border: 'border-gray-200',
    badge: COMPONENT_STYLES.badge.neutral,
  },
} as const;

// Configuración de tarjetas de estadísticas
export const STATS_CARDS_CONFIG = [
  {
    key: 'ingresos',
    label: 'Total Ingresos',
    sublabel: 'Unidades ingresadas',
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    border: 'border-emerald-200/80',
    text: 'text-emerald-700',
    textLight: 'text-emerald-600',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-500',
    icon: ArrowUpCircle,
  },
  {
    key: 'salidas',
    label: 'Total Salidas',
    sublabel: 'Unidades despachadas',
    bg: 'bg-gradient-to-br from-rose-50 to-red-50',
    border: 'border-rose-200/80',
    text: 'text-rose-700',
    textLight: 'text-rose-600',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-500',
    icon: ArrowDownCircle,
  },
  {
    key: 'transferencias',
    label: 'Transferencias',
    sublabel: 'Movimientos internos',
    bg: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    border: 'border-cyan-200/80',
    text: 'text-cyan-700',
    textLight: 'text-cyan-600',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    icon: ArrowRightLeft,
  },
  {
    key: 'saldo',
    label: 'Saldo Actual',
    sublabel: 'Stock disponible',
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    border: 'border-teal-200/80',
    text: 'text-teal-700',
    textLight: 'text-teal-600',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    icon: Package,
  },
] as const;

// Items por página - Predeterminado 20 según ISO 25010 (carga cognitiva óptima)
export const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100] as const;
export const DEFAULT_ITEMS_PER_PAGE = 20;

export type TipoMovimiento = keyof typeof TIPOS_MOVIMIENTO;
