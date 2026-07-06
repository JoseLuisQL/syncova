import React, { useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useDashboard } from '../../hooks/useDashboard';
import { useToastContext } from '../../contexts/ToastContext';

import CentrosAcopioSection from './CentrosAcopioSection';
import EstablecimientosSection from './EstablecimientosSection';
import AlertasSection from './AlertasSection';
import ActividadSection from './ActividadSection';
import MetricsSection from './MetricsSection';
import StockAvailabilitySection from './StockAvailabilitySection';
import PermisosPlanificacion from './PermisosPlanificacion';

import { ErrorState } from './LoadingStates';
import { DashboardLoader } from './DashboardLoader';
import { useAuth } from '../../contexts/AuthContext';

const ChartSection = lazy(() => import('./ChartSection'));

const fadeVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isResponsable = user?.rol === 'responsable_acopio';
  
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
    estadisticas,
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

  return (
    <AnimatePresence mode="wait">
      {loading && !hasData ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DashboardLoader />
        </motion.div>
      ) : error && !hasData ? (
        <motion.main {...fadeVariants} key="error" className="min-h-screen bg-neutral px-4 py-8 sm:px-6 lg:px-8">
          <ErrorState error={error} onRetry={handleRefresh} />
        </motion.main>
      ) : (
        <motion.main 
          key="content"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeVariants}
          className="relative min-h-[calc(100dvh-4rem)] bg-[#f0eff4] text-[#111827]"
        >
          <div className="relative z-10 space-y-4 px-4 py-4 sm:px-5">
            <MetricsSection stats={estadisticas} isLoading={loading && !hasData} />

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <Suspense fallback={<div className="h-[400px] animate-pulse border border-zinc-200 bg-white p-5" />}>
                  <ChartSection
                    movimientosMensuales={movimientosMensuales}
                    isLoading={loading && !hasData}
                  />
                </Suspense>
              </div>
              <div className="lg:col-span-3">
                <StockAvailabilitySection 
                  data={stockPorVacuna} 
                  isLoading={loading && !hasData} 
                />
              </div>
              <div className="lg:col-span-3">
                <PermisosPlanificacion />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                {isResponsable ? <EstablecimientosSection /> : <CentrosAcopioSection />}
              </div>
              <div className="lg:col-span-4">
                <AlertasSection />
              </div>
              <div className="lg:col-span-3">
                <ActividadSection />
              </div>
            </section>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;
