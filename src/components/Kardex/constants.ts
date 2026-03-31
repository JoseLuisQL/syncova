import { ArrowCircleDown, ArrowsLeftRight, ArrowCircleUp, Package, Faders } from '@phosphor-icons/react';
import {
  COLORS,
  COMPONENT_STYLES as INVENTORY_COMPONENT_STYLES,
  type ColorScheme,
} from '../Inventario/constants';
import { DESIGN_TOKENS } from '../../styles/designTokens';

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
    icon: ArrowCircleUp,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700',
    chipClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  salida: {
    key: 'salida',
    label: 'Salida',
    tone: 'danger' as ColorScheme,
    icon: ArrowCircleDown,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700',
    chipClassName: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  transferencia: {
    key: 'transferencia',
    label: 'Transferencia',
    tone: 'secondary' as ColorScheme,
    icon: ArrowsLeftRight,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
    chipClassName: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  },
  ajuste: {
    key: 'ajuste',
    label: 'Ajuste',
    tone: 'warning' as ColorScheme,
    icon: Faders,
    badgeClassName: `inline-flex items-center gap-1 rounded-full ${DESIGN_TOKENS.semantic.warning.surface} px-2.5 py-1 text-xs font-medium text-amber-700`,
    chipClassName: `${DESIGN_TOKENS.semantic.warning.border} ${DESIGN_TOKENS.semantic.warning.surface} text-amber-700`,
  },
  default: {
    key: 'default',
    label: 'Movimiento',
    tone: 'neutral' as ColorScheme,
    icon: Package,
    badgeClassName: 'inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700',
    chipClassName: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  },
} as const;

export const getMovimientoConfig = (tipoMovimiento?: string) =>
  MOVIMIENTO_CONFIG[tipoMovimiento as keyof typeof MOVIMIENTO_CONFIG] || MOVIMIENTO_CONFIG.default;
 