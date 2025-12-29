import React, { memo } from 'react';
import { Bell } from 'lucide-react';
import UserMenu from '../auth/UserMenu';
import Breadcrumbs from '../common/Breadcrumbs';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = memo(({ title }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left section - Title and Breadcrumbs */}
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

        {/* Right section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <button
            className="
              relative p-2 rounded-lg
              text-gray-400 hover:text-gray-600
              hover:bg-gray-50
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-teal-500/20
            "
            aria-label="Ver notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="
              absolute top-1.5 right-1.5
              w-2 h-2 rounded-full
              bg-teal-500
              ring-2 ring-white
            " />
          </button>

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
