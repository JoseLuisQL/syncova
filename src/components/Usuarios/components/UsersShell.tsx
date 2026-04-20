import React, { memo } from 'react';
import { Key, Shield, Users } from '@phosphor-icons/react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { MODULE_LAYOUT } from '../../../styles/layout';
import { SectionId, USER_SECTIONS } from '../constants';

interface UsersShellProps {
  activeSection: SectionId;
  children: React.ReactNode;
}

const SECTION_GROUPS = [
  {
    key: 'operacion',
    label: 'Operación',
    description: 'Cuentas y seguimiento operativo',
    icon: Users,
    sections: USER_SECTIONS.filter((section) => section.id === 'usuarios'),
  },
  {
    key: 'gobierno',
    label: 'Gobierno',
    description: 'Roles y catálogo de permisos',
    icon: Shield,
    sections: USER_SECTIONS.filter((section) => section.id !== 'usuarios'),
  },
] as const;

const UsersShell: React.FC<UsersShellProps> = ({ activeSection, children }) => {
  const { navigateToModule } = useAppNavigation();

  return (
    <main className="min-h-full bg-white">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col gap-4`}>
        <section className="bg-transparent border-b border-zinc-100 pb-2">
          <nav aria-label="Secciones de usuarios" className="px-3 py-3 sm:px-4">
            <div className="flex flex-wrap items-start gap-x-12 gap-y-6">
              {SECTION_GROUPS.map((group) => {
                const GroupIcon = group.icon;

                return (
                  <div key={group.key} className="flex flex-col">
                    <div className="mb-3 flex items-center gap-2 pl-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100/80 text-zinc-500">
                        <GroupIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-zinc-500">
                          {group.label}
                        </h3>
                        {group.description && (
                          <p className="mt-0.5 text-[0.65rem] font-medium text-zinc-400">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.sections.map((section) => {
                        const Icon = section.id === 'permisos' ? Key : section.icon;
                        const isActive = section.id === activeSection;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => navigateToModule('usuarios', section.id)}
                            className={`group flex items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                              isActive
                                ? 'border-teal-200 bg-teal-50/80 shadow-sm ring-1 ring-teal-100'
                                : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                            title={section.contextLabel || section.label}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-teal-600 text-white shadow-sm'
                                  : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                               <span
                                className={`text-[0.85rem] font-semibold tracking-tight transition-colors ${
                                  isActive ? 'text-teal-900' : 'text-zinc-700 group-hover:text-zinc-900'
                                }`}
                              >
                                {section.label}
                              </span>
                              {section.description && (
                                <span
                                  className={`mt-[1px] max-w-[160px] truncate text-[0.68rem] leading-tight transition-colors sm:max-w-[200px] ${
                                    isActive ? 'text-teal-700/80' : 'text-zinc-500'
                                  }`}
                                >
                                  {section.description}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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

export default memo(UsersShell);
   