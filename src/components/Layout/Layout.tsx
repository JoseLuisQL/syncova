import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { SiBotFloating } from '../SiBot/SiBotFloating';
import { useApp } from '../../contexts/AppContext';
import { useCurrentRoute } from '../../hooks/useRouting';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarCollapsed, sibotOpen, sibotExpanded } = useApp();
  const { currentModule } = useCurrentRoute();
  const { user } = useAuth();

  const canUseSiBot = user?.rol === 'administrador';
  const rightPushClass =
    canUseSiBot && sibotOpen
      ? sibotExpanded
        ? 'lg:mr-[640px]'
        : 'lg:mr-[400px]'
      : '';

  return (
    <div className="min-h-[100dvh] bg-app">
      <Sidebar />

      <div
        className={`
          min-h-[100dvh]
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'lg:ml-[100px]' : 'lg:ml-[286px]'}
          ${rightPushClass}
        `}
      >
        <Header />

        <main
          className={
            currentModule === 'dashboard'
              ? 'p-0 pb-20 lg:pb-0 [overflow-anchor:none]'
              : 'p-2.5 sm:p-6 pb-20 lg:pb-6 [overflow-anchor:none]'
          }
        >
          {children}
        </main>

        <MobileBottomNav />
      </div>

      {canUseSiBot && <SiBotFloating />}
    </div>
  );
};

export default Layout;
