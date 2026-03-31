import React, { memo } from 'react';
import { Key, Shield, Users } from '@phosphor-icons/react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { COMPONENT_STYLES, SectionId, USER_SECTIONS } from '../constants';

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
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <section className="overflow-hidden bg-transparent">
          <nav aria-label="Secciones de usuarios" className="px-3 py-3 sm:px-4">
            <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
              {SECTION_GROUPS.map((group) => {
                const GroupIcon = group.icon;

                return (
                  <section key={group.key} className="rounded-[18px] border border-zinc-200 bg-teal-50/60 p-2.5">
                    <div className="mb-2 flex items-center gap-2 px-1.5">
                      <GroupIcon className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          {group.label}
                        </p>
                        <p className="text-xs text-zinc-500">{group.description}</p>
                      </div>
                    </div>

                    <div className={`grid gap-2 ${group.sections.length > 1 ? 'grid-cols-1 min-[520px]:grid-cols-2' : 'grid-cols-1'}`}>
                      {group.sections.map((section) => {
                        const Icon = section.id === 'permisos' ? Key : section.icon;
                        const isActive = section.id === activeSection;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => navigateToModule('usuarios', section.id)}
                            className={`${COMPONENT_STYLES.nav.tab} ${
                              isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                            } min-w-0 w-full justify-start rounded-2xl px-3 py-3`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="flex min-w-0 flex-col items-start text-left leading-tight">
                              <span className="break-words">{section.label}</span>
                              <span className="text-[0.72rem] font-normal leading-snug text-zinc-500">
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

export default memo(UsersShell);
   