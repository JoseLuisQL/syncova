import React, { useEffect, useMemo, useState } from 'react';
import { Warning } from '@phosphor-icons/react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { ErrorAlert, EmptyState, Modal } from '../Establecimientos/components';
import { getGroupById } from './constants';
import { ConfiguracionGroupView, ConfiguracionShell, ConfiguracionSkeleton } from './components';
import { useConfiguracion } from './hooks/useConfiguracion';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import type { ConfiguracionGroupId } from './types';

const Configuracion: React.FC = () => {
  const { toast } = useToastContext();
  const { canAccessSection } = usePermissions();
  const { currentSubModule } = useCurrentRoute();
  const { navigateToModule } = useAppNavigation();
  const [pendingNavigationGroup, setPendingNavigationGroup] = useState<ConfiguracionGroupId | null>(null);

  const {
    groups,
    values,
    logo,
    isLoading,
    isRefreshing,
    error,
    lastLoadedAt,
    savingGroups,
    updateField,
    resetGroup,
    saveGroup,
    refresh,
    getGroupStats,
    getDirtyCount,
    hasPendingChanges,
    hasPendingChangesInGroup,
    uploadLogo,
    deleteLogo,
    runAlertGeneration,
    cleanupResolvedAlerts,
  } = useConfiguracion();

  const accessibleGroups = useMemo(
    () => groups.filter((group) => canAccessSection('configuracion', group.id)),
    [canAccessSection, groups],
  );

  const firstGroupId = accessibleGroups[0]?.id || 'identidad';
  const activeGroupId = useMemo(() => {
    const candidate = currentSubModule as ConfiguracionGroupId | null;
    if (!candidate) {
      return firstGroupId;
    }
    return accessibleGroups.some((group) => group.id === candidate) ? candidate : firstGroupId;
  }, [accessibleGroups, currentSubModule, firstGroupId]);

  const activeGroup = getGroupById(activeGroupId);
  const activeDirtyCount = getDirtyCount(activeGroupId);

  useEffect(() => {
    const shouldWarn = hasPendingChangesInGroup(activeGroupId);
    if (!shouldWarn) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeGroupId, hasPendingChangesInGroup]);

  const handleInternalNavigation = (groupId: ConfiguracionGroupId) => {
    if (groupId === activeGroupId) {
      return;
    }

    if (hasPendingChangesInGroup(activeGroupId)) {
      setPendingNavigationGroup(groupId);
      return;
    }

    navigateToModule('configuracion', groupId);
  };

  const handleConfirmNavigation = () => {
    if (!pendingNavigationGroup) {
      return;
    }

    resetGroup(activeGroupId);
    navigateToModule('configuracion', pendingNavigationGroup);
    setPendingNavigationGroup(null);
    toast.info('Cambios descartados', 'Se restauro el bloque actual antes de navegar.');
  };

  if (accessibleGroups.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-[980px] py-6">
          <EmptyState
            icon={Warning}
            title="Sin acceso a Configuracion"
            description="Tu rol actual no tiene bloques habilitados dentro del modulo."
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <ConfiguracionShell
        activeGroupId={activeGroupId}
        groups={accessibleGroups}
        hasPendingChanges={hasPendingChanges}
        isRefreshing={isRefreshing}
        onRefresh={() => void refresh()}
        onNavigate={handleInternalNavigation}
      >
        {error ? <ErrorAlert message={error} onRetry={() => void refresh()} /> : null}

        {isLoading || !activeGroup ? (
          <ConfiguracionSkeleton />
        ) : (
          <Routes>
            <Route index element={<Navigate to={firstGroupId} replace />} />
            {accessibleGroups.map((group) => (
              <Route
                key={group.id}
                path={group.id}
                element={
                  <ConfiguracionGroupView
                    group={group}
                    values={values}
                    logo={logo}
                    stats={getGroupStats(group.id)}
                    dirtyCount={getDirtyCount(group.id)}
                    isSaving={savingGroups[group.id]}
                    lastLoadedAt={lastLoadedAt}
                    onUpdateField={updateField}
                    onSaveGroup={async () => {
                      const result = await saveGroup(group.id);
                      if (result.success && result.updatedCount > 0) {
                        toast.success('Configuracion guardada', 'Los cambios del bloque actual quedaron persistidos.');
                      } else if (!result.success) {
                        toast.error('No se pudo guardar', 'Verifica la conexion y vuelve a intentarlo.');
                      }
                    }}
                    onResetGroup={() => {
                      const hadChanges = getDirtyCount(group.id) > 0;
                      resetGroup(group.id);
                      if (hadChanges) {
                        toast.info('Bloque restablecido', 'Se recuperaron los valores originales de esta vista.');
                      }
                    }}
                    onUploadLogo={uploadLogo}
                    onDeleteLogo={deleteLogo}
                    onRunAlertGeneration={runAlertGeneration}
                    onCleanupResolvedAlerts={cleanupResolvedAlerts}
                  />
                }
              />
            ))}
            <Route path="*" element={<Navigate to={firstGroupId} replace />} />
          </Routes>
        )}
      </ConfiguracionShell>

      <Modal
        isOpen={pendingNavigationGroup !== null}
        onClose={() => setPendingNavigationGroup(null)}
        title="Cambios pendientes"
        subtitle="Este bloque tiene datos sin guardar. Decide antes de cambiar de seccion."
        icon={Warning}
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              onClick={() => setPendingNavigationGroup(null)}
            >
              Seguir editando
            </button>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-sm font-medium text-white transition hover:from-rose-700 hover:to-red-700"
              onClick={handleConfirmNavigation}
            >
              Descartar y navegar
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[20px] border border-zinc-200 bg-zinc-50/70 p-4 text-sm text-zinc-600">
            El bloque actual tiene <span className="font-semibold text-zinc-950">{activeDirtyCount}</span> cambio(s) sin guardar.
          </div>
          <div className="rounded-[20px] border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
            Si continuas, se restauraran los valores originales del bloque actual.
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Configuracion;
 