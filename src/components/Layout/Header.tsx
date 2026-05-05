import React, { memo } from 'react';
import { List } from '@phosphor-icons/react';
import { useApp } from '../../contexts/AppContext';
import UserMenu from '../auth/UserMenu';
import Breadcrumbs from '../common/Breadcrumbs';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = memo(({ title: _title }) => {
  const { toggleMobileMenu } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 w-full">
        {/* Left section - Menu button (mobile) + Breadcrumbs */}
        <div className="flex-1 flex items-center min-w-0 gap-3 sm:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1.5 -ml-1.5 rounded-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors duration-150"
            aria-label="Abrir menú"
          >
            <List className="h-5 w-5" weight="bold" />
          </button>

          <div className="flex items-center min-w-0 overflow-hidden">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-4">
          <NotificationBell />

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-zinc-200 mx-1" aria-hidden="true" />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
