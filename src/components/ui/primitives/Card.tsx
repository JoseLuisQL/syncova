import React from 'react';

/**
 * Card del design system de SIVAC.
 *
 * Centraliza los contenedores con borde que antes estaban duplicados como
 * `COMPONENT_STYLES.panel`, `COMPONENT_STYLES.surface`, etc. Usa los tokens
 * purpura-grey (#e7e7ef border, #fbfafd hover, zinc surface).
 *
 * Variantes:
 * - default: tarjeta estándar con borde + sombra sutil
 * - muted: superficie con fondo zinc-50 (panels, sidebars internos)
 * - flat: sin sombra ni borde, solo padding (para composiciones anidadas)
 * - elevated: sombra más marcada (modales, popovers)
 *
 * Radios heredan del design system: sm(6)/md(8)/lg(10)/xl(14)/2xl(16).
 */
type CardVariant = 'default' | 'muted' | 'flat' | 'elevated';
type CardRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  radius?: CardRadius;
  padded?: boolean;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-white border border-line shadow-sm',
  muted: 'bg-zinc-50 border border-line',
  flat: 'bg-transparent',
  elevated: 'bg-white border border-line shadow-[0_22px_54px_-38px_rgba(12,15,24,0.55)]',
};

const RADIUS_CLASSES: Record<CardRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      radius = 'lg',
      padded = true,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      VARIANT_CLASSES[variant],
      RADIUS_CLASSES[radius],
      padded ? 'p-4 sm:p-5' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
