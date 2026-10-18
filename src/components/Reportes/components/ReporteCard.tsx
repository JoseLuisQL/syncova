import React from 'react';
import { SpinnerGap, Icon } from '@phosphor-icons/react';
import { ColorScheme, COMPONENT_STYLES } from '../constants';

interface ReportCardAction {
  label: string;
  icon: Icon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
}

interface ReporteCardProps {
  title: string;
  description: string;
  icon: Icon;
  tone?: ColorScheme;
  statusLabel?: string;
  isActive?: boolean;
  actions: ReportCardAction[];
}

const TONE_CLASSES: Record<ColorScheme, { icon: string; border: string; bg: string }> = {
  primary: {
    icon: 'text-brand',
    border: 'border-brand/25',
    bg: 'bg-brand/10',
  },
  secondary: {
    icon: 'text-muted-2',
    border: 'border-line',
    bg: 'bg-surface-soft',
  },
  success: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/60',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  danger: {
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800/60',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  neutral: {
    icon: 'text-muted-2',
    border: 'border-line',
    bg: 'bg-surface-soft',
  },
  info: {
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/60',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
};

const getActionClass = (variant: 'primary' | 'secondary' | 'ghost' = 'secondary') => {
  if (variant === 'primary') return COMPONENT_STYLES.button.primary;
  if (variant === 'ghost') return COMPONENT_STYLES.button.ghost;
  return COMPONENT_STYLES.button.secondary;
};

const ReporteCard: React.FC<ReporteCardProps> = ({
  title,
  description,
  icon: IconComponent,
  tone = 'primary',
  statusLabel,
  isActive = false,
  actions,
}) => {
  const accent = TONE_CLASSES[tone];

  return (
    <article
      className={`${COMPONENT_STYLES.reportCard.container} ${
        isActive ? 'border-brand ring-1 ring-brand/20 bg-surface-tint/25' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`${COMPONENT_STYLES.reportCard.iconWrapper} ${accent.border} ${accent.bg}`}>
          <IconComponent className={`h-4 w-4 ${accent.icon}`} weight="bold" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className={COMPONENT_STYLES.reportCard.title}>{title}</h3>
            {statusLabel ? (
              <span className="font-mono text-[11px] font-medium text-muted tabular-nums shrink-0">
                {statusLabel}
              </span>
            ) : null}
          </div>
          <p className={COMPONENT_STYLES.reportCard.description}>{description}</p>
        </div>
      </div>

      <div className={COMPONENT_STYLES.reportCard.actionRow}>
        {actions.map((action) => {
          const ActionIcon = action.isLoading ? SpinnerGap : action.icon;

          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled || action.isLoading}
              className={`${getActionClass(action.variant)} h-8 px-3 text-xs`}
            >
              <ActionIcon className={`h-3.5 w-3.5 ${action.isLoading ? 'animate-spin' : ''}`} weight="bold" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
};

export default React.memo(ReporteCard);
