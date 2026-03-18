import React, { memo, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { COMPONENT_STYLES, SECTION_GROUPS, SectionConfig, SectionId } from '../constants';
import { useAppNavigation } from '../../../hooks/useRouting';

interface EstablishmentsShellProps {
  activeSection: SectionId;
  sections: SectionConfig[];
  children: React.ReactNode;
}

const EstablishmentsShell: React.FC<EstablishmentsShellProps> = ({
  activeSection,
  sections,
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

  return (
    <main className={COMPONENT_STYLES.pageBackground}>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <section className={`${COMPONENT_STYLES.nav.shell} overflow-hidden`}>
          <div className="border-b border-slate-200/90 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className={COMPONENT_STYLES.header.iconWrapper}>
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1 className={COMPONENT_STYLES.header.title}>Establecimientos</h1>
                  <p className={`${COMPONENT_STYLES.header.subtitle} mt-1`}>
                    Estructura territorial, centros de acopio y establecimientos bajo un mismo lenguaje operativo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Secciones de establecimientos" className="px-3 py-3 sm:px-4">
            <div className={`grid gap-3 ${groupedSections.length > 1 ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>
              {groupedSections.map((group) => {
                const GroupIcon = group.icon;

                return (
                  <section key={group.key} className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-2.5">
                    <div className="mb-2 flex items-center gap-2 px-1.5">
                      <GroupIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          {group.label}
                        </p>
                        <p className="text-xs text-slate-500">{group.description}</p>
                      </div>
                    </div>

                    <div className={`grid gap-2 ${group.sections.length > 1 ? 'grid-cols-1 min-[520px]:grid-cols-2' : 'grid-cols-1'}`}>
                      {group.sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = section.id === activeSection;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => navigateToModule('establecimientos', section.id)}
                            className={`${COMPONENT_STYLES.nav.tab} ${
                              isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                            } min-w-0 w-full justify-start rounded-2xl px-3 py-3`}
                            aria-current={isActive ? 'page' : undefined}
                            title={section.contextLabel}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="flex min-w-0 flex-col items-start text-left leading-tight">
                              <span className="break-words">{section.label}</span>
                              <span className="text-[0.72rem] font-normal leading-snug text-slate-500 min-[520px]:truncate">
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

export default memo(EstablishmentsShell);
