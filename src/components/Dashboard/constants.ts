import { Package, Buildings, TrendUp, Warning } from '@phosphor-icons/react';

export const DASHBOARD_COLORS = {
  primary: {
    gradient: 'from-zinc-900 to-zinc-800',
    bg: 'bg-zinc-100',
    text: 'text-zinc-900',
    icon: 'text-zinc-800',
    border: 'border-zinc-200',
    hover: 'hover:bg-zinc-200',
  },
  secondary: {
    gradient: 'from-zinc-500 to-zinc-600',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    icon: 'text-zinc-600',
    border: 'border-zinc-200',
  },
  success: {
    gradient: 'from-emerald-900 to-emerald-800',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    icon: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  warning: {
    gradient: 'from-amber-600 to-amber-700',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    icon: 'text-amber-800',
    border: 'border-amber-200',
  },
  danger: {
    gradient: 'from-rose-600 to-rose-700',
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    icon: 'text-rose-800',
    border: 'border-rose-200',
  },
  info: {
    gradient: 'from-blue-600 to-blue-700',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    icon: 'text-blue-800',
    border: 'border-blue-200',
  },
} as const;

export const CHART_COLORS = {
  primary: '#09090b',     // zinc-950
  secondary: '#27272a',   // zinc-800
  tertiary: '#52525b',    // zinc-600
  quaternary: '#a1a1aa',  // zinc-400
  success: '#059669',     // emerald-600
  info: '#2563eb',        // blue-600
  warning: '#d97706',     // amber-600
  danger: '#e11d48',      // rose-600
  muted: '#d4d4d8',       // zinc-300
} as const;

export const CHART_GRADIENT_COLORS = [
  { main: '#09090b', light: 'rgba(9, 9, 11, 0.15)' },
  { main: '#27272a', light: 'rgba(39, 39, 42, 0.15)' },
  { main: '#059669', light: 'rgba(5, 150, 105, 0.15)' },
  { main: '#2563eb', light: 'rgba(37, 99, 235, 0.15)' },
  { main: '#52525b', light: 'rgba(82, 82, 91, 0.15)' },
] as const;

export const STAT_CARDS_CONFIG = [
  {
    key: 'totalVacunas',
    label: 'Biológicos Activos',
    icon: Package,
    colorScheme: 'primary' as const,
    description: 'Total de vacunas en red',
  },
  {
    key: 'totalEstablecimientos',
    label: 'Red Logística',
    icon: Buildings,
    colorScheme: 'success' as const,
    description: 'Establecimientos enlazados',
  },
  {
    key: 'entregasMes',
    label: 'Flujo Distribución',
    icon: TrendUp,
    colorScheme: 'secondary' as const,
    description: 'Entregas procesadas',
  },
  {
    key: 'alertasPendientes',
    label: 'Alertas Sistema',
    icon: Warning,
    colorScheme: 'warning' as const,
    description: 'Eventos anómalos',
  },
] as const;

export const QUICK_ACTIONS = [
  {
    path: '/vales',
    label: 'Nueva Orden',
    description: 'Emitir vale logístico',
    colorScheme: 'primary' as const,
  },
  {
    path: '/movimientos',
    label: 'Auditoría',
    description: 'Movimientos de inventario',
    colorScheme: 'success' as const,
  },
  {
    path: '/inventario',
    label: 'Existencias',
    description: 'Control de stocks',
    colorScheme: 'secondary' as const,
  },
  {
    path: '/alertas',
    label: 'Incidencias',
    description: 'Alertas activas y pasadas',
    colorScheme: 'warning' as const,
  },
] as const;

export const ALERT_LEVEL_CONFIG = {
  critico: { bg: 'bg-rose-900 text-white', border: 'border-rose-950', text: 'text-rose-100', badge: 'bg-rose-100/10 text-rose-800 border border-rose-200' },
  alto: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-500/10 border border-amber-500/20 text-amber-700' },
  medio: { bg: 'bg-zinc-100', border: 'border-zinc-200', text: 'text-zinc-900', badge: 'bg-zinc-200/50 border border-zinc-300 text-zinc-800' },
  bajo: { bg: 'bg-zinc-50', border: 'border-zinc-100', text: 'text-zinc-500', badge: 'bg-zinc-100 border border-zinc-200 text-zinc-600' },
} as const;

export const ACTIVITY_TYPE_CONFIG = {
  vale_generado: { bg: 'bg-zinc-100', border: 'border-zinc-200', icon: 'text-zinc-900', label: 'Vale Logístico' },
  lote_recibido: { bg: 'bg-zinc-100', border: 'border-zinc-200', icon: 'text-zinc-900', label: 'Recepción' },
  movimiento_registrado: { bg: 'bg-zinc-100', border: 'border-zinc-200', icon: 'text-zinc-900', label: 'Auditoría' },
  usuario_conectado: { bg: 'bg-zinc-50', border: 'border-zinc-100', icon: 'text-zinc-500', label: 'Acceso' },
} as const;

export const CENTER_STATUS_CONFIG = {
  activo: { bg: 'bg-zinc-100', text: 'text-zinc-900', badge: 'bg-zinc-200/50 border border-zinc-300 text-zinc-800', icon: 'text-emerald-700' },
  alerta: { bg: 'bg-amber-100', text: 'text-amber-900', badge: 'bg-amber-500/10 border border-amber-500/20 text-amber-700', icon: 'text-amber-700' },
  critico: { bg: 'bg-rose-100', text: 'text-rose-900', badge: 'bg-rose-500/10 border border-rose-500/20 text-rose-800', icon: 'text-rose-700' },
} as const;
