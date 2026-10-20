import React, { memo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { REPORTS_SECTIONS, ReportSectionConfig, SectionId } from '../constants';
import { MODULE_LAYOUT } from '../../../styles/layout';

interface ReportsShellProps {
  activeSection: SectionId;
  sections?: readonly ReportSectionConfig[];
  action?: React.ReactNode;
  children: React.ReactNode;
}

const ReportsShell: React.FC<ReportsShellProps> = ({
  activeSection,
  sections = REPORTS_SECTIONS,
  action,
  children,
}) => {
  const { navigateToModule } = useAppNavigation();
  const activeConfig = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-2xl border border-line bg-surface sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <header className="border-b border-line-soft bg-surface px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                Centro de Reportes
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-2">
                {activeConfig?.description || 'Consultas operativas y exportaciones oficiales en formato Excel'}
              </p>
            </div>

            {action ? (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {action}
              </div>
            ) : null}
          </div>

          <nav aria-label="Secciones de reportes" className="mt-4 -mb-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigateToModule('reportes', section.routeSegment)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 border-b-2 px-0.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none ${
                    isActive
                      ? 'border-brand text-brand font-semibold'
                      : 'border-transparent text-muted-2 hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" weight={isActive ? 'fill' : 'regular'} />
                  <span>{section.label}</span>
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

export default memo(ReportsShell);
