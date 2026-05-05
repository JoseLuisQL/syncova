import React, { useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useDashboard } from '../../hooks/useDashboard';
import { useToastContext } from '../../contexts/ToastContext';
import { MODULE_LAYOUT } from '../../styles/layout';

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
        <motion.main key="error" {...fadeVariants} className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState error={error} onRetry={handleRefresh} />
        </motion.main>
      ) : (
        <motion.main 
          key="content"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeVariants}
          className="min-h-screen relative bg-slate-50"
        >
          <div className={`${MODULE_LAYOUT.fullWidth} ${MODULE_LAYOUT.pageSpacingX} py-8 space-y-6 relative z-10`}>
            
            {/* 1. Metrics Row */}
            <MetricsSection stats={estadisticas} isLoading={loading && !hasData} />

            {/* 2. Charts and Planning Row */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <Suspense fallback={<div className="bg-white rounded-md border border-zinc-200 p-6 h-[400px] animate-pulse" />}>
                  <ChartSection
                    movimientosMensuales={movimientosMensuales}
                    isLoading={loading && !hasData}
                  />
                </Suspense>
              </div>
              <div className="lg:col-span-4">
                <StockAvailabilitySection 
                  data={stockPorVacuna} 
                  isLoading={loading && !hasData} 
                />
              </div>
              <div className="lg:col-span-3">
                <PermisosPlanificacion />
              </div>
            </section>

            {/* 3. Bottom Row */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
