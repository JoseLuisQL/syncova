import React, { memo } from 'react';
import { KeyRound, Shield, Users } from 'lucide-react';
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
    <main className={COMPONENT_STYLES.pageBackground}>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200/90 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 shadow-lg shadow-teal-500/20">
                <Users className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Administración de cuentas, roles por defecto y auditoría de permisos bajo un mismo estándar visual del sistema.
                </p>
              </div>
            </div>
          </div>

          <nav aria-label="Secciones de usuarios" className="px-3 py-3 sm:px-4">
            <div className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
              {SECTION_GROUPS.map((group) => {
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
                        const Icon = section.id === 'permisos' ? KeyRound : section.icon;
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
                              <span className="text-[0.72rem] font-normal leading-snug text-slate-500">
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
