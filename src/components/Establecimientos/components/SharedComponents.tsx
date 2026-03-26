import React, { memo } from 'react';
import { Eye, SpinnerGap, Pencil, Trash } from '@phosphor-icons/react';
import { ColorScheme, COMPONENT_STYLES } from '../constants';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inventory-skeleton ${className}`} aria-hidden="true" />
);

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
    isLoading?: boolean;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = memo(({
  title,
  subtitle,
  icon: Icon,
  action,
  secondaryAction,
}) => {
  const ActionIcon = action?.icon;
  const SecondaryIcon = secondaryAction?.icon;

  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className={COMPONENT_STYLES.header.iconWrapper}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className={COMPONENT_STYLES.header.title}>{title}</h1>
          {subtitle ? <p className={`${COMPONENT_STYLES.header.subtitle} mt-1`}>{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.isLoading}
            className={COMPONENT_STYLES.button.secondary}
            aria-busy={secondaryAction.isLoading}
          >
            {secondaryAction.isLoading ? (
              <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : SecondaryIcon ? (
              <SecondaryIcon className="h-4 w-4" aria-hidden="true" />
            ) : null}
            <span>{secondaryAction.label}</span>
          </button>
        ) : null}
        {action ? (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.isLoading}
            className={COMPONENT_STYLES.button.primary}
            aria-busy={action.isLoading}
          >
            {action.isLoading ? (
              <SpinnerGap className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : ActionIcon ? (
              <ActionIcon className="h-4 w-4" aria-hidden="true" />
            ) : null}
            <span>{action.label}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
});

PageHeader.displayName = 'PageHeader';

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorScheme?: ColorScheme;
  isLoading?: boolean;
}

const colorClasses: Record<
  ColorScheme,
  { surface: string; border: string; text: string; textStrong: string; iconBg: string; iconText: string; iconBorder: string }
> = {
  primary: {
    surface: 'bg-white',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textStrong: 'text-teal-900',
    iconBg: 'bg-zinc-100',
    iconText: 'text-zinc-900',
    iconBorder: 'border-zinc-200',
  },
  secondary: {
    surface: 'bg-white',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textStrong: 'text-cyan-900',
    iconBg: 'bg-cyan-100',
    iconText: 'text-cyan-800',
    iconBorder: 'border-cyan-200',
  },
  success: {
    surface: 'bg-white',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textStrong: 'text-emerald-900',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-800',
    iconBorder: 'border-emerald-200',
  },
  warning: {
    surface: 'bg-white',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textStrong: 'text-amber-900',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-800',
    iconBorder: 'border-amber-200',
  },
  danger: {
    surface: 'bg-white',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textStrong: 'text-rose-900',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-800',
    iconBorder: 'border-rose-200',
  },
  neutral: {
    surface: 'bg-white',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    textStrong: 'text-zinc-900',
    iconBg: 'bg-zinc-200',
    iconText: 'text-zinc-700',
    iconBorder: 'border-zinc-200',
  },
};

export const StatsCard: React.FC<StatsCardProps> = memo(({
  label,
  value,
  icon: Icon,
  colorScheme = 'primary',
  isLoading = false,
}) => {
  const colors = colorClasses[colorScheme];

  return (
    <div className={`${COMPONENT_STYLES.stats.card} ${colors.surface} ${colors.border} inventory-reveal`}>
      <div className="flex h-full items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`${COMPONENT_STYLES.stats.label} ${colors.text}`}>{label}</p>
          {isLoading ? (
            <div className="mt-3 space-y-2.5">
              <SkeletonBlock className="h-8 w-20 rounded-2xl" />
              <SkeletonBlock className="h-3 w-24 rounded-full opacity-80" />
            </div>
          ) : (
            <p className={`${COMPONENT_STYLES.stats.value} ${colors.textStrong}`}>
              {(value ?? 0).toLocaleString()}
            </p>
          )}
        </div>
        <div
          className={`${COMPONENT_STYLES.stats.iconWrapper} ${colors.iconBg} ${colors.iconText} ${colors.iconBorder} transition-transform duration-300 ${
            isLoading ? 'inventory-breathe' : ''
          }`}
        >
          {isLoading ? <SkeletonBlock className="h-4 w-4 rounded-full" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

interface StatsGridProps {
  stats: Array<{
    key: string;
    label: string;
    value: number;
    icon: React.ElementType;
    color?: ColorScheme;
  }>;
  isLoading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = memo(({ stats, isLoading = false }) => (
  <section aria-label="Estadisticas" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
    {stats.map((stat) => (
      <StatsCard
        key={stat.key}
        label={stat.label}
        value={stat.value}
        icon={stat.icon}
        colorScheme={stat.color || 'primary'}
        isLoading={isLoading}
      />
    ))}
  </section>
));

StatsGrid.displayName = 'StatsGrid';

interface StatusBadgeProps {
  status: 'activo' | 'inactivo';
}

const statusConfig = {
  activo: { label: 'Activo', className: COMPONENT_STYLES.badge.active },
  inactivo: { label: 'Inactivo', className: COMPONENT_STYLES.badge.inactive },
};

export const StatusBadge: React.FC<StatusBadgeProps> = memo(({ status }) => {
  const config = statusConfig[status] || statusConfig.inactivo;
  return <span className={config.className}>{config.label}</span>;
});

StatusBadge.displayName = 'StatusBadge';

interface CountBadgeProps {
  count: number;
  icon?: React.ElementType;
  variant?: 'default' | 'warning' | 'danger' | 'neutral';
}

export const CountBadge: React.FC<CountBadgeProps> = memo(({ count, icon: Icon, variant = 'default' }) => {
  const className =
    variant === 'warning'
      ? COMPONENT_STYLES.badge.warning
      : variant === 'danger'
      ? COMPONENT_STYLES.badge.danger
      : variant === 'neutral'
      ? COMPONENT_STYLES.badge.neutral
      : COMPONENT_STYLES.badge.count;

  return (
    <span className={className}>
      {Icon ? <Icon className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
      {count}
    </span>
  );
});

CountBadge.displayName = 'CountBadge';

interface TipoBadgeProps {
  config: {
    label: string;
    badgeClassName: string;
  };
}

export const TipoBadge: React.FC<TipoBadgeProps> = memo(({ config }) => (
  <span className={config.badgeClassName}>{config.label}</span>
));

TipoBadge.displayName = 'TipoBadge';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando...' }) => (
  <div
    className="inventory-loading-shell rounded-[24px] border border-zinc-200/90 bg-white p-5 shadow-[0_10px_26px_-22px_rgba(15,23,42,0.22)]"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3 text-zinc-700">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-900 inventory-breathe">
        <SpinnerGap className="h-5 w-5 animate-spin" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900">{message}</p>
        <p className="text-xs text-zinc-500">Preparando la información para mostrarla de forma clara.</p>
      </div>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
      <Icon className="h-8 w-8 text-zinc-400" aria-hidden="true" />
    </div>
    <p className="text-lg font-medium text-zinc-900">{title}</p>
    {description ? <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p> : null}
    {action ? (
      <button type="button" onClick={action.onClick} className={`${COMPONENT_STYLES.button.primary} mt-5`}>
        {action.label}
      </button>
    ) : null}
  </div>
));

EmptyState.displayName = 'EmptyState';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = memo(({ message, onRetry }) => (
  <div className="flex flex-col gap-3 rounded-[22px] border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
        <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-7 4h14a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.27 18A2 2 0 005 21z"
          />
        </svg>
      </div>
      <span>{message}</span>
    </div>
    {onRetry ? (
      <button type="button" onClick={onRetry} className={COMPONENT_STYLES.button.secondary}>
        Reintentar
      </button>
    ) : null}
  </div>
));

ErrorAlert.displayName = 'ErrorAlert';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  isLoading?: boolean;
  canDelete?: boolean;
  deleteTooltip?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = memo(({
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  canDelete = true,
  deleteTooltip,
}) => (
  <div className="flex items-center justify-end gap-2">
    {onView ? (
      <button
        type="button"
        onClick={onView}
        disabled={isLoading}
        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
        aria-label="Ver detalle"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
      </button>
    ) : null}
    {onEdit ? (
      <button
        type="button"
        onClick={onEdit}
        disabled={isLoading}
        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
        aria-label="Editar"
      >
        {isLoading ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" aria-hidden="true" />}
      </button>
    ) : null}
    {onDelete ? (
      <button
        type="button"
        onClick={onDelete}
        disabled={isLoading || !canDelete}
        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
        aria-label="Eliminar"
        title={!canDelete ? deleteTooltip : 'Eliminar'}
      >
        {isLoading ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" aria-hidden="true" />}
      </button>
    ) : null}
  </div>
));

ActionButtons.displayName = 'ActionButtons';
 