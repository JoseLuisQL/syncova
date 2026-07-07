import React, { memo } from 'react';
import { CircleNotch, Icon, PencilSimple, Eye, Trash } from '@phosphor-icons/react';
import { ColorScheme, COMPONENT_STYLES } from '../constants';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inventory-skeleton ${className}`} aria-hidden="true" />
);

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: Icon;
  count?: number;
  action?: {
    label: string;
    onClick: () => void;
    icon?: Icon;
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: Icon;
    isLoading?: boolean;
  };
}

export const PageHeader: React.FC<PageHeaderProps> = memo(({
  title,
  subtitle,
  icon: Icon,
  count,
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
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={COMPONENT_STYLES.header.title}>{title}</h1>
            {typeof count === 'number' && (
              <span className={`${COMPONENT_STYLES.badge.count} px-2 py-0.5 text-[0.76rem]`}>{count.toLocaleString()}</span>
            )}
          </div>
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
              <CircleNotch className="h-4 w-4 animate-spin" aria-hidden="true" weight="bold" />
            ) : SecondaryIcon ? (
              <SecondaryIcon className="h-4 w-4" aria-hidden="true" weight="bold" />
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
              <CircleNotch className="h-4 w-4 animate-spin" aria-hidden="true" weight="bold" />
            ) : ActionIcon ? (
              <ActionIcon className="h-4 w-4" aria-hidden="true" weight="bold" />
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
  icon: Icon;
  colorScheme?: ColorScheme;
  isLoading?: boolean;
}

const colorClasses: Record<
  ColorScheme,
  { surface: string; border: string; text: string; textStrong: string; iconBg: string; iconText: string; iconBorder: string }
> = {
  primary: {
    surface: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-teal-700',
    textStrong: 'text-teal-900',
    iconBg: 'bg-teal-600',
    iconText: 'text-white',
    iconBorder: 'border-teal-600',
  },
  secondary: {
    surface: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-zinc-500',
    textStrong: 'text-zinc-900',
    iconBg: 'bg-zinc-100',
    iconText: 'text-zinc-700',
    iconBorder: 'border-zinc-200',
  },
  success: {
    surface: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-zinc-500',
    textStrong: 'text-emerald-700',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    iconBorder: 'border-emerald-200',
  },
  warning: {
    surface: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-zinc-500',
    textStrong: 'text-amber-700',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    iconBorder: 'border-amber-200',
  },
  danger: {
    surface: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-zinc-500',
    textStrong: 'text-rose-700',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    iconBorder: 'border-rose-200',
  },
  neutral: {
    surface: 'bg-white',
    border: 'border-zinc-200/80',
    text: 'text-zinc-500',
    textStrong: 'text-zinc-900',
    iconBg: 'bg-zinc-100',
    iconText: 'text-zinc-600',
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
        <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${colors.iconBg} ${colors.iconText} ${colors.iconBorder} transition-transform duration-300 ${isLoading ? 'inventory-breathe' : ''}`}>
          {isLoading ? <SkeletonBlock className="h-4 w-4 rounded-full" /> : <Icon className="h-5 w-5" aria-hidden="true" weight="fill" />}
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
    icon: Icon | any;
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
  status: 'activo' | 'inactivo' | 'disponible' | 'agotado' | 'vencido';
}

const statusConfig = {
  activo: { label: 'Activo', className: COMPONENT_STYLES.badge.active },
  inactivo: { label: 'Inactivo', className: COMPONENT_STYLES.badge.inactive },
  disponible: { label: 'Disponible', className: COMPONENT_STYLES.badge.active },
  agotado: { label: 'Agotado', className: COMPONENT_STYLES.badge.inactive },
  vencido: { label: 'Vencido', className: COMPONENT_STYLES.badge.danger },
};

export const StatusBadge: React.FC<StatusBadgeProps> = memo(({ status }) => {
  const config = statusConfig[status] || statusConfig.inactivo;
  return <span className={config.className}>{config.label}</span>;
});

StatusBadge.displayName = 'StatusBadge';

interface CountBadgeProps {
  count: number;
  icon?: Icon | any;
  variant?: 'default' | 'warning' | 'danger';
}

export const CountBadge: React.FC<CountBadgeProps> = memo(({ count, icon: Icon, variant = 'default' }) => {
  const className =
    variant === 'warning'
      ? COMPONENT_STYLES.badge.warning
      : variant === 'danger'
      ? COMPONENT_STYLES.badge.danger
      : COMPONENT_STYLES.badge.count;

  return (
    <span className={className}>
      {Icon ? <Icon className="mr-1 h-3 w-3" aria-hidden="true" weight="fill" /> : null}
      {count}
    </span>
  );
});

CountBadge.displayName = 'CountBadge';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando...' }) => (
  <div
    className="inventory-loading-shell rounded-4xl border border-zinc-200/90 bg-white p-5 shadow-[0_10px_26px_-22px_rgba(15,23,42,0.22)]"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3 text-zinc-700">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-700 inventory-breathe">
        <CircleNotch className="h-5 w-5 animate-spin" aria-hidden="true" weight="bold" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900">{message}</p>
        <p className="text-xs text-zinc-500">Preparando la información para mostrarla de forma segura.</p>
      </div>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
        <SkeletonBlock className="h-3 w-20 rounded-full" />
        <SkeletonBlock className="mt-3 h-7 w-14 rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="mt-3 h-4 w-full rounded-full" />
        <SkeletonBlock className="mt-2 h-4 w-3/4 rounded-full" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
        <SkeletonBlock className="h-3 w-16 rounded-full" />
        <SkeletonBlock className="mt-3 h-10 w-full rounded-2xl" />
      </div>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

interface EmptyStateProps {
  icon: Icon | any;
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
      <Icon className="h-8 w-8 text-zinc-400" aria-hidden="true" weight="duotone" />
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-7 4h14a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.27 18A2 2 0 005 21z" />
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
        aria-label="Ver detalles"
      >
        <Eye className="h-4 w-4" aria-hidden="true" weight="bold" />
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
        {isLoading ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <PencilSimple className="h-4 w-4" aria-hidden="true" weight="bold" />}
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
        {isLoading ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <Trash className="h-4 w-4" aria-hidden="true" weight="bold" />}
      </button>
    ) : null}
  </div>
));

ActionButtons.displayName = 'ActionButtons';

interface StockProgressProps {
  current: number;
  initial: number;
  showPercentage?: boolean;
}

export const StockProgress: React.FC<StockProgressProps> = memo(({
  current,
  initial,
  showPercentage = true,
}) => {
  const percentage = initial > 0 ? Math.round((current / initial) * 100) : 0;
  const tone = current === 0 ? 'bg-rose-500' : percentage < 20 ? 'bg-amber-500' : 'bg-emerald-500';
  const width = `${Math.max(Math.min(percentage, 100), current > 0 ? 4 : 0)}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-zinc-900">{current.toLocaleString()}</span>
        <span className="text-zinc-500">de {initial.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-200">
        <div className={`h-2 rounded-full transition-all ${tone}`} style={{ width }} />
      </div>
      {showPercentage ? <p className="text-xs text-zinc-500">{percentage}% disponible</p> : null}
    </div>
  );
});

StockProgress.displayName = 'StockProgress';

interface ExpiryBadgeProps {
  daysToExpire: number | null;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = memo(({ daysToExpire }) => {
  if (daysToExpire === null) return null;

  const config =
    daysToExpire <= 0
      ? { label: 'Vencido', className: COMPONENT_STYLES.badge.danger }
      : daysToExpire <= 30
      ? { label: `${daysToExpire} dias`, className: COMPONENT_STYLES.badge.warning }
      : { label: `${daysToExpire} dias`, className: COMPONENT_STYLES.badge.active };

  return <span className={config.className}>{config.label}</span>;
});

ExpiryBadge.displayName = 'ExpiryBadge';

interface KeyValueGridProps {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: 1 | 2 | 3;
}

export const KeyValueGrid: React.FC<KeyValueGridProps> = memo(({ items, columns = 2 }) => (
  <dl className={`grid gap-x-4 gap-y-6 ${columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
    {items.map((item) => (
      <div key={item.label} className="sm:col-span-1">
        <dt className="text-xs font-medium text-zinc-500">{item.label}</dt>
        <dd className="mt-1 text-sm text-zinc-900">{item.value}</dd>
      </div>
    ))}
  </dl>
));

KeyValueGrid.displayName = 'KeyValueGrid';
