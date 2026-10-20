import React, { memo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { MODULE_LAYOUT } from '../../../styles/layout';
import { AlertSectionConfig, ALERTS_SECTIONS, SectionId } from '../constants';

interface AlertsShellProps {
  activeSection: SectionId;
  sections?: readonly AlertSectionConfig[];
  action?: React.ReactNode;
  summaryMeta?: {
    total: number;
    noLeidas: number;
    criticas: number;
    hoy: number;
  };
  children: React.ReactNode;
}

const AlertsShell: React.FC<AlertsShellProps> = ({
  activeSection,
  sections = ALERTS_SECTIONS,
  action,
  summaryMeta,
  children,
}) => {
  const { navigateToModule } = useAppNavigation();
  const activeConfig = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-2xl border border-line bg-surface sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        {/* Cabecera Operativa del Centro de Alertas */}
        <header className="border-b border-line-soft bg-surface px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                Centro de Alertas
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-2">
                {activeConfig?.description || 'Monitoreo continuo de vencimientos, stock crítico y discrepancias operativas'}
              </p>
            </div>

            {action ? (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {action}
              </div>
            ) : null}
          </div>

          {/* Navegación de vistas de una sola línea */}
          <nav aria-label="Secciones de alertas" className="mt-4 -mb-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigateToModule('alertas', section.routeSegment)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-0.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none ${
                    isActive
                      ? 'border-brand text-brand font-semibold'
                      : 'border-transparent text-muted-2 hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" weight={isActive ? 'fill' : 'regular'} />
                  <span>{section.label}</span>
                  {section.id === 'alertas' && summaryMeta && summaryMeta.noLeidas > 0 ? (
                    <span className="font-mono text-xs tabular-nums text-rose-600 dark:text-rose-400">
                      ({summaryMeta.noLeidas})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="flex flex-col gap-4 p-4 sm:p-6">{children}</div>
      </div>
    </main>
  );
};

export default memo(AlertsShell);