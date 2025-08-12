import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowRightLeft,
  Calendar,
  FileText,
  Bell,
  Users,
  Settings,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Activity,
  Home,
  Bug,
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'establecimientos', label: 'Establecimientos', icon: Building2 },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowRightLeft },
    { id: 'planificacion', label: 'Planificación', icon: Calendar },
    { id: 'kardex', label: 'Kardex', icon: BookOpen },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'alertas', label: 'Alertas', icon: Bell },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
    { id: 'debug', label: 'Debug', icon: Bug },
  ];

  return (
    <div
      className={`bg-slate-900 text-white transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } min-h-screen relative`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="font-bold text-lg text-white">SIVAC</h1>
                <p className="text-xs text-slate-400">Sistema de Vacunas</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center px-3 py-3 mb-1 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {isActive && !sidebarCollapsed && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                DIRESA Apurímac II
              </p>
              <p className="text-xs text-slate-400 truncate">
                Estrategia Sanitaria
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;