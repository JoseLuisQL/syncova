import { ArrowCircleDown, ArrowsLeftRight, ArrowCircleUp, Package, Faders } from '@phosphor-icons/react';
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
    icon: ArrowCircleUp,
    badgeClassName: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500',
    chipClassName: 'border-[#e7e7ef] bg-white text-[#15171d]',
  },
  salida: {
    key: 'salida',
    label: 'Salida',
    tone: 'danger' as ColorScheme,
    icon: ArrowCircleDown,
    badgeClassName: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-rose-500',
    chipClassName: 'border-[#e7e7ef] bg-white text-[#15171d]',
  },
  transferencia: {
    key: 'transferencia',
    label: 'Transferencia',
    tone: 'secondary' as ColorScheme,
    icon: ArrowsLeftRight,
    badgeClassName: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-sky-500',
    chipClassName: 'border-[#e7e7ef] bg-white text-[#15171d]',
  },
  ajuste: {
    key: 'ajuste',
    label: 'Ajuste',
    tone: 'warning' as ColorScheme,
    icon: Faders,
    badgeClassName: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d] before:content-[""] before:h-1.5 before:w-1.5 before:rounded-full before:bg-amber-400',
    chipClassName: 'border-[#e7e7ef] bg-white text-[#15171d]',
  },
  default: {
    key: 'default',
    label: 'Movimiento',
    tone: 'neutral' as ColorScheme,
    icon: Package,
    badgeClassName: 'inline-flex items-center gap-1.5 rounded-md border border-[#e7e7ef] bg-white px-2.5 py-1 text-xs font-medium text-[#15171d]',
    chipClassName: 'border-[#e7e7ef] bg-white text-[#15171d]',
  },
} as const;

export const getMovimientoConfig = (tipoMovimiento?: string) =>
  MOVIMIENTO_CONFIG[tipoMovimiento as keyof typeof MOVIMIENTO_CONFIG] || MOVIMIENTO_CONFIG.default;
 