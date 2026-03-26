import React, { memo, useMemo } from 'react';
import { ArrowCircleDown, ArrowsLeftRight, ArrowCircleUp, Package } from '@phosphor-icons/react';
import { StatsGrid } from '../../Inventario/components/SharedComponents';

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

const KardexEstadisticasComponent: React.FC<KardexEstadisticasProps> = ({ estadisticas, loading }) => {
  const stats = useMemo(
    () => [
      {
        key: 'ingresos',
        label: 'Ingresos',
        value: estadisticas?.totalIngresos ?? 0,
        icon: ArrowCircleUp,
        color: 'success' as const,
      },
      {
        key: 'salidas',
        label: 'Salidas',
        value: estadisticas?.totalSalidas ?? 0,
        icon: ArrowCircleDown,
        color: 'danger' as const,
      },
      {
        key: 'transferencias',
        label: 'Transferencias',
        value: estadisticas?.totalTransferencias ?? 0,
        icon: ArrowsLeftRight,
        color: 'secondary' as const,
      },
      {
        key: 'saldoActual',
        label: 'Saldo actual',
        value: estadisticas?.saldoActualTotal ?? 0,
        icon: Package,
        color: 'primary' as const,
      },
    ],
    [estadisticas],
  );

  return <StatsGrid stats={stats} isLoading={loading} />;
};

export const KardexEstadisticas = memo(KardexEstadisticasComponent);
KardexEstadisticas.displayName = 'KardexEstadisticas';
 