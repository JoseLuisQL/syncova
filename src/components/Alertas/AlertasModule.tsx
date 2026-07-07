import React, { useCallback, useMemo } from 'react';
import { CircleNotch, ArrowsClockwise } from '@phosphor-icons/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAlertas } from '../../hooks/useAlertas';
import { usePermissions } from '../../hooks/usePermissions';
import { useCurrentRoute } from '../../hooks/useRouting';
import { COMPONENT_STYLES, ALERTS_SECTIONS, SectionId } from './constants';
import { AlertsShell } from './components';
import DashboardAlertas from './DashboardAlertas';
import GestionAlertas from './GestionAlertas';
import ConfiguracionAlertas from './ConfiguracionAlertas';
import ReportesAlertas from './ReportesAlertas';

const AlertasModule: React.FC = () => {
  const { currentSubModule } = useCurrentRoute();
  const { canAccessSection } = usePermissions();
  const { alertas, stats, isLoading, error, refreshData } = useAlertas();

  const filteredSections = useMemo(
    () => ALERTS_SECTIONS.filter((section) => canAccessSection('alertas', section.id)),
    [canAccessSection],
  );

  const activeSection = useMemo<SectionId>(() => {
    const current = filteredSections.find((section) => section.routeSegment === currentSubModule || section.id === currentSubModule);
    return current?.id || 'dashboard';
  }, [currentSubModule, filteredSections]);

  const alertasSeguras = useMemo(() => (Array.isArray(alertas) ? alertas : []), [alertas]);

  const estadisticas = useMemo(() => {
    if (stats) {
      return {
        total: stats.total,
        noLeidas: stats.noLeidas,
        criticas: stats.porNivel.error,
        advertencias: stats.porNivel.warning,
        informativas: stats.porNivel.info,
        exitosas: stats.porNivel.success,
        hoy: alertasSeguras.filter((alerta) => {
          const hoy = new Date();
          const fechaAlerta = new Date(alerta.fechaCreacion);
          return fechaAlerta.toDateString() === hoy.toDateString();
        }).length,
        porTipo: stats.porTipo,
        porNivel: stats.porNivel,
      };
    }

    const total = alertasSeguras.length;
    const noLeidas = alertasSeguras.filter((alerta) => !alerta.leida).length;
    const criticas = alertasSeguras.filter((alerta) => alerta.nivel === 'error').length;
    const advertencias = alertasSeguras.filter((alerta) => alerta.nivel === 'warning').length;
    const informativas = alertasSeguras.filter((alerta) => alerta.nivel === 'info').length;
    const exitosas = alertasSeguras.filter((alerta) => alerta.nivel === 'success').length;

    return {
      total,
      noLeidas,
      criticas,
      advertencias,
      informativas,
      exitosas,
      hoy: alertasSeguras.filter((alerta) => {
        const hoy = new Date();
        const fechaAlerta = new Date(alerta.fechaCreacion);
        return fechaAlerta.toDateString() === hoy.toDateString();
      }).length,
      porTipo: {
        vencimiento: alertasSeguras.filter((alerta) => alerta.tipo === 'vencimiento').length,
        stock_bajo: alertasSeguras.filter((alerta) => alerta.tipo === 'stock_bajo').length,
        discrepancia: alertasSeguras.filter((alerta) => alerta.tipo === 'discrepancia').length,
        sistema: alertasSeguras.filter((alerta) => alerta.tipo === 'sistema').length,
      },
      porNivel: { error: criticas, warning: advertencias, info: informativas, success: exitosas },
    };
  }, [alertasSeguras, stats]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  if (isLoading && alertasSeguras.length === 0 && !error) {
    return (
      <main className={COMPONENT_STYLES.pageBackground}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-4xl border border-zinc-200 bg-white px-4 py-8 shadow-sm sm:px-8 sm:py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
              <CircleNotch className="h-6 w-6 animate-spin" weight="bold" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-900">Cargando módulo de alertas</p>
              <p className="mt-1 text-sm text-zinc-500">Preparando estadísticas y alertas activas.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AlertsShell
      activeSection={activeSection}
      sections={filteredSections}
      action={(
        <>
          {estadisticas.noLeidas > 0 ? (
            <span className={COMPONENT_STYLES.badge.danger}>
              {estadisticas.noLeidas} sin leer
            </span>
          ) : null}
          <button type="button" onClick={handleRefresh} disabled={isLoading} className={COMPONENT_STYLES.button.secondary}>
            {isLoading ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : <ArrowsClockwise className="h-4 w-4" weight="bold" />}
            <span>Actualizar</span>
          </button>
        </>
      )}
    >
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route
          path="dashboard"
          element={(
            <DashboardAlertas
              alertas={alertasSeguras}
              estadisticas={estadisticas}
              isLoading={isLoading}
              error={error}
            />
          )}
        />
        <Route
          path="alertas"
          element={<GestionAlertas onRefresh={handleRefresh} />}
        />
        <Route
          path="reportes"
          element={(
            <ReportesAlertas
              alertas={alertasSeguras}
              isLoading={isLoading}
            />
          )}
        />
        <Route path="configuracion" element={<ConfiguracionAlertas />} />
        <Route path="*" element={<Navigate to={filteredSections[0]?.routeSegment || 'dashboard'} replace />} />
      </Routes>
    </AlertsShell>
  );
};

export default AlertasModule;
 