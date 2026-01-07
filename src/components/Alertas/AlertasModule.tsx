import React, { useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAlertas } from '../../hooks/useAlertas';
import { usePermissions } from '../../hooks/usePermissions';
import { COMPONENT_STYLES, ALERTS_SECTIONS } from './constants';
import { AlertasHeader } from './components';
import DashboardAlertas from './DashboardAlertas';
import GestionAlertas from './GestionAlertas';
import ConfiguracionAlertas from './ConfiguracionAlertas';
import ReportesAlertas from './ReportesAlertas';

const AlertasModule: React.FC = () => {
  const { canAccessSection } = usePermissions();
  const {
    alertas,
    stats,
    isLoading,
    error,
    refreshData,
  } = useAlertas();

  // Filtrar secciones según permisos
  const filteredSections = useMemo(() => {
    return ALERTS_SECTIONS.filter(section => canAccessSection('alertas', section.id));
  }, [canAccessSection]);

  const alertasSeguras = useMemo(() => 
    Array.isArray(alertas) ? alertas : [], 
    [alertas]
  );

  const estadisticas = useMemo(() => {
    if (stats) {
      return {
        total: stats.total,
        noLeidas: stats.noLeidas,
        criticas: stats.porNivel.error,
        advertencias: stats.porNivel.warning,
        informativas: stats.porNivel.info,
        exitosas: stats.porNivel.success,
        hoy: alertasSeguras.filter(a => {
          const hoy = new Date();
          const fechaAlerta = new Date(a.fechaCreacion);
          return fechaAlerta.toDateString() === hoy.toDateString();
        }).length,
        porTipo: stats.porTipo,
        porNivel: stats.porNivel,
      };
    }

    const total = alertasSeguras.length;
    const noLeidas = alertasSeguras.filter(a => !a.leida).length;
    const criticas = alertasSeguras.filter(a => a.nivel === 'error').length;
    const advertencias = alertasSeguras.filter(a => a.nivel === 'warning').length;
    const informativas = alertasSeguras.filter(a => a.nivel === 'info').length;
    const exitosas = alertasSeguras.filter(a => a.nivel === 'success').length;

    return {
      total,
      noLeidas,
      criticas,
      advertencias,
      informativas,
      exitosas,
      hoy: alertasSeguras.filter(a => {
        const hoy = new Date();
        const fechaAlerta = new Date(a.fechaCreacion);
        return fechaAlerta.toDateString() === hoy.toDateString();
      }).length,
      porTipo: {
        vencimiento: alertasSeguras.filter(a => a.tipo === 'vencimiento').length,
        stock_bajo: alertasSeguras.filter(a => a.tipo === 'stock_bajo').length,
        discrepancia: alertasSeguras.filter(a => a.tipo === 'discrepancia').length,
        sistema: alertasSeguras.filter(a => a.tipo === 'sistema').length,
      },
      porNivel: { error: criticas, warning: advertencias, info: informativas, success: exitosas },
    };
  }, [alertasSeguras, stats]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      <AlertasHeader
        noLeidas={estadisticas.noLeidas}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        sections={filteredSections}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <DashboardAlertas
                  alertas={alertasSeguras}
                  estadisticas={estadisticas}
                  isLoading={isLoading}
                  error={error}
                />
              }
            />
            <Route
              path="alertas"
              element={
                <GestionAlertas onRefresh={handleRefresh} />
              }
            />
            <Route
              path="reportes"
              element={
                <ReportesAlertas
                  alertas={alertasSeguras}
                  isLoading={isLoading}
                />
              }
            />
            <Route
              path="configuracion"
              element={<ConfiguracionAlertas />}
            />
          </Routes>
        </div>
      </div>
    </main>
  );
};

export default AlertasModule;
