import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from '../types';

interface AppContextType {
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>({
    id: '1',
    nombres: 'María Elena',
    apellidos: 'Rodríguez Vargas',
    email: 'coordinadora@saludapurimac.gob.pe',
    usuario: 'mrodriguez',
    rol: 'coordinador',
    estado: 'activo',
    ultimoAcceso: new Date(),
    createdAt: new Date('2024-01-01'),
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      sidebarCollapsed,
      setSidebarCollapsed,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};