import React from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AppRoutes from './components/routing/AppRoutes';
import PageTitle from './components/routing/PageTitle';
import { useCurrentRoute } from './hooks/useRouting';

/**
 * Componente principal de la aplicación con routing
 */
function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AuthProvider>
          <PageTitle />
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </AppProvider>
  );
}

/**
 * Contenido principal de la aplicación
 */
const AppContent: React.FC = () => {
  const { currentModule, breadcrumbs } = useCurrentRoute();

  const getModuleTitle = (module: string, breadcrumbs: any[]) => {
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
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getModuleTitle(currentModule, breadcrumbs)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <AppRoutes />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default App;