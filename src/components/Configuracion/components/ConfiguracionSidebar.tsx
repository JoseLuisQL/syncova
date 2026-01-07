import React, { memo, useState, useMemo } from 'react';
import { Menu, X, LucideIcon } from 'lucide-react';
import { CONFIG_SECTIONS, CATEGORY_LABELS, COMPONENT_STYLES } from '../constants';

interface SectionItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: string;
}

interface ConfiguracionSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  sections?: SectionItem[];
}

export const ConfiguracionSidebar: React.FC<ConfiguracionSidebarProps> = memo(({
  activeSection,
  onSectionChange,
  sections,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const displaySections = sections || CONFIG_SECTIONS;

  const sectionsByCategory = useMemo(() => {
    return displaySections.reduce((acc, section) => {
      if (!acc[section.category]) {
        acc[section.category] = [];
      }
      acc[section.category].push(section);
      return acc;
    }, {} as Record<string, typeof displaySections>);
  }, [displaySections]);

  const categories = Object.keys(sectionsByCategory) as Array<keyof typeof CATEGORY_LABELS>;

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="py-4">
      {categories.map((category, categoryIndex) => (
        <div key={category} className={categoryIndex > 0 ? 'mt-6' : ''}>
          <div className={COMPONENT_STYLES.sidebar.category}>
            {CATEGORY_LABELS[category]}
          </div>
          <div className="mt-2 px-3 space-y-1">
            {sectionsByCategory[category].map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`${COMPONENT_STYLES.sidebar.item} ${
                    isActive
                      ? COMPONENT_STYLES.sidebar.itemActive
                      : COMPONENT_STYLES.sidebar.itemInactive
                  } w-full`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{section.label}</div>
                    <div className={`text-xs ${isActive ? 'text-teal-600/70' : 'text-gray-400'}`}>
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-20 p-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar */}
          <div className={`${COMPONENT_STYLES.sidebar.containerMobile} translate-x-0`}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Secciones</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-65px)]">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${COMPONENT_STYLES.sidebar.container} overflow-y-auto h-[calc(100vh-80px)] sticky top-20`}>
        <SidebarContent />
      </aside>
    </>
  );
});

ConfiguracionSidebar.displayName = 'ConfiguracionSidebar';

export default ConfiguracionSidebar;
