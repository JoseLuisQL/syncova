import React, { memo } from 'react';
import { Receipt, Package, CheckCircle } from '@phosphor-icons/react';
import { COMPONENT_STYLES } from '../constants';

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
      label: 'TOTAL VALES',
      value: estadisticas.totalVales,
      icon: Receipt,
    },
    {
      key: 'vacunas',
      label: 'TOTAL VACUNAS',
      value: estadisticas.totalVacunas,
      icon: Package,
    },
    {
      key: 'entregados',
      label: 'ENTREGADOS',
      value: `${estadisticas.porcentajeEntregados}%`,
      sublabel: `${estadisticas.valesEntregados} de ${estadisticas.totalVales}`,
      icon: CheckCircle,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${COMPONENT_STYLES.stats.card} flex animate-pulse items-center gap-4`}
          >
            <div className="h-10 w-10 bg-zinc-100 rounded-xl" />
            <div className="flex-1">
              <div className="h-6 bg-zinc-100 rounded w-16 mb-2" />
              <div className="h-3 bg-zinc-100 rounded w-24" />
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
            className={COMPONENT_STYLES.stats.card}
          >
            <div className="flex items-center gap-4">
              <div className={COMPONENT_STYLES.stats.iconWrapper}>
                <Icon weight="duotone" className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className={COMPONENT_STYLES.stats.value}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString('en-US') : stat.value}
                </div>
                <div className={COMPONENT_STYLES.stats.label}>
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className={COMPONENT_STYLES.stats.sublabel}>
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
