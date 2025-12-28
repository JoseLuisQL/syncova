import React from 'react';
import { REPORTS_SECTIONS, COMPONENT_STYLES } from '../constants';

interface ReportesNavProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const ReportesNav: React.FC<ReportesNavProps> = ({ activeSection, onSectionChange }) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-[73px] z-10" aria-label="Secciones">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          {REPORTS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`${COMPONENT_STYLES.nav.tab} ${
                  isActive ? COMPONENT_STYLES.nav.tabActive : COMPONENT_STYLES.nav.tabInactive
                } flex-shrink-0`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="whitespace-nowrap">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default React.memo(ReportesNav);
