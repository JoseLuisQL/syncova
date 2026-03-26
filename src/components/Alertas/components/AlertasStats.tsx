import React, { memo } from 'react';
import { Bell, WarningCircle, WarningOctagon, CalendarBlank, CircleNotch } from '@phosphor-icons/react';

interface StatsData {
  total: number;
  noLeidas: number;
  criticas: number;
  hoy: number;
}

interface AlertasStatsProps {
  stats: StatsData;
  isLoading?: boolean;
}

const statsConfig = [
  {
    key: 'total',
    label: 'Total Alertas',
    icon: Bell,
    bgGradient: 'from-zinc-50 to-white',
    borderColor: 'border-zinc-200/60',
    textColor: 'text-zinc-900',
    labelColor: 'text-zinc-600',
    iconBg: 'bg-zinc-800',
  },
  {
    key: 'noLeidas',
    label: 'Sin Leer',
    icon: WarningCircle,
    bgGradient: 'from-rose-50/50 to-white',
    borderColor: 'border-rose-200/60',
    textColor: 'text-rose-900',
    labelColor: 'text-rose-700',
    iconBg: 'bg-rose-600',
  },
  {
    key: 'criticas',
    label: 'Criticas',
    icon: WarningOctagon,
    bgGradient: 'from-amber-50/50 to-white',
    borderColor: 'border-amber-200/60',
    textColor: 'text-amber-900',
    labelColor: 'text-amber-700',
    iconBg: 'bg-amber-600',
  },
  {
    key: 'hoy',
    label: 'Hoy',
    icon: CalendarBlank,
    bgGradient: 'from-blue-50/50 to-white',
    borderColor: 'border-blue-200/60',
    textColor: 'text-blue-900',
    labelColor: 'text-blue-700',
    iconBg: 'bg-blue-600',
  },
] as const;

export const AlertasStats: React.FC<AlertasStatsProps> = memo(({ stats, isLoading = false }) => (
  <section aria-label="Estadisticas" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {statsConfig.map((config) => {
      const Icon = config.icon;
      const value = stats[config.key as keyof StatsData];

      return (
        <div
          key={config.key}
          className={`rounded-2xl p-5 border transition-all duration-200 hover:shadow-md bg-gradient-to-br ${config.bgGradient} ${config.borderColor}`}
          role="region"
          aria-label={`${config.label}: ${value}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${config.labelColor}`}>
                {config.label}
              </p>
              {isLoading ? (
                <CircleNotch className={`h-6 w-6 ${config.labelColor} animate-spin mt-1`} weight="bold" />
              ) : (
                <p className={`text-2xl font-bold ${config.textColor}`}>
                  {(value ?? 0).toLocaleString()}
                </p>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${config.iconBg} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" aria-hidden="true" weight="bold" />
            </div>
          </div>
        </div>
      );
    })}
  </section>
));

AlertasStats.displayName = 'AlertasStats';
 