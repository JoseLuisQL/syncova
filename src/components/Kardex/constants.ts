import {
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  Package2,
  Settings2,
} from 'lucide-react';
import {
  COLORS,
  COMPONENT_STYLES as INVENTORY_COMPONENT_STYLES,
  type ColorScheme,
} from '../Inventario/constants';

export const COMPONENT_STYLES = INVENTORY_COMPONENT_STYLES;
export { COLORS };
export type { ColorScheme };

export const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100] as const;
export const KARDEX_FILTER_DEBOUNCE = 300;

export const MOVIMIENTO_OPTIONS = [
  { value: 'todos', label: 'Todos los movimientos' },
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'salida', label: 'Salidas' },
  { value: 'transferencia', label: 'Transferencias' },
  { value: 'ajuste', label: 'Ajustes' },
] as const;

export const TIPO_ITEM_OPTIONS = [
  { value: 'todos', label: 'Todos los productos' },
  { value: 'vacuna', label: 'Vacunas' },
  { value: 'jeringa', label: 'Jeringas' },
] as const;

export const MOVIMIENTO_CONFIG = {
  ingreso: {
    key: 'ingreso',
    label: 'Ingreso',
    tone: 'success' as ColorScheme,
    icon: ArrowUpCircle,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
    chipClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  salida: {
    key: 'salida',
    label: 'Salida',
    tone: 'danger' as ColorScheme,
    icon: ArrowDownCircle,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700',
    chipClassName: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  transferencia: {
    key: 'transferencia',
    label: 'Transferencia',
    tone: 'secondary' as ColorScheme,
    icon: ArrowRightLeft,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700',
    chipClassName: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  },
  ajuste: {
    key: 'ajuste',
    label: 'Ajuste',
    tone: 'warning' as ColorScheme,
    icon: Settings2,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700',
    chipClassName: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  default: {
    key: 'default',
    label: 'Movimiento',
    tone: 'neutral' as ColorScheme,
    icon: Package2,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700',
    chipClassName: 'border-slate-200 bg-slate-50 text-slate-700',
  },
} as const;

export const getMovimientoConfig = (tipoMovimiento?: string) =>
  MOVIMIENTO_CONFIG[tipoMovimiento as keyof typeof MOVIMIENTO_CONFIG] || MOVIMIENTO_CONFIG.default;
