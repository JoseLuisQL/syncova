import React, { useEffect, useCallback, useRef, Suspense, lazy, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { ArrowsClockwise } from '@phosphor-icons/react';
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
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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
    lastUpdated,
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

  const formattedSyncTime = useMemo(() => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [lastUpdated]);

  const scopeDescription = useMemo(() => {
    if (isResponsable && user?.centroAcopio?.nombre) {
      return `Centro de Acopio ${user.centroAcopio.nombre}`;
    }
    return 'DISA Apurímac II · Red de Cadena de Frío e Inmunizaciones';
  }, [isResponsable, user]);

  return (
    <AnimatePresence mode="wait">
      {loading && !hasData ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <DashboardLoader />
        </motion.div>
      ) : error && !hasData ? (
        <motion.main
          {...fadeVariants}
          key="error"
          className="min-h-screen bg-app px-4 py-8 sm:px-6 lg:px-8"
        >
          <ErrorState error={error} onRetry={handleRefresh} />
        </motion.main>
      ) : (
        <motion.main
          key="content"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeVariants}
          className="relative min-h-[calc(100dvh-4rem)] bg-app text-ink"
        >
          <div className="relative z-10 space-y-4 px-4 py-3 sm:px-5">
            {/* Barra de contexto y sincronización */}
            <div className="flex flex-col justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 shadow-xs sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base font-semibold tracking-tight text-ink">
                    Panel de Control Operativo
                  </h1>
                  <span className="text-muted" aria-hidden="true">·</span>
                  <span className="truncate text-xs text-muted-2">
                    {scopeDescription}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {formattedSyncTime && (
                  <span className="font-mono text-xs text-muted tabular-nums">
                    Sincronizado {formattedSyncTime}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface-soft px-3 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  <ArrowsClockwise
                    size={13}
                    weight="bold"
                    className={loading ? 'animate-spin text-brand' : ''}
                  />
                  {loading ? 'Sincronizando...' : 'Actualizar datos'}
                </button>
              </div>
            </div>

            {/* Indicadores clave reales */}
            <MetricsSection
              stats={estadisticas}
              stockPorVacuna={stockPorVacuna}
              isLoading={loading && !hasData}
            />

            {/* Bloque analítico: Flujo mensual, Disponibilidad de stock y Permisos/Planificación */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <Suspense
                  fallback={
                    <div className="h-[360px] animate-pulse rounded-xl border border-line bg-surface p-5" />
                  }
                >
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
                <PermisosPlanificacion stats={estadisticas} />
              </div>
            </section>

            {/* Bloque operativo y auditoría: Centros/Establecimientos, Alertas y Actividad */}
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
