import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Establecimientos from './components/Establecimientos/Establecimientos';
import Inventario from './components/Inventario/Inventario';
import Movimientos from './components/Movimientos/Movimientos';
import Planificacion from './components/Planificacion/Planificacion';
import Kardex from './components/Kardex/Kardex';
import Reportes from './components/Reportes/Reportes';
import Alertas from './components/Alertas/Alertas';
import Usuarios from './components/Usuarios/Usuarios';
import Configuracion from './components/Configuracion/Configuracion';
import VacunasDebug from './components/Debug/VacunasDebug';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');

  const getModuleTitle = (module: string) => {
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

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'establecimientos':
        return <Establecimientos />;
      case 'inventario':
        return <Inventario />;
      case 'movimientos':
        return <Movimientos />;
      case 'planificacion':
        return <Planificacion />;
      case 'kardex':
        return <Kardex />;
      case 'reportes':
        return <Reportes />;
      case 'alertas':
        return <Alertas />;
      case 'usuarios':
        return <Usuarios />;
      case 'configuracion':
        return <Configuracion />;
      case 'debug':
        return <VacunasDebug />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <ToastProvider>
        <AuthProvider>
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-100">
              <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={getModuleTitle(activeModule)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                  {renderModule()}
                </main>
              </div>
            </div>
          </ProtectedRoute>
        </AuthProvider>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;