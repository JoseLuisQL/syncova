import React, { memo } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { COLORS, COMPONENT_STYLES, ColorScheme } from '../constants';

// ============================================================================
// PAGE HEADER COMPONENT
// ============================================================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  count?: number;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
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
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className={COMPONENT_STYLES.header.iconWrapper}>
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className={COMPONENT_STYLES.header.title}>
            {title}
            {count !== undefined && count > 0 && (
              <span className="ml-2 text-base font-medium text-teal-600">
                ({count})
              </span>
            )}
          </h1>
          {subtitle && (
            <p className={COMPONENT_STYLES.header.subtitle}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.isLoading}
            className={COMPONENT_STYLES.button.secondary}
            aria-busy={secondaryAction.isLoading}
          >
            {secondaryAction.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : SecondaryIcon ? (
              <SecondaryIcon className="h-4 w-4" aria-hidden="true" />
            ) : null}
            <span>{secondaryAction.label}</span>
          </button>
        )}
        {action && (
          <button
            onClick={action.onClick}
            disabled={action.isLoading}
            className={COMPONENT_STYLES.button.primary}
            aria-busy={action.isLoading}
          >
            {action.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : ActionIcon ? (
              <ActionIcon className="h-4 w-4" aria-hidden="true" />
            ) : null}
            <span>{action.label}</span>
          </button>
        )}
      </div>
    </header>
  );
});

PageHeader.displayName = 'PageHeader';

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  colorScheme?: ColorScheme;
  isLoading?: boolean;
}

const colorClasses: Record<ColorScheme, { bg: string; border: string; text: string; textDark: string; iconBg: string }> = {
  primary: {
    bg: 'bg-gradient-to-br from-teal-50 to-teal-100',
    border: 'border-teal-200',
    text: 'text-teal-600',
    textDark: 'text-teal-800',
    iconBg: 'bg-teal-500',
  },
  secondary: {
    bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    textDark: 'text-cyan-800',
    iconBg: 'bg-cyan-500',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    textDark: 'text-emerald-800',
    iconBg: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-600',
    textDark: 'text-amber-800',
    iconBg: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-gradient-to-br from-rose-50 to-rose-100',
    border: 'border-rose-200',
    text: 'text-rose-600',
    textDark: 'text-rose-800',
    iconBg: 'bg-rose-500',
  },
  neutral: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-600',
    textDark: 'text-gray-800',
    iconBg: 'bg-gray-500',
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
    <div
      className={`${COMPONENT_STYLES.stats.card} ${colors.bg} ${colors.border}`}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`${COMPONENT_STYLES.stats.label} ${colors.text}`}>
            {label}
          </p>
          {isLoading ? (
            <Loader2 className={`h-6 w-6 ${colors.text} animate-spin mt-1`} />
          ) : (
            <p className={`${COMPONENT_STYLES.stats.value} ${colors.textDark}`}>
              {(value ?? 0).toLocaleString()}
            </p>
          )}
        </div>
        <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${colors.iconBg}`}>
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

// ============================================================================
// STATS GRID COMPONENT
// ============================================================================

interface StatsGridProps {
  stats: Array<{
    key: string;
    label: string;
    value: number;
    icon: LucideIcon;
    color?: ColorScheme;
  }>;
  isLoading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = memo(({ stats, isLoading = false }) => (
  <section aria-label="Estadisticas" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

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
  return (
    <span className={config.className}>
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// ============================================================================
// COUNT BADGE COMPONENT
// ============================================================================

interface CountBadgeProps {
  count: number;
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'danger';
}

export const CountBadge: React.FC<CountBadgeProps> = memo(({ count, icon: Icon, variant = 'default' }) => {
  const className = variant === 'warning' 
    ? COMPONENT_STYLES.badge.warning 
    : variant === 'danger' 
    ? COMPONENT_STYLES.badge.danger 
    : COMPONENT_STYLES.badge.count;
  
  return (
    <span className={className}>
      {Icon && <Icon className="h-3 w-3 mr-1" aria-hidden="true" />}
      {count}
    </span>
  );
});

CountBadge.displayName = 'CountBadge';

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
    <Loader2 className="h-8 w-8 animate-spin text-teal-600" aria-hidden="true" />
    <span className="ml-3 text-gray-600">{message}</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon: LucideIcon;
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
  <div className="text-center py-12 px-4">
    <Icon className={COMPONENT_STYLES.table.emptyIcon} aria-hidden="true" />
    <p className="text-lg font-medium text-gray-900 mb-1">{title}</p>
    {description && (
      <p className="text-sm text-gray-500 mb-4">{description}</p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className={COMPONENT_STYLES.button.primary}
      >
        {action.label}
      </button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

// ============================================================================
// ERROR ALERT COMPONENT
// ============================================================================

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = memo(({ message, onRetry }) => (
  <div
    className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6"
    role="alert"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-rose-100">
          <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-rose-800 text-sm font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-rose-700 hover:text-rose-800"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
));

ErrorAlert.displayName = 'ErrorAlert';

// ============================================================================
// ACTION BUTTONS COMPONENT
// ============================================================================

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
  <div className="flex items-center justify-end gap-1">
    {onView && (
      <button
        onClick={onView}
        disabled={isLoading}
        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconView}`}
        aria-label="Ver detalles"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    )}
    {onEdit && (
      <button
        onClick={onEdit}
        disabled={isLoading}
        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconEdit}`}
        aria-label="Editar"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
      </button>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        disabled={isLoading || !canDelete}
        className={`${COMPONENT_STYLES.button.icon} ${COMPONENT_STYLES.button.iconDelete}`}
        aria-label="Eliminar"
        title={!canDelete ? deleteTooltip : 'Eliminar'}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    )}
  </div>
));

ActionButtons.displayName = 'ActionButtons';

// ============================================================================
// STOCK PROGRESS BAR COMPONENT
// ============================================================================

interface StockProgressProps {
  current: number;
  initial: number;
  showPercentage?: boolean;
}

export const StockProgress: React.FC<StockProgressProps> = memo(({ 
  current, 
  initial, 
  showPercentage = true 
}) => {
  const percentage = initial > 0 ? Math.round((current / initial) * 100) : 0;
  const colorClass = current === 0 
    ? 'bg-rose-500' 
    : percentage < 20 
    ? 'bg-amber-500' 
    : 'bg-emerald-500';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-gray-900">{current.toLocaleString()}</span>
        <span className="text-gray-500">de {initial.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-gray-500 text-center">{percentage}%</p>
      )}
    </div>
  );
});

StockProgress.displayName = 'StockProgress';

// ============================================================================
// EXPIRY BADGE COMPONENT
// ============================================================================

interface ExpiryBadgeProps {
  daysToExpire: number | null;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = memo(({ daysToExpire }) => {
  if (daysToExpire === null) return null;

  const config = daysToExpire <= 0
    ? { label: 'Vencido', className: 'bg-rose-100 text-rose-800' }
    : daysToExpire <= 30
    ? { label: `${daysToExpire} dias`, className: 'bg-amber-100 text-amber-800' }
    : { label: `${daysToExpire} dias`, className: 'bg-emerald-100 text-emerald-800' };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
});

ExpiryBadge.displayName = 'ExpiryBadge';
