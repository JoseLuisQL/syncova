import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Usuario } from '../types';

interface AppContextType {
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  sibotOpen: boolean;
  setSibotOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sibotExpanded: boolean;
  setSibotExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSibot: () => void;
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
    updatedAt: new Date('2024-01-01'),
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sibotOpen, setSibotOpen] = useState(false);
  const [sibotExpanded, setSibotExpanded] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleSibot = useCallback(() => {
    setSibotOpen((prev) => !prev);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileMenuOpen,
      setMobileMenuOpen,
      toggleMobileMenu,
      sibotOpen,
      setSibotOpen,
      sibotExpanded,
      setSibotExpanded,
      toggleSibot,
    }),
    [
      currentUser,
      sidebarCollapsed,
      mobileMenuOpen,
      toggleMobileMenu,
      sibotOpen,
      sibotExpanded,
      toggleSibot,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};