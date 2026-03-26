import React, { memo } from 'react';
import { Bell, ArrowsClockwise, CircleNotch, Icon as PhosphorIcon } from '@phosphor-icons/react';
import { COMPONENT_STYLES, ALERTS_SECTIONS } from '../constants';
import { useAppNavigation, useCurrentRoute } from '../../../hooks/useRouting';

interface SectionItem {
  id: string;
  label: string;
  icon: PhosphorIcon;
}

interface AlertasHeaderProps {
  noLeidas: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  sections?: SectionItem[];
}

export const AlertasHeader: React.FC<AlertasHeaderProps> = memo(({
  noLeidas,
  isLoading = false,
  onRefresh,
  sections,
}) => {
  const { navigateToModule } = useAppNavigation();
  const { currentSubModule } = useCurrentRoute();
  const activeSection = currentSubModule || 'dashboard';
  const displaySections = sections || ALERTS_SECTIONS;

  return (
    <>
      <header className="bg-white border-b border-zinc-200/60">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
                <Bell className="h-7 w-7 text-white" aria-hidden="true" weight="fill" />
              <div>
                <h1 className={COMPONENT_STYLES.header.title}>
                  Sistema de Alertas
                </h1>
                <p className={COMPONENT_STYLES.header.subtitle}>
                  Monitoreo y gestion de notificaciones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {noLeidas > 0 && (
                <div className="flex items-center bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                  <span className="w-2 h-2 bg-rose-500 rounded-full mr-2 animate-pulse" />
                  <span className="text-sm font-medium text-rose-700">
                    {noLeidas} sin leer
                  </span>
                </div>
              )}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className={COMPONENT_STYLES.button.secondary}
                >
                  {isLoading ? (
                    <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                  ) : (
                    <ArrowsClockwise className="h-4 w-4" weight="bold" />
                  )}
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 sticky top-[73px] z-10" aria-label="Secciones">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {displaySections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => navigateToModule('alertas', section.id)}
                  className={`${COMPONENT_STYLES.nav.tab} ${
                    isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                  } flex-shrink-0`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" weight={isActive ? "fill" : "bold"} />
                  <span className="whitespace-nowrap">{section.label}</span>
                  {section.id === 'alertas' && noLeidas > 0 && (
                    <span className="ml-1 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
});

AlertasHeader.displayName = 'AlertasHeader';
 