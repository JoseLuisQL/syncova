/**
 * Component library mínima del design system de SIVAC.
 *
 * Reemplaza los estilos duplicados en ModalConstants, Inventario/constants,
 * y hex literales dispersos. Los componentes envuelven los tokens purpura-grey
 * de facto + semánticos restaurados (rose/amber/emerald/blue).
 *
 * Uso:
 *   import { Button, Card, Badge } from '@/components/ui/primitives';
 *
 * Pendiente de migración gradual: las vistas existentes siguen usando
 * COMPONENT_STYLES y MODAL_STYLES; los nuevos componentes y refactorizaciones
 * deberían usar estos primitives en su lugar.
 */
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { Card } from './Card';
export type { CardProps } from './Card';
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';
