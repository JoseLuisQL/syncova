import React, { memo, useMemo } from 'react';
import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, Package2 } from 'lucide-react';
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
        icon: ArrowUpCircle,
        color: 'success' as const,
      },
      {
        key: 'salidas',
        label: 'Salidas',
        value: estadisticas?.totalSalidas ?? 0,
        icon: ArrowDownCircle,
        color: 'danger' as const,
      },
      {
        key: 'transferencias',
        label: 'Transferencias',
        value: estadisticas?.totalTransferencias ?? 0,
        icon: ArrowRightLeft,
        color: 'secondary' as const,
      },
      {
        key: 'saldoActual',
        label: 'Saldo actual',
        value: estadisticas?.saldoActualTotal ?? 0,
        icon: Package2,
        color: 'primary' as const,
      },
    ],
    [estadisticas],
  );

  return <StatsGrid stats={stats} isLoading={loading} />;
};

export const KardexEstadisticas = memo(KardexEstadisticasComponent);
KardexEstadisticas.displayName = 'KardexEstadisticas';
