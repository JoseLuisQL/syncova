import React, { memo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { MODULE_LAYOUT } from '../../../styles/layout';
import { AlertSectionConfig, ALERTS_SECTIONS, SectionId } from '../constants';

interface AlertsShellProps {
  activeSection: SectionId;
  sections?: readonly AlertSectionConfig[];
  action?: React.ReactNode;
  children: React.ReactNode;
}

const AlertsShell: React.FC<AlertsShellProps> = ({
  activeSection,
  sections = ALERTS_SECTIONS,
  action,
  children,
}) => {
  const { navigateToModule } = useAppNavigation();

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-4xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <nav aria-label="Secciones de alertas" className="border-b border-[#eeeef3] bg-white">
          <div className="flex min-h-12 flex-col gap-3 px-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex h-12 items-end gap-7">
              {sections.map((section) => {
                const isActive = section.id === activeSection;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => navigateToModule('alertas', section.routeSegment)}
                    className={`-mb-px inline-flex h-12 shrink-0 items-center border-b-2 px-0 text-base font-medium transition-colors focus:outline-none ${
                      isActive
                        ? 'border-[#7c3aed] text-[#7c3aed]'
                        : 'border-transparent text-[#747986] hover:text-[#15171d]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    title={section.contextLabel}
                  >
                    {section.label}
                  </button>
                );
              })}
            </div>
            {action ? (
              <div className="flex flex-wrap items-center gap-2 pb-3 lg:h-12 lg:pb-2">{action}</div>
            ) : null}
          </div>
        </nav>

        <div className="flex flex-col gap-4 p-4 sm:p-6">{children}</div>
      </div>
    </main>
  );
};

export default memo(AlertsShell);
 