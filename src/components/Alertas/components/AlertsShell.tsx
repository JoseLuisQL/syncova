import React, { memo } from 'react';
import { Bell } from 'lucide-react';
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
    <main className={COMPONENT_STYLES.pageBackground}>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3">
        <section className={`${COMPONENT_STYLES.nav.shell} overflow-hidden`}>
          <div className="border-b border-slate-200/90 px-4 py-4 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className={COMPONENT_STYLES.header.iconWrapper}>
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 max-w-3xl">
                  <h1 className={`${COMPONENT_STYLES.header.title} text-[1.35rem] sm:text-[1.52rem]`}>Alertas</h1>
                  <p className={`${COMPONENT_STYLES.header.subtitle} mt-0.5 text-sm leading-6 sm:text-[0.92rem]`}>
                    Monitoreo y gestión de eventos críticos.
                  </p>
                </div>
              </div>

              {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
            </div>
          </div>

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
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
