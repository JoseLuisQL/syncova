import React, { memo } from 'react';
import { useAppNavigation } from '../../../hooks/useRouting';
import { MODULE_LAYOUT } from '../../../styles/layout';
import { SectionId, USER_SECTIONS } from '../constants';

interface UsersShellProps {
  activeSection: SectionId;
  children: React.ReactNode;
}

const UsersShell: React.FC<UsersShellProps> = ({ activeSection, children }) => {
  const { navigateToModule } = useAppNavigation();

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-4xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <nav aria-label="Secciones de usuarios" className="border-b border-line-soft bg-white">
          <div className="flex h-12 items-end gap-7 px-5 sm:px-6">
            {USER_SECTIONS.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigateToModule('usuarios', section.id)}
                  className={`-mb-px inline-flex h-12 shrink-0 items-center border-b-2 px-0 text-base font-medium transition-colors focus:outline-none ${
                    isActive
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-3 hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={section.label}
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

export default memo(UsersShell);
   