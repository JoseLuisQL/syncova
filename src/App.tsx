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
import { useAuth } from './contexts/AuthContext';
import { SiBotFloating } from './components/SiBot/SiBotFloating';

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
  const { currentModule } = useCurrentRoute();
  const { sidebarCollapsed } = useApp();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-[100dvh] bg-[#f0eff4]">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area with dynamic margin - no margin on mobile */}
        <div 
          className={`
            min-h-[100dvh]
            transition-all duration-300 ease-out
            ${sidebarCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[286px]'}
          `}
        >
          <Header />
          
          {/* Main content */}
          <main className={currentModule === 'dashboard' ? 'p-0' : 'p-4 sm:p-6'}>
            <AppRoutes />
          </main>
          
          {/* SiBot AI Agent - Solo Administradores */}
          {user?.rol === 'administrador' && <SiBotFloating />}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default App;

