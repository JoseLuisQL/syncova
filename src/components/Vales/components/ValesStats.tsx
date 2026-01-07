import React, { memo } from 'react';
import { Receipt, Package, CheckCircle } from 'lucide-react';
import { COMPONENT_STYLES, COLORS } from '../constants';

interface Estadisticas {
  totalVales: number;
  totalVacunas: number;
  valesEntregados: number;
  porcentajeEntregados: number;
}

interface ValesStatsProps {
  estadisticas: Estadisticas;
  isLoading?: boolean;
}

export const ValesStats: React.FC<ValesStatsProps> = memo(({
  estadisticas,
  isLoading = false,
}) => {
  const stats = [
    {
      key: 'vales',
      label: 'Total Vales',
      value: estadisticas.totalVales,
      icon: Receipt,
      bg: `bg-gradient-to-br ${COLORS.primary.bg}`,
      border: COLORS.primary.border,
      text: COLORS.primary.textDark,
      iconBg: 'bg-gradient-to-br from-teal-600 to-cyan-600',
    },
    {
      key: 'vacunas',
      label: 'Total Vacunas',
      value: estadisticas.totalVacunas,
      icon: Package,
      bg: `bg-gradient-to-br ${COLORS.secondary.bg}`,
      border: COLORS.secondary.border,
      text: COLORS.secondary.textDark,
      iconBg: 'bg-gradient-to-br from-cyan-500 to-teal-500',
    },
    {
      key: 'entregados',
      label: 'Entregados',
      value: `${estadisticas.porcentajeEntregados}%`,
      sublabel: `${estadisticas.valesEntregados} de ${estadisticas.totalVales}`,
      icon: CheckCircle,
      bg: `bg-gradient-to-br ${COLORS.success.bg}`,
      border: COLORS.success.border,
      text: COLORS.success.textDark,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${COMPONENT_STYLES.stats.card} bg-gray-50 border-gray-200 animate-pulse`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1">
                <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className={`${COMPONENT_STYLES.stats.card} ${stat.bg} ${stat.border}`}
          >
            <div className="flex items-center gap-4">
              <div className={`${COMPONENT_STYLES.stats.iconWrapper} ${stat.iconBg}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className={`${COMPONENT_STYLES.stats.value} ${stat.text}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className={`${COMPONENT_STYLES.stats.label} ${stat.text} opacity-80`}>
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className={`${COMPONENT_STYLES.stats.sublabel} ${stat.text} opacity-60`}>
                    {stat.sublabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

ValesStats.displayName = 'ValesStats';
