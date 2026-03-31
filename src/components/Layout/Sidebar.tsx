import React, { memo, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';
import { CaretLeft, CaretRight, Buildings, X } from '@phosphor-icons/react';
import { SivacLogo } from '../common/SivacLogo';
import { MENU_SECTIONS } from './constants';
import { DESIGN_TOKENS } from '../../styles/designTokens';

const Sidebar: React.FC = memo(() => {
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const { navigateToModule } = useAppNavigation();
  const { currentModule } = useCurrentRoute();
  const { canAccessModule } = usePermissions();

  // Filtrar secciones y items segun permisos del usuario
  const filteredMenuSections = useMemo(() => {
    return MENU_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => canAccessModule(item.id))
    })).filter(section => section.items.length > 0);
  }, [canAccessModule]);

  const handleNavigation = (moduleId: string) => {
    navigateToModule(moduleId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-[100dvh]
          ${DESIGN_TOKENS.surfaces.canvas}
          border-r ${DESIGN_TOKENS.border.default}
          flex flex-col
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'lg:w-[68px]' : 'lg:w-60'}
          ${mobileMenuOpen ? 'w-60 translate-x-0' : 'w-60 -translate-x-full'}
          lg:translate-x-0
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header con Logo */}
        <div className={`h-16 flex items-center px-4 border-b ${DESIGN_TOKENS.border.soft}`}>
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebarCollapsed && !mobileMenuOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 duration-300">
              <SivacLogo size={36} />
            </div>
            <div className="min-w-0">
              <h1 className={`text-lg font-bold ${DESIGN_TOKENS.text.primary} tracking-tight`}>SIVAC</h1>
              <p className={`text-[11px] ${DESIGN_TOKENS.text.muted} font-medium -mt-0.5`}>Sistema de Vacunas</p>
            </div>
          </div>
          
          {sidebarCollapsed && !mobileMenuOpen && (
            <div className="hidden lg:flex w-10 h-10 flex-shrink-0 items-center justify-center mx-auto transition-transform hover:scale-105 duration-300">
              <SivacLogo size={36} />
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden ml-auto p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" weight="bold" />
          </button>
        </div>

        {/* Boton de colapso - solo desktop */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            hidden lg:flex
            absolute -right-3 top-[72px]
            w-6 h-6 rounded-full
            bg-white border border-zinc-200
            items-center justify-center
            text-zinc-400 hover:text-zinc-900 hover:border-zinc-300
            shadow-sm
            transition-all duration-200
            hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-zinc-500/20
            z-50
          `}
          aria-label={sidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? (
            <CaretRight className="w-3.5 h-3.5" weight="bold" />
          ) : (
            <CaretLeft className="w-3.5 h-3.5" weight="bold" />
          )}
        </button>

        {/* Navegacion */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5">
          {filteredMenuSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {/* Titulo de seccion */}
              <div 
                className={`
                  mb-2 px-3 transition-all duration-300
                  ${sidebarCollapsed && !mobileMenuOpen ? 'lg:opacity-0 lg:h-0 lg:overflow-hidden' : 'opacity-100'}
                `}
              >
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
              
              {/* Items del menu */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`
                        group relative w-full
                        flex items-center
                        ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center lg:px-0' : 'px-3'}
                        py-2.5 rounded-lg
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 hover:bg-teal-700' 
                          : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Icono */}
                      <div className={`flex-shrink-0 ${sidebarCollapsed && !mobileMenuOpen ? 'lg:mr-0' : 'mr-3'}`}>
                        <Icon 
                          weight={isActive ? "fill" : "regular"} 
                          className={`w-[18px] h-[18px] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} 
                        />
                      </div>
                      
                      {/* Label */}
                      <span 
                        className={`
                          text-[13px] font-semibold whitespace-nowrap tracking-tight
                          transition-all duration-300
                          ${sidebarCollapsed && !mobileMenuOpen ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'opacity-100'}
                        `}
                      >
                        {item.label}
                      </span>
                      
                      {/* Tooltip en modo colapsado - solo desktop */}
                      {sidebarCollapsed && !mobileMenuOpen && (
                        <div className="
                          hidden lg:block
                          absolute left-full ml-3 px-3 py-1.5
                          bg-teal-700 text-white text-xs font-medium
                          rounded-md shadow-lg border border-teal-800
                          opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible
                          transition-all duration-200
                          whitespace-nowrap z-50
                          pointer-events-none
                        ">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div 
          className={`
            border-t border-zinc-100 bg-zinc-50/50
            transition-all duration-300
            ${sidebarCollapsed && !mobileMenuOpen ? 'lg:p-3' : 'p-4'}
          `}
        >
          <div className={`flex items-center ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-lg border border-zinc-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Buildings className="w-4 h-4 text-zinc-700" weight="duotone" />
            </div>
            <div 
              className={`
                min-w-0 transition-all duration-300
                ${sidebarCollapsed && !mobileMenuOpen ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'opacity-100'}
              `}
            >
              <p className="text-sm font-semibold text-zinc-900 truncate">DISA Apurimac II</p>
              <p className="text-[10px] text-zinc-500 font-medium truncate">Estrategia Sanitaria</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
