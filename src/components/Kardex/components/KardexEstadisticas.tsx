import React, { memo } from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Package,
  Loader2,
} from 'lucide-react';

interface Estadisticas {
  totalIngresos: number;
  totalSalidas: number;
  totalTransferencias: number;
  saldoActualTotal: number;
}

interface KardexEstadisticasProps {
  estadisticas: Estadisticas | null;
  loading: boolean;
}

const statsConfig = [
  {
    key: 'ingresos',
    label: 'Ingresos',
    getValue: (e: Estadisticas) => e.totalIngresos,
    icon: ArrowUpCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-500',
  },
  {
    key: 'salidas',
    label: 'Salidas',
    getValue: (e: Estadisticas) => e.totalSalidas,
    icon: ArrowDownCircle,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    iconBg: 'bg-rose-500',
  },
  {
    key: 'transferencias',
    label: 'Transferencias',
    getValue: (e: Estadisticas) => e.totalTransferencias,
    icon: ArrowRightLeft,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    iconBg: 'bg-cyan-500',
  },
  {
    key: 'saldo',
    label: 'Stock Actual',
    getValue: (e: Estadisticas) => e.saldoActualTotal,
    icon: Package,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    iconBg: 'bg-teal-500',
  },
];

export const KardexEstadisticas: React.FC<KardexEstadisticasProps> = memo(({
  estadisticas,
  loading,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        const value = estadisticas ? stat.getValue(estadisticas) : 0;

        return (
          <div
            key={stat.key}
            className={`${stat.bg} rounded-xl px-4 py-3 border border-gray-100/50`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.iconBg} rounded-lg`}>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.color}`}>
                  {loading ? '—' : value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

KardexEstadisticas.displayName = 'KardexEstadisticas';
