import React from 'react';

/**
 * Badge del design system de SIVAC.
 *
 * Centraliza los badges de estado que antes estaban hardcodeados en
 * COMPONENT_STYLES.badge.* y constants.ts de Dashboard. Cada variante
 * semántica usa los tokens restaurados (rose/amber/emerald/blue + zinc).
 *
 * Variantes:
 * - neutral: zinc, para estados no semánticos (contar, metadata)
 * - success: emerald (activo, disponible, stock sano)
 * - warning: amber (por vencer, stock bajo)
 * - danger: rose (vencido, crítico, sin stock)
 * - info: blue (información, novedades)
 * - teal: acento clinical (uso restringido)
 *
 * El badge incluye un punto de estado opcional (dot) alineado a la izquierda
 * para reforzar visualmente el semántico. El dot respeta el color de la
 * variante automáticamente.
 */
type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'teal';

type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Muestra un punto de color a la izquierda del contenido. */
  withDot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, { wrapper: string; dot: string }> = {
  neutral: {
    wrapper: 'bg-surface-soft border-line text-ink',
    dot: 'bg-muted',
  },
  success: {
    wrapper: 'bg-status-success-bg border-status-success-border text-status-success-text',
    dot: 'bg-emerald-500',
  },
  warning: {
    wrapper: 'bg-status-warning-bg border-status-warning-border text-status-warning-text',
    dot: 'bg-amber-500',
  },
  danger: {
    wrapper: 'bg-status-danger-bg border-status-danger-border text-status-danger-text',
    dot: 'bg-rose-500',
  },
  info: {
    wrapper: 'bg-status-info-bg border-status-info-border text-status-info-text',
    dot: 'bg-blue-500',
  },
  teal: {
    wrapper: 'bg-surface-tint border-brand/40 text-brand',
    dot: 'bg-brand',
  },
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  withDot = false,
  className = '',
  children,
  ...rest
}) => {
  const styles = VARIANT_CLASSES[variant];
  const classes = [
    'inline-flex items-center font-medium border rounded-md',
    styles.wrapper,
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {withDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
