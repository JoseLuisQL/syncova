import { Package, Building2, TrendingUp, AlertTriangle } from 'lucide-react';

export const DASHBOARD_COLORS = {
  primary: {
    gradient: 'from-teal-600 to-cyan-600',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    icon: 'text-teal-600',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-100',
  },
  secondary: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    icon: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  success: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  warning: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    border: 'border-amber-200',
  },
  danger: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    border: 'border-rose-200',
  },
  info: {
    gradient: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    icon: 'text-sky-600',
    border: 'border-sky-200',
  },
} as const;

export const CHART_COLORS = {
  primary: '#0D9488',     // teal-600
  secondary: '#0891B2',   // cyan-600
  tertiary: '#0E7490',    // cyan-700
  quaternary: '#0F766E',  // teal-700
  success: '#10B981',     // emerald-500
  info: '#06B6D4',        // cyan-500
  warning: '#F59E0B',     // amber-500
  danger: '#EF4444',      // red-500
  muted: '#94A3B8',       // slate-400
} as const;

export const CHART_GRADIENT_COLORS = [
  { main: '#0D9488', light: 'rgba(13, 148, 136, 0.15)' },   // teal-600
  { main: '#0891B2', light: 'rgba(8, 145, 178, 0.15)' },    // cyan-600
  { main: '#10B981', light: 'rgba(16, 185, 129, 0.15)' },   // emerald-500
  { main: '#0EA5E9', light: 'rgba(14, 165, 233, 0.15)' },   // sky-500
  { main: '#14B8A6', light: 'rgba(20, 184, 166, 0.15)' },   // teal-500
  { main: '#06B6D4', light: 'rgba(6, 182, 212, 0.15)' },    // cyan-500
  { main: '#059669', light: 'rgba(5, 150, 105, 0.15)' },    // emerald-600
  { main: '#0284C7', light: 'rgba(2, 132, 199, 0.15)' },    // sky-600
  { main: '#0F766E', light: 'rgba(15, 118, 110, 0.15)' },   // teal-700
  { main: '#0E7490', light: 'rgba(14, 116, 144, 0.15)' },   // cyan-700
  { main: '#047857', light: 'rgba(4, 120, 87, 0.15)' },     // emerald-700
  { main: '#0369A1', light: 'rgba(3, 105, 161, 0.15)' },    // sky-700
] as const;

export const STAT_CARDS_CONFIG = [
  {
    key: 'totalVacunas',
    label: 'Vacunas Activas',
    icon: Package,
    colorScheme: 'primary' as const,
    description: 'Total de vacunas registradas',
  },
  {
    key: 'totalEstablecimientos',
    label: 'Establecimientos',
    icon: Building2,
    colorScheme: 'success' as const,
    description: 'Establecimientos activos',
  },
  {
    key: 'entregasMes',
    label: 'Entregas del Mes',
    icon: TrendingUp,
    colorScheme: 'secondary' as const,
    description: 'Entregas realizadas este mes',
  },
  {
    key: 'alertasPendientes',
    label: 'Alertas Activas',
    icon: AlertTriangle,
    colorScheme: 'warning' as const,
    description: 'Alertas pendientes de atención',
  },
] as const;

export const QUICK_ACTIONS = [
  {
    path: '/vales',
    label: 'Generar Vale',
    description: 'Crear vale de entrega',
    colorScheme: 'primary' as const,
  },
  {
    path: '/movimientos',
    label: 'Movimientos',
    description: 'Gestionar movimientos',
    colorScheme: 'success' as const,
  },
  {
    path: '/inventario',
    label: 'Inventario',
    description: 'Ver stock actual',
    colorScheme: 'secondary' as const,
  },
  {
    path: '/alertas',
    label: 'Alertas',
    description: 'Ver alertas activas',
    colorScheme: 'warning' as const,
  },
] as const;

export const ALERT_LEVEL_CONFIG = {
  critico: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' },
  alto: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  medio: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-800' },
  bajo: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' },
} as const;

export const ACTIVITY_TYPE_CONFIG = {
  vale_generado: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', label: 'Vale' },
  lote_recibido: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', label: 'Lote' },
  movimiento_registrado: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', label: 'Movimiento' },
  usuario_conectado: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600', label: 'Usuario' },
} as const;

export const CENTER_STATUS_CONFIG = {
  activo: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', icon: 'text-emerald-600' },
  alerta: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', icon: 'text-amber-600' },
  critico: { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800', icon: 'text-rose-600' },
} as const;
