import React, { memo, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';
import { CaretLeft, CaretRight, Buildings, X } from '@phosphor-icons/react';
import { SivacLogo } from '../common/SivacLogo';
import { MENU_SECTIONS } from './constants';

const Sidebar: React.FC = memo(() => {
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const { navigateToModule } = useAppNavigation();
  const { currentModule } = useCurrentRoute();
  const { canAccessModule } = usePermissions();

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
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-[100dvh]
          bg-white
          border-r border-zinc-200
          flex flex-col
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'lg:w-[68px]' : 'lg:w-[240px]'}
          ${mobileMenuOpen ? 'w-[240px] translate-x-0' : 'w-[240px] -translate-x-full'}
          lg:translate-x-0
        `}
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Header con Logo */}
        <div className={`h-16 flex items-center px-5 border-b border-zinc-200 bg-white`}>
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebarCollapsed && !mobileMenuOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <SivacLogo size={32} />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-[16px] font-black text-zinc-900 tracking-tight leading-none mt-0.5">SIVAC</h1>
              <p className="text-[10px] text-zinc-500 font-bold leading-none uppercase tracking-wider mt-1">Sistema de Vacunas</p>
            </div>
          </div>
          
          {sidebarCollapsed && !mobileMenuOpen && (
            <div className="hidden lg:flex w-full flex-shrink-0 items-center justify-center transition-all duration-300">
              <SivacLogo size={32} />
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden ml-auto p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
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
            w-6 h-6 bg-white border border-zinc-200
            items-center justify-center
            text-zinc-500 hover:text-zinc-900 hover:border-zinc-400
            transition-colors
            focus:outline-none
            z-50 shadow-sm
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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 space-y-6">
          {filteredMenuSections.map((section) => (
            <div key={section.title}>
              {/* Titulo de seccion */}
              <div 
                className={`
                  mb-2 px-6 transition-all duration-300
                  ${sidebarCollapsed && !mobileMenuOpen ? 'lg:opacity-0 lg:h-0 lg:overflow-hidden' : 'opacity-100'}
                `}
              >
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">
                  {section.title}
                </span>
              </div>
              
              {/* Items del menu */}
              <div className="flex flex-col space-y-0.5">
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
                        ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center px-0' : 'px-6'}
                        py-2.5
                        transition-colors duration-200
                        ${isActive 
                          ? 'bg-teal-50/60 text-teal-700' 
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-teal-600" />
                      )}

                      {/* Icono */}
                      <div className={`flex-shrink-0 flex items-center justify-center w-5 ${sidebarCollapsed && !mobileMenuOpen ? 'mr-0' : 'mr-3.5'}`}>
                        <Icon 
                          weight={isActive ? "fill" : "regular"} 
                          className={`w-[18px] h-[18px] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} 
                        />
                      </div>
                      
                      {/* Label */}
                      <span 
                        className={`
                          text-[13px] font-bold whitespace-nowrap tracking-tight
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
                          absolute left-full ml-2 px-2.5 py-1.5
                          bg-zinc-800 text-white text-[11px] font-bold
                          border border-zinc-700 rounded-sm
                          opacity-0 invisible
                          group-hover:opacity-100 group-hover:visible
                          transition-opacity duration-150
                          whitespace-nowrap z-50
                          pointer-events-none shadow-md
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
            border-t border-zinc-200 bg-zinc-50
            transition-all duration-300
            ${sidebarCollapsed && !mobileMenuOpen ? 'lg:p-3' : 'p-5'}
          `}
        >
          <div className={`flex items-center ${sidebarCollapsed && !mobileMenuOpen ? 'lg:justify-center' : 'gap-3'}`}>
            <div className={`w-9 h-9 bg-white border border-zinc-200 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors ${currentModule === 'configuracion' ? 'border-teal-600' : ''}`}>
              <Buildings className="w-[18px] h-[18px] text-zinc-600" weight="duotone" />
            </div>
            <div 
              className={`
                min-w-0 transition-all duration-300
                ${sidebarCollapsed && !mobileMenuOpen ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'opacity-100'}
              `}
            >
              <p className="text-[13px] font-bold text-zinc-900 truncate tracking-tight">DISA Apurimac II</p>
              <p className="text-[10px] text-zinc-500 font-bold truncate uppercase tracking-widest mt-0.5">Estrategia Sanitaria</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
