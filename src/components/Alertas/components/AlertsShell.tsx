import React, { memo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { AlertSectionConfig, ALERTS_SECTIONS, COMPONENT_STYLES, SectionId } from '../constants';

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
    <main className="min-h-full bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3">
        <section className="overflow-hidden bg-transparent">
          {action ? (
            <div className="border-b border-zinc-200/90 px-4 py-4 sm:px-5 lg:px-6">
              <div className="flex flex-wrap items-center gap-2">{action}</div>
            </div>
          ) : null}

          <nav aria-label="Secciones de alertas" className="px-3 py-3 sm:px-4">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => navigateToModule('alertas', section.routeSegment)}
                    className={`${COMPONENT_STYLES.nav.tab} ${
                      isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                    } rounded-xl px-3 py-2.5`}
                    aria-current={isActive ? 'page' : undefined}
                    title={section.contextLabel}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" weight={isActive ? "fill" : "bold"} />
                    <span className="whitespace-nowrap">{section.label}</span>
                  </button>
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

export default memo(AlertsShell);
 