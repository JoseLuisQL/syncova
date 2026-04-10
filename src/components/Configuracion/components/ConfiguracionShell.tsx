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
        <section className="bg-transparent border-b border-zinc-100 pb-2">
          <div className="border-b border-zinc-200/90 px-4 py-4 sm:px-5 lg:px-6 mb-2">
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

          <nav aria-label="Secciones de configuracion" className="px-3 py-3 sm:px-4">
            <div className="flex flex-wrap gap-2">
              {groups.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeGroupId;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onNavigate(section.id)}
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                      isActive
                        ? 'border-teal-200 bg-teal-50/80 shadow-sm ring-1 ring-teal-100'
                        : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    title={section.contextLabel}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                       <span
                        className={`text-[0.85rem] font-semibold tracking-tight transition-colors ${
                          isActive ? 'text-teal-900' : 'text-zinc-700 group-hover:text-zinc-900'
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>
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
 