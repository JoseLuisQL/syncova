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
        <section className="bg-transparent border-b border-zinc-100 pb-2">
          {action ? (
            <div className="border-b border-zinc-200/90 px-4 py-4 sm:px-5 lg:px-6 mb-2">
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
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                      isActive
                        ? 'border-teal-200 bg-teal-50/80 shadow-sm ring-1 ring-teal-100'
                        : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    title={section.contextLabel}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" weight={isActive ? "fill" : "bold"} />
                    </div>
                    <div className="flex flex-col items-start text-left">
                       <span
                        className={`text-[0.85rem] font-semibold tracking-tight transition-colors ${
                          isActive ? 'text-teal-900' : 'text-zinc-700 group-hover:text-zinc-900'
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>
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
 