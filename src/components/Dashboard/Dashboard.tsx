import React, { useEffect, useCallback, useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useToastContext } from '../../contexts/ToastContext';

import DashboardHeader from './DashboardHeader';
import StatCard from './StatCard';
import QuickActions from './QuickActions';
import ChartSection from './ChartSection';
import CentrosAcopioSection from './CentrosAcopioSection';
import AlertasSection from './AlertasSection';
import ActividadSection from './ActividadSection';
import { LoadingState, ErrorState } from './LoadingStates';
import { STAT_CARDS_CONFIG } from './constants';

const Dashboard: React.FC = () => {
  const { toast } = useToastContext();

  const {
    estadisticas,
    loading,
    error,
    lastUpdated,
    refresh,
    movimientosMensuales,
    stockPorVacuna,
    hasData,
    isStale,
  } = useDashboard();

  useEffect(() => {
    if (error) {
      toast.error('Error en Dashboard', error);
    }
  }, [error, toast]);

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      toast.success('Datos actualizados correctamente');
    } catch {
      toast.error('No se pudieron actualizar los datos');
    }
  }, [refresh, toast]);

  const statCards = useMemo(() => {
    if (!estadisticas) return [];

    return STAT_CARDS_CONFIG.map((config) => ({
      ...config,
      value: estadisticas[config.key as keyof typeof estadisticas] as number || 0,
    }));
  }, [estadisticas]);

  if (loading && !hasData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-6">
        <LoadingState />
      </main>
    );
  }

  if (error && !hasData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-6">
        <ErrorState error={error} onRetry={handleRefresh} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50/30 via-cyan-50/30 to-blue-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <DashboardHeader
          lastUpdated={lastUpdated}
          isStale={isStale}
          isLoading={loading}
          onRefresh={handleRefresh}
        />

        <section aria-label="Indicadores principales">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                colorScheme={stat.colorScheme}
                description={stat.description}
                isLoading={loading && !hasData}
              />
            ))}
          </div>
        </section>

        <QuickActions />

        <ChartSection
          movimientosMensuales={movimientosMensuales}
          stockPorVacuna={stockPorVacuna}
          isLoading={loading && !hasData}
        />

        <section 
          aria-label="Información detallada"
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          <CentrosAcopioSection />
          <AlertasSection />
          <ActividadSection />
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
