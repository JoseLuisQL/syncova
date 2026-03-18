import React from 'react';
import { AlertCircle, CheckCircle2, LucideIcon } from 'lucide-react';
import { ColorScheme, COLORS, COMPONENT_STYLES } from '../constants';

export interface AlertMetricItem {
  id: string;
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: ColorScheme;
  description?: string;
}

export const AlertSectionCard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <section className={COMPONENT_STYLES.surface}>
    <div className="px-4 py-4 sm:px-5">{children}</div>
  </section>
);

export const AlertMetricsGrid: React.FC<{ items: AlertMetricItem[] }> = ({ items }) => (
  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => {
      const tone = COLORS[item.tone || 'neutral'];
      const Icon = item.icon;

      return (
        <article key={item.id} className={`${COMPONENT_STYLES.stats.card} ${tone.border} ${tone.surfaceSoft}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`${COMPONENT_STYLES.stats.label} ${tone.text}`}>{item.label}</p>
              <p className={`${COMPONENT_STYLES.stats.value} ${tone.textStrong}`}>{item.value}</p>
              {item.description ? <p className="mt-1.5 text-[0.74rem] leading-5 text-slate-500">{item.description}</p> : null}
            </div>
            <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${tone.border} ${tone.surface}`}>
              <Icon className={`h-4 w-4 ${tone.icon}`} aria-hidden="true" />
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

export const AlertInlineStatus: React.FC<{
  tone?: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
}> = ({ tone = 'info', title, description }) => {
  const classes = {
    success: 'rounded-[18px] border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800',
    warning: COMPONENT_STYLES.alert.warning,
    danger: COMPONENT_STYLES.alert.error,
    info: COMPONENT_STYLES.alert.info,
  }[tone];

  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={classes}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
};
