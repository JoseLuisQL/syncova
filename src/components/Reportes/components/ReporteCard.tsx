import React from 'react';
import { SpinnerGap, IconProps } from '@phosphor-icons/react';
import { ColorScheme, COLORS, COMPONENT_STYLES } from '../constants';

interface ReportCardAction {
  label: string;
  icon: IconProps;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
}

interface ReporteCardProps {
  title: string;
  description: string;
  icon: IconProps;
  tone?: ColorScheme;
  statusLabel?: string;
  helperText?: string;
  facts?: string[];
  actions: ReportCardAction[];
}

const TONE_CLASSES: Record<ColorScheme, { icon: string; border: string; bg: string; text: string; shadow: string }> = {
  primary: {
    icon: 'text-zinc-700',
    border: 'border-zinc-200',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    shadow: 'shadow-sm',
  },
  secondary: {
    icon: 'text-zinc-700',
    border: 'border-zinc-200',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    shadow: 'shadow-sm',
  },
  success: {
    icon: 'text-emerald-700',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    shadow: 'shadow-sm',
  },
  warning: {
    icon: 'text-amber-700',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    shadow: 'shadow-sm',
  },
  danger: {
    icon: 'text-rose-700',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    shadow: 'shadow-sm',
  },
  neutral: {
    icon: 'text-zinc-700',
    border: 'border-zinc-200',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    shadow: 'shadow-sm',
  },
  info: {
    icon: 'text-zinc-700',
    border: 'border-zinc-200',
    bg: 'bg-zinc-50',
    text: 'text-zinc-700',
    shadow: 'shadow-sm',
  },
};

const buttonClasses = (variant: 'primary' | 'secondary' | 'ghost', tone: ColorScheme) => {
  if (variant === 'secondary') return COMPONENT_STYLES.button.secondary;
  if (variant === 'ghost') return COMPONENT_STYLES.button.ghost;

  const accent = COLORS[tone];
  return `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${accent.gradient} px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-[0.97] focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60`;
};

const ReporteCard: React.FC<ReporteCardProps> = ({
  title,
  description,
  icon: Icon,
  tone = 'primary',
  statusLabel,
  helperText,
  facts = [],
  actions,
}) => {
  const accent = TONE_CLASSES[tone];

  return (
    <article className={COMPONENT_STYLES.reportCard.container}>
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className={`${COMPONENT_STYLES.reportCard.iconWrapper} ${accent.border} ${accent.bg} ${accent.shadow}`}>
            <Icon className={`h-4 w-4 ${accent.icon}`} aria-hidden="true" />
          </div>
          {statusLabel ? (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {statusLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          <h3 className={COMPONENT_STYLES.reportCard.title}>{title}</h3>
          <p className={COMPONENT_STYLES.reportCard.description}>{description}</p>
        </div>

        {facts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <span key={fact} className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[0.68rem] font-medium text-zinc-600">
                {fact}
              </span>
            ))}
          </div>
        ) : null}

        {helperText ? <p className="mt-3 text-[0.72rem] font-medium text-zinc-500">{helperText}</p> : null}
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
              className={`${buttonClasses(action.variant || 'secondary', tone)} ${action.variant === 'ghost' ? 'min-h-[40px]' : 'min-h-[40px] flex-1 sm:flex-none'} px-3 py-1.5 text-[0.82rem]`}
            >
              <ActionIcon className={`h-4 w-4 ${action.isLoading ? 'animate-spin' : ''}`} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
};

export default React.memo(ReporteCard);
