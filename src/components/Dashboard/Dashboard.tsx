import React, { useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useDashboard } from '../../hooks/useDashboard';
import { useToastContext } from '../../contexts/ToastContext';

import CentrosAcopioSection from './CentrosAcopioSection';
import EstablecimientosSection from './EstablecimientosSection';
import AlertasSection from './AlertasSection';
import ActividadSection from './ActividadSection';
import QuickPermissionsSection from './QuickPermissionsSection';
import { ErrorState } from './LoadingStates';
import { DashboardLoader } from './DashboardLoader';
import { useAuth } from '../../contexts/AuthContext';

const ChartSection = lazy(() => import('./ChartSection'));

const ChartSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-[24px] border border-zinc-100/80 p-6">
      <div className="h-[340px] bg-zinc-50 rounded-xl animate-pulse" />
    </div>
    <div className="bg-white rounded-[24px] border border-zinc-100/80 p-6">
      <div className="h-[340px] bg-zinc-50 rounded-xl animate-pulse" />
    </div>
  </div>
);

const fadeVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isResponsable = user?.rol === 'responsable_acopio';
  const isAdmin = user?.rol === 'administrador';
  
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

  return (
    <AnimatePresence mode="wait">
      {loading && !hasData ? (
        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DashboardLoader />
        </motion.div>
      ) : error && !hasData ? (
        <motion.main key="error" {...fadeVariants} className="min-h-screen bg-zinc-50/60 px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState error={error} onRetry={handleRefresh} />
        </motion.main>
      ) : (
        <motion.main 
          key="content"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeVariants}
          className="min-h-screen relative bg-[#fcfcfc]"
        >
          {/* Subtle background element (Creative Frontend Aesthetics) */}
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-zinc-100/80 to-transparent pointer-events-none" />
          
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10 max-w-7xl mx-auto">
            {/* ═══ Quick Permissions — Admin only, first visible section ═══ */}
            {isAdmin && <QuickPermissionsSection />}

            <Suspense fallback={<ChartSkeleton />}>
              <ChartSection
                movimientosMensuales={movimientosMensuales}
                stockPorVacuna={stockPorVacuna}
                isLoading={loading && !hasData}
              />
            </Suspense>

            <section 
              aria-label="Información detallada"
              className={`grid grid-cols-1 gap-6 pt-4 ${isResponsable ? 'lg:grid-cols-2 max-w-5xl mx-auto' : 'lg:grid-cols-3'}`}
            >
              <motion.div className="h-full" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                {isResponsable ? <EstablecimientosSection /> : <CentrosAcopioSection />}
              </motion.div>
              <motion.div className="h-full" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                <AlertasSection />
              </motion.div>
              {!isResponsable && (
                <motion.div className="h-full" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                  <ActividadSection />
                </motion.div>
              )}
            </section>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;
