import React, { memo, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAppNavigation, useCurrentRoute } from '../../hooks/useRouting';
import { usePermissions } from '../../hooks/usePermissions';
import { Activity, ChevronLeft, ChevronRight, Building } from 'lucide-react';
import { MENU_SECTIONS } from './constants';

const Sidebar: React.FC = memo(() => {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const { navigateToModule } = useAppNavigation();
  const { currentModule } = useCurrentRoute();
  const { canAccessModule } = usePermissions();

  // Filtrar secciones y items según permisos del usuario
  const filteredMenuSections = useMemo(() => {
    return MENU_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item => canAccessModule(item.id))
    })).filter(section => section.items.length > 0);
  }, [canAccessModule]);

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen
        bg-white
        border-r border-gray-200/80
        flex flex-col
        transition-all duration-300 ease-out
        shadow-sm
        ${sidebarCollapsed ? 'w-[68px]' : 'w-60'}
      `}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Header con Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20 flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">SIVAC</h1>
            <p className="text-[11px] text-gray-400 font-medium -mt-0.5">Sistema de Vacunas</p>
          </div>
        </div>
        
        {sidebarCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20 mx-auto">
            <Activity className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Botón de colapso */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`
          absolute -right-3 top-[72px]
          w-6 h-6 rounded-full
          bg-white border border-gray-200
          flex items-center justify-center
          text-gray-400 hover:text-teal-600 hover:border-teal-300
          shadow-md
          transition-all duration-200
          hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-teal-500/30
          z-50
        `}
        aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        aria-expanded={!sidebarCollapsed}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        {filteredMenuSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-5' : ''}>
            {/* Título de sección */}
            <div 
              className={`
                mb-2 px-3 transition-all duration-300
                ${sidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}
              `}
            >
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </span>
            </div>
            
            {/* Items del menú */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToModule(item.id)}
                    className={`
                      group relative w-full
                      flex items-center
                      ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'}
                      py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {/* Icono */}
                    <div className={`flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`}>
                      <Icon className={`w-[18px] h-[18px] transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-105'}`} />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className={`
                        text-[13px] font-medium whitespace-nowrap
                        transition-all duration-300
                        ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}
                      `}
                    >
                      {item.label}
                    </span>
                    
                    {/* Tooltip en modo colapsado */}
                    {sidebarCollapsed && (
                      <div className="
                        absolute left-full ml-3 px-3 py-1.5
                        bg-gray-800 text-white text-xs font-medium
                        rounded-lg shadow-lg
                        opacity-0 invisible
                        group-hover:opacity-100 group-hover:visible
                        transition-all duration-200
                        whitespace-nowrap z-50
                        pointer-events-none
                      ">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45" />
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
          border-t border-gray-100 bg-gray-50/50
          transition-all duration-300
          ${sidebarCollapsed ? 'p-3' : 'p-4'}
        `}
      >
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
            <Building className="w-4 h-4 text-teal-600" />
          </div>
          <div 
            className={`
              min-w-0 transition-all duration-300
              ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'}
            `}
          >
            <p className="text-sm font-medium text-gray-700 truncate">DISA Apurímac II</p>
            <p className="text-[10px] text-gray-400 truncate">Estrategia Sanitaria</p>
          </div>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
