import React, { memo, useMemo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { COMPONENT_STYLES, REPORTS_SECTIONS, ReportSectionConfig, SECTION_GROUPS, SectionId } from '../constants';

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
  const groupedSections = useMemo(
    () =>
      SECTION_GROUPS.map((group) => ({
        ...group,
        sections: sections.filter((section) => section.category === group.key),
      })).filter((group) => group.sections.length > 0),
    [sections],
  );
  const gridClassName = useMemo(() => {
    if (groupedSections.length <= 1) return 'grid-cols-1';
    if (groupedSections.length === 2) return 'grid-cols-1 xl:grid-cols-[1.55fr_0.9fr]';
    return 'grid-cols-1 xl:grid-cols-[1.25fr_0.78fr_0.9fr]';
  }, [groupedSections.length]);

  return (
    <main className="min-h-full bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3">
        <section className="overflow-hidden bg-transparent">
          <nav aria-label="Secciones de reportes" className="px-3 py-2.5 sm:px-4">
            <div className={`grid gap-3 ${gridClassName}`}>
              {groupedSections.map((group) => {
                const GroupIcon = group.icon;
                const innerGridClassName =
                  group.sections.length >= 3
                    ? 'grid-cols-1 min-[560px]:grid-cols-2 xl:grid-cols-3'
                    : group.sections.length === 2
                      ? 'grid-cols-1 min-[560px]:grid-cols-2'
                      : 'grid-cols-1';

                return (
                  <section key={group.key} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5">
                    <div className="mb-2 flex items-center gap-2 px-1.5">
                      <GroupIcon className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          {group.label}
                        </p>
                        <p className="hidden text-[0.72rem] text-zinc-500 sm:block">
                          {group.description}
                        </p>
                      </div>
                    </div>

                    <div className={`grid gap-2 ${innerGridClassName}`}>
                      {group.sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = section.id === activeSection;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => navigateToModule('reportes', section.routeSegment)}
                            className={`${COMPONENT_STYLES.nav.tab} ${
                              isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                            } min-w-0 w-full justify-start rounded-xl px-3 py-3`}
                            aria-current={isActive ? 'page' : undefined}
                            title={section.contextLabel}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="flex min-w-0 flex-col items-start text-left">
                              <span className="text-[0.98rem] leading-tight text-zinc-900">{section.label}</span>
                              <span className="mt-1 hidden text-[0.72rem] font-normal leading-snug text-zinc-500 md:block">
                                {section.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </nav>
        </section>

        {children}
      </div>
    </main>
  );
};

export default memo(ReportsShell);
