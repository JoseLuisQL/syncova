import React, { useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useToastContext } from '../../contexts/ToastContext';

import CentrosAcopioSection from './CentrosAcopioSection';
import AlertasSection from './AlertasSection';
import ActividadSection from './ActividadSection';
import { LoadingState, ErrorState } from './LoadingStates';

const ChartSection = lazy(() => import('./ChartSection'));

const ChartSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-2xl border border-gray-100/80 p-6">
      <div className="h-[340px] bg-gray-50 rounded-xl animate-pulse" />
    </div>
    <div className="bg-white rounded-2xl border border-gray-100/80 p-6">
      <div className="h-[340px] bg-gray-50 rounded-xl animate-pulse" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { toast } = useToastContext();
  const toastRef = useRef(toast);
  
  useEffect(() => {
    toastRef.current = toast;
  });

  const {
    loading,
    error,
    refresh,
    movimientosMensuales,
    stockPorVacuna,
    hasData,
  } = useDashboard();

  const prevErrorRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      toastRef.current.error('Error en Dashboard', error);
    } else if (!error) {
      prevErrorRef.current = null;
    }
  }, [error]);

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
      toastRef.current.success('Datos actualizados correctamente');
    } catch {
      toastRef.current.error('No se pudieron actualizar los datos');
    }
  }, [refresh]);

  if (loading && !hasData) {
    return (
      <main className="min-h-screen bg-gray-50/60 px-4 sm:px-6 lg:px-8 py-8">
        <LoadingState />
      </main>
    );
  }

  if (error && !hasData) {
    return (
      <main className="min-h-screen bg-gray-50/60 px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState error={error} onRetry={handleRefresh} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/60">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Suspense fallback={<ChartSkeleton />}>
          <ChartSection
            movimientosMensuales={movimientosMensuales}
            stockPorVacuna={stockPorVacuna}
            isLoading={loading && !hasData}
          />
        </Suspense>

        <section 
          aria-label="Información detallada"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
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
