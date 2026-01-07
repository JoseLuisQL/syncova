import React, { memo } from 'react';
import { Bell, AlertCircle, AlertOctagon, Calendar, Loader2 } from 'lucide-react';

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
    bgGradient: 'from-teal-50 to-teal-100',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-900',
    labelColor: 'text-teal-700',
    iconBg: 'bg-teal-600',
  },
  {
    key: 'noLeidas',
    label: 'Sin Leer',
    icon: AlertCircle,
    bgGradient: 'from-rose-50 to-rose-100',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-900',
    labelColor: 'text-rose-700',
    iconBg: 'bg-rose-600',
  },
  {
    key: 'criticas',
    label: 'Criticas',
    icon: AlertOctagon,
    bgGradient: 'from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    labelColor: 'text-amber-700',
    iconBg: 'bg-amber-600',
  },
  {
    key: 'hoy',
    label: 'Hoy',
    icon: Calendar,
    bgGradient: 'from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-900',
    labelColor: 'text-emerald-700',
    iconBg: 'bg-emerald-600',
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
                <Loader2 className={`h-6 w-6 ${config.labelColor} animate-spin mt-1`} />
              ) : (
                <p className={`text-2xl font-bold ${config.textColor}`}>
                  {(value ?? 0).toLocaleString()}
                </p>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${config.iconBg} shadow-lg`}>
              <Icon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      );
    })}
  </section>
));

AlertasStats.displayName = 'AlertasStats';
