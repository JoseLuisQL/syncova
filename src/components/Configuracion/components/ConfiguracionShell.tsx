import React, { memo } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import type { ConfiguracionGroupDefinition, ConfiguracionGroupId } from '../types';
import { MODULE_LAYOUT } from '../../../styles/layout';
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
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-4xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <nav aria-label="Secciones de configuracion" className="border-b border-line-soft bg-white">
          <div className="flex min-h-12 flex-col gap-3 px-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex h-12 items-end gap-7">
              {groups.map((section) => {
                const isActive = section.id === activeGroupId;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onNavigate(section.id)}
                    className={`-mb-px inline-flex h-12 shrink-0 items-center border-b-2 px-0 text-base font-medium transition-colors focus:outline-none ${
                      isActive
                        ? 'border-brand text-brand'
                        : 'border-transparent text-muted-3 hover:text-ink'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    title={section.contextLabel}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 pb-3 lg:h-12 lg:pb-2">
              {hasPendingChanges ? (
                <span className="inline-flex h-9 items-center rounded-[9px] border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800">
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
        </nav>

        <div className="flex flex-col gap-4 p-4 sm:p-6">{children}</div>
      </div>
    </main>
  );
};

export default memo(ConfiguracionShell);
 