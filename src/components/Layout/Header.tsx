import React, { memo } from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import UserMenu from '../auth/UserMenu';
import Breadcrumbs from '../common/Breadcrumbs';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = memo(({ title }) => {
  const { toggleMobileMenu } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left section - Menu button (mobile) + Title and Breadcrumbs */}
        <div className="min-w-0 flex-1 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-800 truncate">
                {title}
              </h1>
            </div>
            <div className="hidden sm:block">
              <Breadcrumbs />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
