import React, { forwardRef } from 'react';

/**
 * Sistema de variantes de Button.
 *
 * Centraliza los estilos que antes estaban duplicados en:
 * - ModalConstants.ts (MODAL_STYLES.button.primary/secondary/ghost)
 * - Inventario/constants.ts (COMPONENT_STYLES.button.primary/secondary/ghost/success/icon*)
 * - DashboardHeader.tsx (botones outline slate)
 * - GestionVacunas.tsx (botones slate)
 *
 * Tokens canónicos (sistema purpura-grey de facto + semánticos restaurados):
 * - primary: purpura #7c3aed (botón principal de acción)
 * - secondary: blanco con borde zinc (cancelar, acción secundaria)
 * - ghost: blanco con borde, texto muted (acción terciaria)
 * - danger: rose-600 (eliminar, destructivo)
 * - success: emerald-600 (confirmar, éxito)
 * - warning: amber-500 (advertencia)
 * - info: blue-500 (información)
 * - teal: #0e9f8e (acento clinical, usar con moderación)
 *
 * Radios estandarizados a 4 niveles: sm(6px)/md(8px)/lg(10px)/xl(14px)/full.
 */
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'teal';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonRadius = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
  isLoading?: boolean;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  /** Ancho completo. Útil para CTAs en formularios y modales. */
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand/30 shadow-sm',
  secondary:
    'bg-white text-ink border border-line hover:bg-surface-soft hover:border-line-strong focus-visible:ring-zinc-300',
  ghost:
    'bg-white text-muted-2 border border-line hover:bg-surface-soft hover:text-ink hover:border-line-strong focus-visible:ring-zinc-300',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/30 shadow-sm',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/30 shadow-sm',
  warning:
    'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/30 shadow-sm',
  info: 'bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500/30 shadow-sm',
  teal:
    'bg-[#0e9f8e] text-white hover:bg-[#0a8276] focus-visible:ring-teal-500/30 shadow-sm',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-base gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
  // Botón cuadrado para acciones de icono (editar/eliminar/ver en tablas).
  icon: 'h-8 w-8 justify-center',
};

const RADIUS_CLASSES: Record<ButtonRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Botón base del design system de SIVAC.
 *
 * Reemplaza los 6+ patrones de botón duplicados en el código. Soporta
 * loading state (spinner), iconos a izquierda/derecha, y focus-visible
 * accesible. No aplica estilos de fuente: hereda el font-weight/size del
 * padre para integrarse en cualquier contexto.
 *
 * @example
 * <Button variant="primary" leftIcon={Plus}>Nueva vacuna</Button>
 * <Button variant="danger" size="icon" aria-label="Eliminar"><Trash /></Button>
 * <Button variant="secondary" isLoading>Guardando…</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      radius = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const classes = [
      'inline-flex items-center justify-center font-semibold transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'active:translate-y-px',
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      RADIUS_CLASSES[radius],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={classes}
        {...rest}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {!isLoading && LeftIcon && (
          <LeftIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" weight="bold" />
        )}
        {children && <span className="truncate">{children}</span>}
        {!isLoading && RightIcon && (
          <RightIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" weight="bold" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
