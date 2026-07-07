import React, { memo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { REPORTS_SECTIONS, ReportSectionConfig, SectionId } from '../constants';
import { MODULE_LAYOUT } from '../../../styles/layout';

interface ReportsShellProps {
  activeSection: SectionId;
  sections?: readonly ReportSectionConfig[];
  children: React.ReactNode;
}

const ReportsShell: React.FC<ReportsShellProps> = ({
  activeSection,
  sections = REPORTS_SECTIONS,
  children,
}) => {
  const { navigateToModule } = useAppNavigation();

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-4xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <nav aria-label="Secciones de reportes" className="border-b border-[#eeeef3] bg-white">
          <div className="flex h-12 items-end gap-7 px-5 sm:px-6">
            {sections.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigateToModule('reportes', section.routeSegment)}
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
        </nav>

        <div className="flex flex-col gap-4 p-4 sm:p-6">{children}</div>
      </div>
    </main>
  );
};

export default memo(ReportsShell);
