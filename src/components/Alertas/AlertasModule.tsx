import React, { useCallback, useMemo, useState } from 'react';
import {
  CircleNotch,
  ArrowsClockwise,
  Plus,
  Checks,
  Lightning,
} from '@phosphor-icons/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAlertas } from '../../hooks/useAlertas';
import { useAlertasGlobal } from '../../contexts/AlertasContext';
import { useToastContext } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useCurrentRoute } from '../../hooks/useRouting';
import { AlertasService } from '../../services/alertasService';
import { Alerta } from '../../types';
import { COMPONENT_STYLES, ALERTS_SECTIONS, SectionId, loadAlertasConfig } from './constants';
import {
  AlertDetailModal,
  AlertsShell,
  NuevaAlertaModal,
} from './components';
import GestionAlertas from './GestionAlertas';
import ConfiguracionAlertas from './ConfiguracionAlertas';
import ReportesAlertas from './ReportesAlertas';

const AlertasModule: React.FC = () => {
  const { currentSubModule } = useCurrentRoute();
  const { canAccessSection } = usePermissions();
  const { toast } = useToastContext();
  const { refresh: refreshGlobalAlertas } = useAlertasGlobal();

  const {
    alertas,
    stats,
    isLoading,
    isCreating,
    error,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    deleteMultipleAlertas,
    markAsRead,
    markMultipleAsRead,
    markMultipleAsUnread,
    refreshData,
  } = useAlertas();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedAlerta, setInspectedAlerta] = useState<Alerta | null>(null);
  const [isGeneratingAuto, setIsGeneratingAuto] = useState(false);

  const filteredSections = useMemo(
    () => ALERTS_SECTIONS.filter((section) => canAccessSection('alertas', section.id)),
    [canAccessSection],
  );

  const activeSection = useMemo<SectionId>(() => {
    const current = filteredSections.find(
      (section) => section.routeSegment === currentSubModule || section.id === currentSubModule,
    );
    return current?.id || 'alertas';
  }, [currentSubModule, filteredSections]);

  const alertasSeguras = useMemo(() => (Array.isArray(alertas) ? alertas : []), [alertas]);

  const estadisticas = useMemo(() => {
    const total = alertasSeguras.length;
    const noLeidas = alertasSeguras.filter((alerta) => !alerta.leida).length;
    const criticas = alertasSeguras.filter((alerta) => alerta.nivel === 'error').length;
    const advertencias = alertasSeguras.filter((alerta) => alerta.nivel === 'warning').length;
    const informativas = alertasSeguras.filter((alerta) => alerta.nivel === 'info').length;
    const exitosas = alertasSeguras.filter((alerta) => alerta.nivel === 'success').length;
    const hoy = alertasSeguras.filter((alerta) => {
      const ahora = new Date();
      const fechaAlerta = new Date(alerta.fechaCreacion);
      return fechaAlerta.toDateString() === ahora.toDateString();
    }).length;

    const porTipo = {
      vencimiento: alertasSeguras.filter((alerta) => alerta.tipo === 'vencimiento').length,
      stock_bajo: alertasSeguras.filter((alerta) => alerta.tipo === 'stock_bajo').length,
      discrepancia: alertasSeguras.filter((alerta) => alerta.tipo === 'discrepancia').length,
      sistema: alertasSeguras.filter((alerta) => alerta.tipo === 'sistema').length,
    };

    if (stats && stats.total > 0 && alertasSeguras.length === 0) {
      return {
        total: stats.total,
        noLeidas: stats.noLeidas,
        criticas: stats.porNivel.error,
        advertencias: stats.porNivel.warning,
        informativas: stats.porNivel.info,
        exitosas: stats.porNivel.success,
        hoy,
        porTipo: stats.porTipo,
        porNivel: stats.porNivel,
      };
    }

    return {
      total,
      noLeidas,
      criticas,
      advertencias,
      informativas,
      exitosas,
      hoy,
      porTipo,
      porNivel: { error: criticas, warning: advertencias, info: informativas, success: exitosas },
    };
  }, [alertasSeguras, stats]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshData(), refreshGlobalAlertas()]);
  }, [refreshData, refreshGlobalAlertas]);

  const handleMarcarLeida = useCallback(
    async (id: string) => {
      try {
        await markAsRead(id);
        setInspectedAlerta((prev) => (prev && prev.id === id ? { ...prev, leida: true } : prev));
        await refreshGlobalAlertas();
        toast.success('Alerta atendida', 'La alerta fue marcada como atendida.', { duration: 2200 });
      } catch (err) {
        console.error('Error al marcar como leída:', err);
        toast.error('No se pudo actualizar', 'Hubo un problema al actualizar la alerta.', { duration: 3000 });
      }
    },
    [markAsRead, refreshGlobalAlertas, toast],
  );

  const handleMarcarNoLeida = useCallback(
    async (id: string) => {
      try {
        await updateAlerta(id, { leida: false });
        setInspectedAlerta((prev) => (prev && prev.id === id ? { ...prev, leida: false } : prev));
        await refreshGlobalAlertas();
        toast.success('Alerta reabierta', 'La alerta volvió a estado pendiente.', { duration: 2200 });
      } catch (err) {
        console.error('Error al reabrir alerta:', err);
        toast.error('No se pudo actualizar', 'Hubo un problema al cambiar el estado.', { duration: 3000 });
      }
    },
    [refreshGlobalAlertas, toast, updateAlerta],
  );

  const handleMarcarMultiplesLeidas = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      try {
        await markMultipleAsRead(ids);
        await refreshGlobalAlertas();
        toast.success('Alertas atendidas', `Se marcaron ${ids.length} alerta(s) como atendidas.`, { duration: 2500 });
      } catch (err) {
        console.error('Error al marcar múltiples alertas:', err);
        toast.error('No se pudo actualizar', 'Hubo un problema al procesar la selección.', { duration: 3000 });
      }
    },
    [markMultipleAsRead, refreshGlobalAlertas, toast],
  );

  const handleMarcarMultiplesNoLeidas = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      try {
        await markMultipleAsUnread(ids);
        await refreshGlobalAlertas();
        toast.success('Alertas reabiertas', `Se reabrieron ${ids.length} alerta(s) como pendientes.`, { duration: 2500 });
      } catch (err) {
        console.error('Error al reabrir múltiples alertas:', err);
        toast.error('No se pudo actualizar', 'Hubo un problema al reabrir la selección.', { duration: 3000 });
      }
    },
    [markMultipleAsUnread, refreshGlobalAlertas, toast],
  );

  const handleMarcarTodasPendientesLeidas = useCallback(async () => {
    const unreadIds = alertasSeguras.filter((a) => !a.leida).map((a) => a.id);
    if (unreadIds.length === 0) return;
    await handleMarcarMultiplesLeidas(unreadIds);
  }, [alertasSeguras, handleMarcarMultiplesLeidas]);

  const handleEliminar = useCallback(
    async (id: string) => {
      try {
        await deleteAlerta(id);
        await refreshGlobalAlertas();
        toast.success('Alerta eliminada', 'El registro fue eliminado correctamente.', { duration: 2200 });
      } catch (err) {
        console.error('Error al eliminar alerta:', err);
        toast.error('No se pudo eliminar', 'Hubo un problema al eliminar la alerta.', { duration: 3000 });
      }
    },
    [deleteAlerta, refreshGlobalAlertas, toast],
  );

  const handleEliminarMultiples = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      try {
        await deleteMultipleAlertas(ids);
        await refreshGlobalAlertas();
        toast.success('Alertas eliminadas', `Se eliminaron ${ids.length} alerta(s).`, { duration: 2500 });
      } catch (err) {
        console.error('Error al eliminar alertas:', err);
        toast.error('No se pudo eliminar', 'Hubo un problema al eliminar la selección.', { duration: 3000 });
      }
    },
    [deleteMultipleAlertas, refreshGlobalAlertas, toast],
  );

  const handleCrearAlerta = useCallback(
    async (data: { tipo: string; nivel: string; titulo: string; descripcion: string }) => {
      try {
        await createAlerta({
          tipo: data.tipo as 'vencimiento' | 'stock_bajo' | 'discrepancia' | 'sistema',
          nivel: data.nivel as 'error' | 'warning' | 'info' | 'success',
          titulo: data.titulo,
          descripcion: data.descripcion,
        });
        setShowCreateModal(false);
        await refreshGlobalAlertas();
        toast.success('Alerta registrada', 'El nuevo aviso operativo ya está activo en la bandeja.', {
          duration: 2500,
        });
      } catch (err) {
        console.error('Error al crear alerta:', err);
        toast.error('No se pudo registrar', 'Verifica los datos e inténtalo nuevamente.', { duration: 3500 });
      }
    },
    [createAlerta, refreshGlobalAlertas, toast],
  );

  const handleGenerarAutomaticas = useCallback(async () => {
    setIsGeneratingAuto(true);
    try {
      const cfg = loadAlertasConfig();
      const result = await AlertasService.generarAutomaticas(cfg.diasAnticipacion, cfg.stockMinimo);
      await handleRefresh();
      if (result.alertasGeneradas > 0) {
        toast.success(
          'Inventario analizado',
          `Se detectaron y generaron ${result.alertasGeneradas} nuevas alertas.`,
          { duration: 3000 },
        );
      } else {
        toast.success(
          'Inventario sin novedades',
          'No se detectaron lotes ni stocks fuera de los umbrales configurados.',
          { duration: 2500 },
        );
      }
    } catch (err) {
      console.error('Error al analizar inventario:', err);
      toast.error('No se pudo analizar', 'Hubo un problema al ejecutar el diagnóstico automático.', {
        duration: 3500,
      });
    } finally {
      setIsGeneratingAuto(false);
    }
  }, [handleRefresh, toast]);

  if (isLoading && alertasSeguras.length === 0 && !error) {
    return (
      <main className={COMPONENT_STYLES.pageBackground}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface px-6 py-8">
            <CircleNotch className="h-6 w-6 animate-spin text-brand" weight="bold" />
            <div className="text-center">
              <p className="text-sm font-semibold text-ink">Sincronizando centro de alertas</p>
              <p className="mt-0.5 text-xs text-muted-2">Cargando incidentes activos y métricas operativas...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <AlertsShell
        activeSection={activeSection}
        sections={filteredSections}
        summaryMeta={{
          total: estadisticas.total,
          noLeidas: estadisticas.noLeidas,
          criticas: estadisticas.criticas,
          hoy: estadisticas.hoy,
        }}
        action={(
          <>
            <button
              type="button"
              onClick={handleGenerarAutomaticas}
              disabled={isGeneratingAuto || isLoading}
              className={COMPONENT_STYLES.button.secondary}
              title="Analizar lotes por vencer y stock crítico en inventario"
            >
              {isGeneratingAuto ? (
                <CircleNotch className="h-4 w-4 animate-spin text-brand" weight="bold" />
              ) : (
                <Lightning className="h-4 w-4 text-brand" weight="fill" />
              )}
              <span>{isGeneratingAuto ? 'Analizando...' : 'Analizar inventario'}</span>
            </button>

            {estadisticas.noLeidas > 0 ? (
              <button
                type="button"
                onClick={handleMarcarTodasPendientesLeidas}
                disabled={isLoading}
                className={COMPONENT_STYLES.button.secondary}
                title="Marcar todas las alertas pendientes como atendidas"
              >
                <Checks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" weight="bold" />
                <span>Atender todas ({estadisticas.noLeidas})</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className={COMPONENT_STYLES.button.secondary}
              aria-label="Actualizar alertas"
              title="Actualizar bandeja"
            >
              {isLoading ? (
                <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
              ) : (
                <ArrowsClockwise className="h-4 w-4" weight="bold" />
              )}
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className={COMPONENT_STYLES.button.primary}
            >
              <Plus className="h-4 w-4" weight="bold" />
              <span>Nueva alerta</span>
            </button>
          </>
        )}
      >
        <Routes>
          <Route path="/" element={<Navigate to="alertas" replace />} />
          <Route path="dashboard" element={<Navigate to="../alertas" replace />} />
          <Route
            path="alertas"
            element={(
              <GestionAlertas
                alertas={alertasSeguras}
                isLoading={isLoading}
                onMarcarLeida={handleMarcarLeida}
                onMarcarNoLeida={handleMarcarNoLeida}
                onEliminar={handleEliminar}
                onMarcarMultiplesLeidas={handleMarcarMultiplesLeidas}
                onMarcarMultiplesNoLeidas={handleMarcarMultiplesNoLeidas}
                onEliminarMultiples={handleEliminarMultiples}
                onInspect={setInspectedAlerta}
                onGenerarAutomaticas={handleGenerarAutomaticas}
              />
            )}
          />
          <Route
            path="reportes"
            element={(
              <ReportesAlertas
                alertas={alertasSeguras}
                isLoading={isLoading}
                onInspect={setInspectedAlerta}
              />
            )}
          />
          <Route
            path="configuracion"
            element={(
              <ConfiguracionAlertas
                totalLeidas={Math.max(0, estadisticas.total - estadisticas.noLeidas)}
                onRefreshModule={handleRefresh}
              />
            )}
          />
          <Route
            path="*"
            element={<Navigate to={filteredSections[0]?.routeSegment || 'alertas'} replace />}
          />
        </Routes>
      </AlertsShell>

      <NuevaAlertaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCrear={handleCrearAlerta}
        isCreating={isCreating}
      />

      <AlertDetailModal
        alerta={inspectedAlerta}
        onClose={() => setInspectedAlerta(null)}
        onMarcarLeida={handleMarcarLeida}
        onMarcarNoLeida={handleMarcarNoLeida}
        onEliminar={handleEliminar}
      />
    </>
  );
};

export default AlertasModule;