import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { AlertasProvider } from './contexts/AlertasContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AppRoutes from './components/routing/AppRoutes';
import PageTitle from './components/routing/PageTitle';
import { useCurrentRoute } from './hooks/useRouting';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AuthProvider>
          <AlertasProvider>
            <PageTitle />
            <AppContent />
          </AlertasProvider>
        </AuthProvider>
      </ToastProvider>
    </AppProvider>
  );
}

const AppContent: React.FC = () => {
  const { currentModule, breadcrumbs } = useCurrentRoute();
  const { sidebarCollapsed } = useApp();

  const getModuleTitle = (module: string, breadcrumbs: { label: string; path: string; isLast: boolean }[]) => {
    if (breadcrumbs.length > 1) {
      return breadcrumbs[breadcrumbs.length - 1].label;
    }

    switch (module) {
      case 'dashboard': return 'Dashboard';
      case 'establecimientos': return 'Establecimientos';
      case 'inventario': return 'Inventario';
      case 'movimientos': return 'Movimientos';
      case 'planificacion': return 'Planificación';
      case 'kardex': return 'Kardex';
      case 'reportes': return 'Reportes';
      case 'alertas': return 'Alertas';
      case 'usuarios': return 'Usuarios';
      case 'configuracion': return 'Configuración';
      case 'debug': return 'Debug - Vacunas';
      default: return 'Dashboard';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area with dynamic margin */}
        <div 
          className={`
            min-h-screen
            transition-all duration-300 ease-out
            ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}
          `}
        >
          {/* Header */}
          <Header title={getModuleTitle(currentModule, breadcrumbs)} />
          
          {/* Main content */}
          <main className="p-4 sm:p-6">
            <AppRoutes />
          </main>
        </div>
        
        {/* Mobile overlay when sidebar is open */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => {}}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default App;
