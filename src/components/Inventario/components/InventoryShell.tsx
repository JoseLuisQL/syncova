import React, { memo } from 'react';
import { INVENTORY_SECTIONS, SectionId } from '../constants';
import { useAppNavigation } from '../../../hooks/useRouting';
import { MODULE_LAYOUT } from '../../../styles/layout';

interface InventoryShellProps {
  activeSection: SectionId;
  sections?: readonly (typeof INVENTORY_SECTIONS)[number][];
  children: React.ReactNode;
}

const InventoryShell: React.FC<InventoryShellProps> = ({
  activeSection,
  sections = INVENTORY_SECTIONS,
  children,
}) => {
  const { navigateToModule } = useAppNavigation();

  return (
    <main className="min-h-[calc(100dvh-128px)] overflow-hidden rounded-4xl border border-white/90 bg-white shadow-[0_24px_70px_-52px_rgba(12,15,24,0.72)] sm:-m-2">
      <div className={`${MODULE_LAYOUT.fullWidth} flex flex-col`}>
        <nav aria-label="Secciones de inventario" className="border-b border-line-soft bg-white">
          <div className="flex h-12 items-end gap-7 px-5 sm:px-6">
            {sections.map((section) => {
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigateToModule('inventario', section.id)}
                  className={`-mb-px inline-flex h-12 shrink-0 items-center border-b-2 px-0 text-base font-medium transition-colors focus:outline-none ${
                    isActive
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-3 hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={section.contextLabel}
                >
                  {section.contextLabel}
                </button>
              );
            })}
          </div>
        </nav>

        {children}
      </div>
    </main>
  );
};

export default memo(InventoryShell);
