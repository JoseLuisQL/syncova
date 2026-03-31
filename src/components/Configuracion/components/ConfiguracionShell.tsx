import React, { memo } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import type { ConfiguracionGroupDefinition, ConfiguracionGroupId } from '../types';
import { CONFIG_STYLES } from '../styles';

interface ConfiguracionShellProps {
  activeGroupId: ConfiguracionGroupId;
  groups: ConfiguracionGroupDefinition[];
  hasPendingChanges: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onNavigate: (groupId: ConfiguracionGroupId) => void;
  children: React.ReactNode;
}

const ConfiguracionShell: React.FC<ConfiguracionShellProps> = ({
  activeGroupId,
  groups,
  hasPendingChanges,
  isRefreshing,
  onRefresh,
  onNavigate,
  children,
}) => {
  return (
    <main className={CONFIG_STYLES.page}>
      <div className="mx-auto flex max-w-[1120px] flex-col gap-3">
        <section className="overflow-hidden bg-transparent">
          <div className="border-b border-zinc-200 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className={CONFIG_STYLES.title}>Configuracion</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {hasPendingChanges ? (
                  <span className="inline-flex h-9 items-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800">
                    Cambios sin guardar
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={onRefresh}
                  className={CONFIG_STYLES.buttonSecondary}
                  disabled={isRefreshing}
                >
                  <ArrowsClockwise className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
              </div>
            </div>
          </div>

          <nav aria-label="Secciones de configuracion" className="px-4 py-3 sm:px-5">
            <div className="flex flex-wrap gap-2">
              {groups.map((section) => {
                const isActive = section.id === activeGroupId;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onNavigate(section.id)}
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                      isActive
                        ? 'border-zinc-300 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </section>

        <section className="bg-transparent p-4 sm:p-5">
          <div className="space-y-3">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default memo(ConfiguracionShell);
 